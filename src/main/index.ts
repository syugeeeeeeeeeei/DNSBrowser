// src/main/index.ts
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, session, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { getProxyPort, startProxyServer } from './proxy'

let mainWindow: BrowserWindow
let proxyServer: ReturnType<typeof startProxyServer>

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    // autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true
    }
  })

  const proxyPort = getProxyPort()
  session.fromPartition('persist:dns_browser_session').setProxy({
    proxyRules: `http=localhost:${proxyPort};https=localhost:${proxyPort}`,
    proxyBypassRules: 'localhost'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.dnsbrowser.app')

  // プロキシとIPCハンドラを初期化
  proxyServer = startProxyServer()

  app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
    event.preventDefault()
    callback(true)
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  registerIpcHandlers(mainWindow)

  autoUpdater.autoDownload = false // 自動ダウンロードを無効化（任意）
  autoUpdater.autoInstallOnAppQuit = true // アプリ終了時に自動インストール

  // アップデート利用可能イベント
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
    mainWindow.webContents.send('update-available', info.version)
  })

  // アップデートダウンロード済みイベント
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info)
    mainWindow.webContents.send('update-downloaded', info.version)
  })

  // ★ 追加: ダウンロード進捗イベント
  autoUpdater.on('download-progress', (progressObj) => {
    console.log('Download progress:', progressObj)
    mainWindow.webContents.send('update-downloading', progressObj)
  })

  // エラーイベント
  autoUpdater.on('error', (err) => {
    console.error('Error in autoUpdater:', err)
    mainWindow.webContents.send('update-error', err.message)
  })

  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (proxyServer) {
    proxyServer.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
