import { ArrowLeft, ArrowRight, Lock, LockOpen, RotateCw, Settings } from 'lucide-react'; // ★ Lock, LockOpen 追加
import React from 'react'
import type { DnsConfig } from '../../../types/ipc'
import { OS_DEFAULT_VALUE } from '../constants'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ControlsProps {
  canGoBack: boolean // ★ navState から分離
  canGoForward: boolean // ★ navState から分離
  navDisplayUrl: string // ★ onBlurで戻すためのURL
  protocol: 'http:' | 'https:' // ★ 追加
  setProtocol: React.Dispatch<React.SetStateAction<'http:' | 'https:'>> // ★ 追加
  displayUrl: string // ★ 追加
  setDisplayUrl: React.Dispatch<React.SetStateAction<string>> // ★ 追加
  dnsList: DnsConfig[]
  selectedDnsHost: string
  isWebViewReady: boolean
  onNavigate: (action: 'back' | 'forward' | 'reload') => void
  onLoadUrl: (url: string) => void
  onDnsChange: (newHost: string) => void
  onEditDns: () => void
}

export function Controls({
  canGoBack, // ★
  canGoForward, // ★
  navDisplayUrl, // ★
  protocol, // ★
  setProtocol, // ★
  displayUrl, // ★
  setDisplayUrl, // ★
  dnsList,
  selectedDnsHost,
  isWebViewReady,
  onNavigate,
  onLoadUrl,
  onDnsChange,
  onEditDns
}: ControlsProps): React.JSX.Element {
  // ★ 要件2: Enterキー押下時の処理
  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      let url = displayUrl.trim()
      // ★ 要件1: 入力が空の場合は 'about:blank' を読み込む
      if (url === '') {
        onLoadUrl('about:blank')
        return
      }

      // ★ プロトコルが入力されていない場合、stateから補完する
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = protocol + url
      }
      onLoadUrl(url)
      // 送信後、フォーカスを外す
      e.currentTarget.blur()
    }
  }

  // ★ 要件2-1, 2-3: 入力中の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.currentTarget.value
    setDisplayUrl(value)

    // ★ 入力値に応じてプロトコル state を自動更新
    if (value.startsWith('http://')) {
      setProtocol('http:')
    } else if (value.startsWith('https://')) {
      setProtocol('https:')
    }
  }

  // ★ 要件2-3: フォーカス時の処理
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    // ★ 表示が省略されている場合のみ、完全なURLに戻す
    if (navDisplayUrl === displayUrl && displayUrl !== '') {
      setDisplayUrl(protocol + displayUrl)
    }
    // ★ テキストを全選択する
    e.currentTarget.select()
  }

  // ★ 要件2-3: フォーカスが外れた時の処理
  const handleInputBlur = (): void => {
    // ★ 現在のナビゲーションの表示URL（ドメインのみ）に戻す
    //    少し遅延を入れないと、Enter押下時のonSubmitより先にblurが発火する場合がある
    setTimeout(() => {
      setDisplayUrl(navDisplayUrl)
    }, 100)
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

      {/* ★ プロトコルトグルボタン */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-20 px-2 text-muted-foreground"
        onClick={() => setProtocol((p) => (p === 'https:' ? 'http:' : 'https:'))}
        disabled={!isWebViewReady}
      >
        {protocol === 'https:' ? (
          <Lock className="h-4 w-4" />
        ) : (
          <LockOpen className="h-4 w-4 text-destructive" />
        )}
        <span className={protocol === 'https:' ? '' : 'text-destructive'}>
          {protocol === 'https:' ? 'https' : 'http'}
        </span>
      </Button>

      <Input
        type="text"
        id="url-input"
        placeholder={isWebViewReady ? 'URLを入力してください' : 'Loading...'}
        // ★ 要件1: スペルチェック無効化
        spellCheck={false}
        // ★ 要件2: 制御コンポーネント化
        value={displayUrl}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleUrlSubmit}
        className="h-9 flex-1" // ★ w-full を flex-1 に変更
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