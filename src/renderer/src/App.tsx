import React from 'react'
import './assets/App.css'
import { Controls } from './components/Controls'
import { DnsDialog } from './components/DnsDialog'
import { ErrorDisplay } from './components/ErrorDisplay'
import { WebView } from './components/WebView'
import { WelcomeSplash } from './components/WelcomeSplash'
import { useDns } from './hooks/useDns'
import { useWebView } from './hooks/useWebView'

function App(): React.JSX.Element {
  const {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
    handleNavigate,
    handleLoadUrl,
    eventHandlers
  } = useWebView()

  const { dnsList, selectedDns, isModalOpen, setIsModalOpen, handleDnsChange, handleSaveDnsList } =
    useDns({
      onDnsChangeCallback: () => {
        if (isWebViewReady && navState.url) {
          handleNavigate('reload')
        }
      }
    })

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
        {/* ★ URLが初期状態('')または'about:blank'の時にWelcomeSplashを表示 */}
        {(navState.url === '' || navState.url === 'about:blank') && <WelcomeSplash />}
        <WebView ref={webviewRef} {...eventHandlers} />
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
