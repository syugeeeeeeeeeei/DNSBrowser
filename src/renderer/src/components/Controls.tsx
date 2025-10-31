import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Lock, LockOpen, RotateCw, Settings } from 'lucide-react'; // ★ Lock / LockOpen が必要
import React from 'react'
import type { DnsConfig } from '../../../types/ipc'
import { OS_DEFAULT_VALUE } from '../constants'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

interface ControlsProps {
  canGoBack: boolean
  canGoForward: boolean
  navDisplayUrl: string
  protocol: 'http:' | 'https:'
  setProtocol: React.Dispatch<React.SetStateAction<'http:' | 'https:'>>
  displayUrl: string
  setDisplayUrl: React.Dispatch<React.SetStateAction<string>>
  dnsList: DnsConfig[]
  selectedDnsHost: string
  isWebViewReady: boolean
  onNavigate: (action: 'back' | 'forward' | 'reload') => void
  onLoadUrl: (url: string) => void
  onDnsChange: (newHost: string) => void
  onEditDns: () => void
}

export function Controls({
  canGoBack,
  canGoForward,
  navDisplayUrl,
  protocol,
  setProtocol,
  displayUrl,
  setDisplayUrl,
  dnsList,
  selectedDnsHost,
  isWebViewReady,
  onNavigate,
  onLoadUrl,
  onDnsChange,
  onEditDns
}: ControlsProps): React.JSX.Element {
  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      let url = displayUrl.trim()
      if (url === '') {
        onLoadUrl('about:blank')
        return
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = protocol + '//' + url
      }
      onLoadUrl(url)
      e.currentTarget.blur()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.currentTarget.value
    setDisplayUrl(value)

    if (value.startsWith('http://')) {
      setProtocol('http:')
    } else if (value.startsWith('https://')) {
      setProtocol('https:')
    }
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (displayUrl.startsWith('http://') || displayUrl.startsWith('https://')) {
      e.currentTarget.select()
      return
    }

    if (navDisplayUrl !== '') {
      setDisplayUrl(protocol + '//' + navDisplayUrl)
    }
    e.currentTarget.select()
  }

  const handleInputBlur = (): void => {
    setTimeout(() => {
      setDisplayUrl(navDisplayUrl)
    }, 100)
  }

  const handleProtocolSwitch = (newProtocol: string): void => {
    if (newProtocol !== 'http:' && newProtocol !== 'https:') {
      setProtocol(protocol)
      return
    }

    setProtocol(newProtocol as 'http:' | 'https:')

    if (navDisplayUrl !== '' && navDisplayUrl === displayUrl) {
      onLoadUrl(newProtocol + '//' + navDisplayUrl)
    }
  }

  return (
    <div className="flex h-14 items-center gap-2 border-b bg-secondary/50 px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('back')}
        disabled={!canGoBack || !isWebViewReady}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('forward')}
        disabled={!canGoForward || !isWebViewReady}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('reload')}
        disabled={!isWebViewReady}
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      {/* ★ 修正: ToggleGroupItem の内部にアイコンとテキストを追加 */}
      <ToggleGroup
        type="single"
        size="sm" // ★ サイズを 'sm' (h-8) に変更
        value={protocol}
        onValueChange={handleProtocolSwitch}
        disabled={!isWebViewReady}
      >
        <ToggleGroupItem
          value="http:"
          aria-label="Toggle http"
          className={cn(
            'gap-1.5', // ★ アイコンとテキストの隙間
            protocol === 'http:'
              ? 'data-[state=on]:text-destructive' // ★ ONの時は赤文字
              : 'text-muted-foreground' // OFFの時はグレー
          )}
        >
          <LockOpen className="size-3.5" />
          http
        </ToggleGroupItem>
        <ToggleGroupItem
          value="https:"
          aria-label="Toggle https"
          className={cn(
            'gap-1.5', // ★ アイコンとテキストの隙間
            protocol === 'https:' ? 'text-primary' : 'text-muted-foreground' // ★ ON/OFFで色分け
          )}
        >
          <Lock className="size-3.5" />
          https
        </ToggleGroupItem>
      </ToggleGroup>

      <Input
        type="text"
        id="url-input"
        placeholder={isWebViewReady ? 'URLを入力してください' : 'Loading...'}
        spellCheck={false}
        value={displayUrl}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleUrlSubmit}
        className="h-9 flex-1"
        disabled={!isWebViewReady}
      />

      <div className="flex items-center gap-2">
        <Select onValueChange={onDnsChange} value={selectedDnsHost}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Select DNS" />
          </SelectTrigger>
          <SelectContent>
            {dnsList.map((dns) => (
              <SelectItem key={dns.name} value={dns.host === '' ? OS_DEFAULT_VALUE : dns.host}>
                {dns.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={onEditDns}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
