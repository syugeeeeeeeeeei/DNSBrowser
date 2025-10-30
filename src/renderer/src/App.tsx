// src/renderer/src/App.tsx
import React, { useEffect, useState } from 'react'
import './assets/App.css'
import { Controls } from './components/Controls'
import { DnsDialog } from './components/DnsDialog'
import { ErrorDisplay } from './components/ErrorDisplay'
import { LoadingOverlay } from './components/LoadingOverlay'; // ★ 追加
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './components/ui/dialog'
import { Progress } from './components/ui/progress'
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
    isLoading, // ★ 追加
    handleNavigate,
    handleLoadUrl,
    eventHandlers
  } = useWebView()

  // ★ プロトコルと表示URLの state を追加
  const [protocol, setProtocol] = useState<'http:' | 'https:'>('https:')
  const [displayUrl, setDisplayUrl] = useState('')

  const { dnsList, selectedDns, isModalOpen, setIsModalOpen, handleDnsChange, handleSaveDnsList } =
    useDns({
      onDnsChangeCallback: () => {
        if (navState.url && navState.url !== 'about:blank') {
          handleNavigate('reload')
        } else {
          handleLoadUrl('about:blank')
        }
      }
    })

  // ★ WebViewのナビゲーション状態が変化したら、ローカルの state に反映する
  useEffect(() => {
    if (navState.url === '' || navState.url === 'about:blank') {
      setDisplayUrl('')
      // オプション: about:blank の場合はデフォルトの https に戻す
      // setProtocol('https:')
    } else {
      setDisplayUrl(navState.displayUrl)
      setProtocol(navState.protocol)
    }
  }, [navState])

  // (アップデート関連のコードは変更なし)
  const [updateInfo, setUpdateInfo] = useState<{
    status: 'available' | 'downloading' | 'downloaded' | null
    version?: string
    error?: string
    percent?: number
  }>({ status: null })
  const [isUpdateDialogVisible, setIsUpdateDialogVisible] = useState(false)

  useEffect(() => {
    const removeUpdateAvailableListener = window.api.onUpdateAvailable((version) => {
      console.log('Update available, version:', version)
      setUpdateInfo({ status: 'available', version })
      setIsUpdateDialogVisible(true)
    })

    const removeUpdateDownloadedListener = window.api.onUpdateDownloaded((version) => {
      console.log('Update downloaded, version:', version)
      setUpdateInfo({ status: 'downloaded', version })
      setIsUpdateDialogVisible(true)
    })

    const removeUpdateDownloadingListener = window.api.onUpdateDownloading((progress) => {
      console.log('Downloading update:', progress.percent)
      setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: progress.percent }))
      setIsUpdateDialogVisible(true)
    })

    const removeUpdateErrorListener = window.api.onUpdateError((message) => {
      console.error('Update error:', message)
      setUpdateInfo({ status: null, error: message })
    })

    return () => {
      removeUpdateAvailableListener()
      removeUpdateDownloadedListener()
      removeUpdateDownloadingListener()
      removeUpdateErrorListener()
    }
  }, [])

  const handleDownloadUpdate = (): void => {
    window.api.downloadUpdate()
    setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: 0 }))
  }

  const handleQuitAndInstall = (): void => {
    window.api.quitAndInstall()
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Controls
        // ★ navState から必要なものだけを渡す
        canGoBack={navState.canGoBack}
        canGoForward={navState.canGoForward}
        navDisplayUrl={navState.displayUrl} // ★ onBlur で戻すための元URL
        // ★ プロトコルと表示URLの state を渡す
        protocol={protocol}
        setProtocol={setProtocol}
        displayUrl={displayUrl}
        setDisplayUrl={setDisplayUrl}
        // ★ 以下の props は変更なし
        dnsList={dnsList}
        selectedDnsHost={selectedDns}
        isWebViewReady={isWebViewReady}
        onNavigate={handleNavigate}
        onLoadUrl={handleLoadUrl}
        onDnsChange={handleDnsChange}
        onEditDns={() => setIsModalOpen(true)}
      />
      <div className="relative flex-grow">
        {/* ★ isLoading が true の時にオーバーレイを表示 */}
        {isLoading && <LoadingOverlay />}
        {(navState.url === '' || navState.url === 'about:blank') && !isLoading && <WelcomeSplash />}
        <WebView ref={webviewRef} {...eventHandlers} />
        {loadError && !isLoading && (
          <ErrorDisplay error={loadError} onReload={() => handleNavigate('reload')} />
        )}
      </div>
      <DnsDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentList={dnsList}
        onSave={handleSaveDnsList}
      />

      {/* アップデート通知ダイアログ (変更なし) */}
      {isUpdateDialogVisible && (
        <Dialog open={isUpdateDialogVisible} onOpenChange={setIsUpdateDialogVisible}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {updateInfo.status === 'available' && '新しいバージョンが利用可能です！'}
                {updateInfo.status === 'downloading' && 'アップデートをダウンロード中...'}
                {updateInfo.status === 'downloaded' && 'アップデートの準備ができました！'}
              </DialogTitle>
              <DialogDescription>
                {updateInfo.status === 'available' &&
                  `バージョン ${updateInfo.version} が利用可能です。ダウンロードして更新しますか？`}
                {updateInfo.status === 'downloading' &&
                  `ダウンロード中: ${updateInfo.percent !== undefined ? updateInfo.percent.toFixed(2) : '0.00'}%`}
                {updateInfo.status === 'downloaded' &&
                  `バージョン ${updateInfo.version} のダウンロードが完了しました。アプリケーションを再起動してインストールしますか？`}
              </DialogDescription>
            </DialogHeader>
            {updateInfo.status === 'downloading' && updateInfo.percent !== undefined && (
              <div className="py-4">
                <Progress value={updateInfo.percent} className="w-full" />
              </div>
            )}
            <DialogFooter>
              {updateInfo.status === 'available' && (
                <Button onClick={handleDownloadUpdate}>ダウンロード</Button>
              )}
              {updateInfo.status === 'downloaded' && (
                <Button onClick={handleQuitAndInstall}>今すぐインストールして再起動</Button>
              )}
              {updateInfo.status !== 'downloading' && (
                <Button variant="outline" onClick={() => setIsUpdateDialogVisible(false)}>
                  {updateInfo.status === 'available' ? '後で' : '後で再起動'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default App