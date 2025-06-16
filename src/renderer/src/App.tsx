// src/renderer/src/App.tsx
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
  // webviewKey は不要になります
  // const [webviewKey, setWebviewKey] = useState(1)

  const {
    webviewRef,
    navState,
    loadError,
    isWebViewReady,
    handleNavigate,
    handleLoadUrl,
    eventHandlers
    // useWebView から key を取り除く
  } = useWebView(/* key を渡さない */)

  const { dnsList, selectedDns, isModalOpen, setIsModalOpen, handleDnsChange, handleSaveDnsList } =
    useDns({
      onDnsChangeCallback: () => {
        if (navState.url && navState.url !== 'about:blank') {
          // DNS変更時にキャッシュを無視して強制リロード
          handleNavigate('reload')
        } else {
          handleLoadUrl('about:blank') // 例: about:blank に戻す
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
