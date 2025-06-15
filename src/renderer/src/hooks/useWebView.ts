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
  handleNavigate: (action: 'back' | 'forward' | 'reload') => void
  handleLoadUrl: (url: string) => void
  eventHandlers: WebViewProps
}

export function useWebView(): UseWebView {
  const webviewRef = useRef<WebviewTag>(null)
  const [isWebViewReady, setIsWebViewReady] = useState(false)
  const [navState, setNavState] = useState<NavState>({
    url: '',
    canGoBack: false,
    canGoForward: false
  })
  const [loadError, setLoadError] = useState<LoadError | null>(null)

  const handleNavigate = useCallback(
    (action: 'back' | 'forward' | 'reload'): void => {
      const wv = webviewRef.current
      if (!wv) return

      if (action === 'reload' && loadError) {
        setLoadError(null)
      }

      if (action === 'reload') wv.reload()
      else if (action === 'back') wv.goBack()
      else if (action === 'forward') wv.goForward()
    },
    [loadError]
  )

  const handleLoadUrl = useCallback((url: string): void => {
    if (webviewRef.current && url) {
      setLoadError(null)
      webviewRef.current.loadURL(url)
    }
  }, [])

  const updateNavState = useCallback(() => {
    const wv = webviewRef.current
    if (wv) {
      setNavState({
        url: wv.getURL(),
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward()
      })
    }
  }, [])

  const handleDomReady = useCallback(() => {
    setIsWebViewReady(true)
  }, [])

  const handleDidStartNavigation = useCallback((): void => {
    setLoadError(null)
  }, [])

  const handleFailLoad = useCallback((e: Electron.DidFailLoadEvent): void => {
    if (e.errorCode === -3 || !e.isMainFrame) return
    setLoadError({
      code: e.errorCode,
      description: e.errorDescription,
      url: e.validatedURL
    })
  }, [])

  return {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
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
