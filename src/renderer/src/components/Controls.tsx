import { ArrowLeft, ArrowRight, RotateCw, Settings } from 'lucide-react'
import React from 'react'
import type { DnsConfig } from '../../../types/ipc'
import type { NavState } from '../../../types/renderer'
import { OS_DEFAULT_VALUE } from '../constants'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ControlsProps {
  navState: NavState
  dnsList: DnsConfig[]
  selectedDnsHost: string
  isWebViewReady: boolean
  onNavigate: (action: 'back' | 'forward' | 'reload') => void
  onLoadUrl: (url: string) => void
  onDnsChange: (newHost: string) => void
  onEditDns: () => void
}

export function Controls({
  navState,
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
      let url = e.currentTarget.value.trim()
      // ★ 要件1: 入力が空の場合は 'about:blank' を読み込む
      if (url === '') {
        onLoadUrl('about:blank')
        return
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      onLoadUrl(url)
    }
  }

  // ★ 要件2: URLが 'about:blank' の場合は表示上、空文字にする
  const displayUrl = navState.url === 'about:blank' ? '' : navState.url

  return (
    <div className="flex h-14 items-center gap-2 border-b bg-secondary/50 px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('back')}
        disabled={!navState.canGoBack || !isWebViewReady}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('forward')}
        disabled={!navState.canGoForward || !isWebViewReady}
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

      <Input
        type="text"
        id="url-input"
        placeholder={isWebViewReady ? 'URLを入力してください' : 'Loading...'}
        // ★ 表示用のURLを defaultValue と key に使用する
        defaultValue={displayUrl}
        key={displayUrl}
        onKeyDown={handleUrlSubmit}
        className="h-9"
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
