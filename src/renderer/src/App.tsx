import React, { useEffect, useState } from 'react'
import './assets/App.css'
import { Controls } from './components/Controls'
import { DnsDialog } from './components/DnsDialog'
import { ErrorDisplay } from './components/ErrorDisplay'
import { WebView } from './components/WebView'
import { WelcomeSplash } from './components/WelcomeSplash'
import { useDns } from './hooks/useDns'
import { useWebView } from './hooks/useWebView'

function App(): React.JSX.Element {
  const [webviewKey, setWebviewKey] = useState(1)

  // ★ useWebViewにwebviewKeyを渡す
  const {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
    handleNavigate,
    handleLoadUrl,
    eventHandlers
  } = useWebView(webviewKey)

  const { dnsList, selectedDns, isModalOpen, setIsModalOpen, handleDnsChange, handleSaveDnsList } =
    useDns({
      onDnsChangeCallback: () => { /* no-op */ }
    })

  const [urlToReload, setUrlToReload] = useState<string | null>(null)

  useEffect(() => {
    const removeListener = window.api.onForceReload(() => {
      if (navState.url && navState.url !== 'about:blank') {
        setUrlToReload(navState.url)
        setWebviewKey((prevKey) => prevKey + 1)
      }
    })
    return () => removeListener()
  }, [navState.url])

  useEffect(() => {
    if (urlToReload && isWebViewReady) {
      handleLoadUrl(urlToReload)
      setUrlToReload(null)
    }
  }, [urlToReload, isWebViewReady, handleLoadUrl])


  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Controls
        navState={navState}
        dnsList={dnsList}
        selectedDnsHost={selectedDns}
        isWebViewReady={isWebViewReady}
        onNavigate={handleNavigate}
        onLoadUrl={handleLoadUrl}
        onDnsChange={handleDnsChange}
        onEditDns={() => setIsModalOpen(true)}
      />
      <div className="relative flex-grow">
        {(navState.url === '' || navState.url === 'about:blank') && <WelcomeSplash />}
        <WebView key={webviewKey} ref={webviewRef} {...eventHandlers} />
        {loadError && <ErrorDisplay error={loadError} onReload={() => handleNavigate('reload')} />}
      </div>
      <DnsDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentList={dnsList}
        onSave={handleSaveDnsList}
      />
    </div>
  )
}

export default App