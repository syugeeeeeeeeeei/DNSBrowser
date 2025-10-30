// src/renderer/src/hooks/useWebView.ts
import type { WebviewTag } from 'electron'
import type { RefObject } from 'react'
import { useCallback, useRef, useState } from 'react'
import type { LoadError, NavState } from '../../../types/renderer'
import type { WebViewProps } from '../components/WebView'

export interface UseWebView {
  webviewRef: RefObject<WebviewTag | null>
  navState: NavState
  loadError: LoadError | null
  isWebViewReady: boolean
  isLoading: boolean // ★ 追加
  handleNavigate: (action: 'back' | 'forward' | 'reload') => void
  handleLoadUrl: (url: string) => void
  eventHandlers: WebViewProps
}

export function useWebView(): UseWebView {
  const webviewRef = useRef<WebviewTag>(null)
  const [isWebViewReady, setIsWebViewReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // ★ 追加
  const [navState, setNavState] = useState<NavState>({
    url: '',
    canGoBack: false,
    canGoForward: false,
    protocol: 'https:', // ★ 追加
    displayUrl: '' // ★ 追加
  })
  const [loadError, setLoadError] = useState<LoadError | null>(null)

  const handleNavigate = useCallback(
    (action: 'back' | 'forward' | 'reload'): void => {
      const wv = webviewRef.current
      if (!wv) return

      if (action === 'reload' && loadError) {
        setLoadError(null)
      }
      setIsLoading(true) // ★ ナビゲーション開始時にローディング

      if (action === 'reload') wv.reload()
      else if (action === 'back') wv.goBack()
      else if (action === 'forward') wv.goForward()
    },
    [loadError]
  )

  const handleLoadUrl = useCallback((url: string): void => {
    if (webviewRef.current && url) {
      setLoadError(null)
      setIsLoading(true) // ★ URL読み込み開始時にローディング
      webviewRef.current.loadURL(url)
    }
  }, [])

  const updateNavState = useCallback(() => {
    const wv = webviewRef.current
    if (wv) {
      const currentUrl = wv.getURL()
      let protocol: 'http:' | 'https:' = 'https:'
      let displayUrl = ''

      // ★ URLを解析して protocol と displayUrl を設定
      if (currentUrl && currentUrl !== 'about:blank') {
        try {
          const urlObj = new URL(currentUrl)
          protocol = urlObj.protocol as 'http:' | 'https:'
          // ホスト名 + パス名 + 検索クエリ
          displayUrl = urlObj.hostname + urlObj.pathname + urlObj.search
          // ルートパスで末尾が / の場合のみ削除 (e.g., "example.com/" -> "example.com")
          if (urlObj.pathname === '/' && urlObj.search === '') {
            displayUrl = urlObj.hostname
          }
        } catch (e) {
          console.error('Invalid URL in webview:', currentUrl)
          displayUrl = currentUrl // 解析失敗時はそのまま表示
        }
      }

      setNavState({
        url: currentUrl,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
        protocol, // ★ 設定
        displayUrl // ★ 設定
      })
      setIsLoading(false) // ★ ナビゲーション完了でローディング終了
    }
  }, [])

  const handleDomReady = useCallback(() => {
    setIsWebViewReady(true)
  }, [])

  const handleDidStartNavigation = useCallback((): void => {
    setLoadError(null)
    setIsLoading(true) // ★ ローディング開始
  }, [])

  const handleFailLoad = useCallback((e: Electron.DidFailLoadEvent): void => {
    if (e.errorCode === -3 || !e.isMainFrame) return
    setLoadError({
      code: e.errorCode,
      description: e.errorDescription,
      url: e.validatedURL
    })
    setIsLoading(false) // ★ ローディング終了
  }, [])

  return {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
    isLoading, // ★ 追加
    handleNavigate,
    handleLoadUrl,
    eventHandlers: {
      onDomReady: handleDomReady,
      onDidStartNavigation: handleDidStartNavigation,
      onDidNavigate: updateNavState,
      onDidFinishLoad: updateNavState,
      onDidFailLoad: handleFailLoad
    }
  }
}