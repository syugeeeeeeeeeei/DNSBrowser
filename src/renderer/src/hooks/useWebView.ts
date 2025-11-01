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
  isLoading: boolean
  handleNavigate: (action: 'back' | 'forward' | 'reload') => void
  handleLoadUrl: (url: string) => void
  eventHandlers: WebViewProps
}

export function useWebView(): UseWebView {
  const webviewRef = useRef<WebviewTag>(null)
  const [isWebViewReady, setIsWebViewReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [navState, setNavState] = useState<NavState>({
    url: '',
    canGoBack: false,
    canGoForward: false,
    protocol: 'https:',
    displayUrl: ''
  })
  const [loadError, setLoadError] = useState<LoadError | null>(null)

  const handleNavigate = useCallback(
    (action: 'back' | 'forward' | 'reload'): void => {
      const wv = webviewRef.current
      if (!wv) return

      console.log(`[WebView Event] handleNavigate: ${action} が呼ばれました。`) // ★ ログ

      if (action === 'reload') {
        setLoadError(null)
      }

      // ★ ユーザー起点のローディング開始
      setIsLoading(true)
      console.log(`[WebView State] isLoading: true (handleNavigate)`) // ★ ログ

      if (action === 'reload') wv.reload()
      else if (action === 'back') wv.goBack()
      else if (action === 'forward') wv.goForward()
    },
    []
  )

  const handleLoadUrl = useCallback((url: string): void => {
    if (webviewRef.current && url) {
      console.log(`[WebView Event] handleLoadUrl: ${url} が呼ばれました。`) // ★ ログ
      setLoadError(null)
      // ★ ユーザー起点のローディング開始
      setIsLoading(true)
      console.log(`[WebView State] isLoading: true (handleLoadUrl)`) // ★ ログ
      webviewRef.current.loadURL(url)
    }
  }, [])

  const updateNavState = useCallback(() => {
    const wv = webviewRef.current
    if (wv) {
      const currentUrl = wv.getURL()
      let protocol: 'http:' | 'https:' = 'https:'
      let displayUrl = ''

      if (currentUrl && currentUrl !== 'about:blank') {
        try {
          const urlObj = new URL(currentUrl)
          protocol = urlObj.protocol as 'http:' | 'https:'
          displayUrl = urlObj.hostname + urlObj.pathname + urlObj.search
          if (urlObj.pathname === '/' && urlObj.search === '') {
            displayUrl = urlObj.hostname
          }
        } catch (e) {
          console.error('Invalid URL in webview:', currentUrl)
          displayUrl = currentUrl
        }
      }

      setNavState({
        url: currentUrl,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
        protocol,
        displayUrl
      })
    }
  }, [])

  const handleDomReady = useCallback(() => {
    console.log('[WebView Event] dom-ready: WebViewの準備ができました。') // ★ ログ
    setIsWebViewReady(true)
  }, [])

  const handleDidStartNavigation = useCallback((e: Electron.DidStartNavigationEvent): void => {
    console.log(
      `[WebView Event] did-start-navigation: isMainFrame=${e.isMainFrame}, URL=${e.url}`
    )

    if (e.isMainFrame) {
      setLoadError(null)
      // ★ 修正: ここでは isLoading を true にしない
      // setIsLoading(true) 
      // console.log(`[WebView State] isLoading: true (did-start-navigation)`)
    }
  }, [])

  const handleDidNavigate = useCallback((e: Electron.DidNavigateEvent) => {
    console.log(`[WebView Event] did-navigate: URL=${e.url}`) // ★ ログ
    updateNavState()
  }, [updateNavState])

  const handleDidFinishLoad = useCallback(() => {
    console.log('[WebView Event] did-finish-load: 読み込みが完了しました。') // ★ ログ
    // ★ 読み込み完了でローディングを終了
    setIsLoading(false)
    console.log(`[WebView State] isLoading: false (did-finish-load)`) // ★ ログ
    updateNavState()
  }, [updateNavState])

  const handleFailLoad = useCallback((e: Electron.DidFailLoadEvent): void => {
    console.warn(
      `[WebView Event] did-fail-load: isMainFrame=${e.isMainFrame}, Code=${e.errorCode}, URL=${e.validatedURL}`
    )

    if (!e.isMainFrame) return

    if (e.errorCode === -3) {
      console.log('[WebView Event] did-fail-load: ユーザーによる中断 (ERR_ABORTED) のため、ローディングのみ終了します。') // ★ ログ
      setIsLoading(false)
      console.log(`[WebView State] isLoading: false (did-fail-load, ERR_ABORTED)`) // ★ ログ
      return
    }

    setLoadError({
      code: e.errorCode,
      description: e.errorDescription,
      url: e.validatedURL
    })
    setIsLoading(false) // ★ ローディング終了
    console.log(`[WebView State] isLoading: false (did-fail-load)`) // ★ ログ
  }, [])

  return {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
    isLoading,
    handleNavigate,
    handleLoadUrl,
    eventHandlers: {
      onDomReady: handleDomReady,
      onDidStartNavigation: handleDidStartNavigation,
      onDidNavigate: handleDidNavigate,
      onDidFinishLoad: handleDidFinishLoad,
      onDidFailLoad: handleFailLoad
    }
  }
}