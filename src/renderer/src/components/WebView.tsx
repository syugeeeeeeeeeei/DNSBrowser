import React, { forwardRef, useEffect } from 'react'

export interface WebViewProps {
  onDomReady: () => void
  onDidStartNavigation: (e: Electron.DidStartNavigationEvent) => void
  onDidNavigate: (e: Electron.DidNavigateEvent) => void
  onDidFinishLoad: () => void
  onDidFailLoad: (e: Electron.DidFailLoadEvent) => void
}

export const WebView = forwardRef<Electron.WebviewTag, WebViewProps>((props, ref) => {
  // ★ useEffectを使って、コンポーネントのマウント/アンマウント時に
  //    イベントリスナーの登録と解除を自動的に行う
  useEffect(() => {
    const wv = (ref as React.RefObject<Electron.WebviewTag>)?.current
    if (!wv) return

    // 親から渡されたコールバック関数をイベントリスナーとして登録
    wv.addEventListener('dom-ready', props.onDomReady)
    wv.addEventListener('did-start-navigation', props.onDidStartNavigation) // ★ 追加
    wv.addEventListener('did-navigate', props.onDidNavigate)
    wv.addEventListener('did-finish-load', props.onDidFinishLoad)
    wv.addEventListener('did-fail-load', props.onDidFailLoad)

    // コンポーネントがアンマウントされる際にリスナーを解除するクリーンアップ関数
    return () => {
      wv.removeEventListener('dom-ready', props.onDomReady)
      wv.removeEventListener('did-start-navigation', props.onDidStartNavigation) // ★ 追加
      wv.removeEventListener('did-navigate', props.onDidNavigate)
      wv.removeEventListener('did-finish-load', props.onDidFinishLoad)
      wv.removeEventListener('did-fail-load', props.onDidFailLoad)
    }
    // refと各propsが変更された場合に再設定するように依存配列を指定
  }, [
    ref,
    props.onDomReady,
    props.onDidStartNavigation, // ★ 追加
    props.onDidNavigate,
    props.onDidFinishLoad,
    props.onDidFailLoad
  ])

  return (
    <webview
      ref={ref}
      src="about:blank"
      // eslint-disable-next-line react/no-unknown-property
      partition="persist:dns_browser_session"
      className="h-full w-full"
    ></webview>
  )
})

WebView.displayName = 'WebView'
