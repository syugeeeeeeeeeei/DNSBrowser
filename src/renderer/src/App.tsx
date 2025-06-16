// src/renderer/src/App.tsx
import React, { useEffect, useState } from 'react'
import './assets/App.css'
import { Controls } from './components/Controls'
import { DnsDialog } from './components/DnsDialog'
import { ErrorDisplay } from './components/ErrorDisplay'
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
    handleNavigate,
    handleLoadUrl,
    eventHandlers
  } = useWebView()

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

  // ★ 変更: updateInfoのstatusに 'downloading' と progress を追加
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
      // ★ 追加
      console.log('Downloading update:', progress.percent)
      setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: progress.percent }))
      setIsUpdateDialogVisible(true) // ダウンロード中にダイアログを表示し続ける
    })

    const removeUpdateErrorListener = window.api.onUpdateError((message) => {
      console.error('Update error:', message)
      setUpdateInfo({ status: null, error: message })
    })

    return () => {
      removeUpdateAvailableListener()
      removeUpdateDownloadedListener()
      removeUpdateDownloadingListener() // ★ 追加
      removeUpdateErrorListener()
    }
  }, [])

  const handleDownloadUpdate = (): void => {
    window.api.downloadUpdate()
    setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: 0 })) // ダウンロード開始時に進捗をリセット
    // setIsUpdateDialogVisible(false); // ダイアログを閉じずに進捗を表示
  }

  const handleQuitAndInstall = (): void => {
    window.api.quitAndInstall()
  }

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

      {/* アップデート通知ダイアログ */}
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
              {updateInfo.status !== 'downloading' && ( // ダウンロード中は「後で」を非表示にする
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
