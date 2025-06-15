import { BrowserWindow, ipcMain, session } from 'electron'
import type { DnsConfig } from '../types/ipc'
import { updateProxyDns } from './proxy'
import { store } from './store'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // レンダラーからDNSサーバーの変更を受け取り、プロキシに反映する
  ipcMain.on('update-dns-config', async (_, host: string) => {
    await updateProxyDns(host)
  })

  // 保存されているDNSリストをレンダラーに返す
  ipcMain.handle('get-dns-list', () => {
    return store.get('dnsList')
  })

  // レンダラーで編集されたDNSリストを保存する
  ipcMain.on('save-dns-list', (_, dnsList: DnsConfig[]) => {
    store.set('dnsList', dnsList)
  })

  ipcMain.on('update-dns-config', async (_, host: string) => {
    // ★ try...catchブロックで非同期処理全体を囲む
    try {
      // 1. プロキシが使用するDNSを更新
      updateProxyDns(host)

      // 2. 正しいセッションのDNSキャッシュをクリア
      const ses = session.fromPartition('persist:dns_browser_session')
      await ses.clearCache()
      await ses.clearCodeCaches({})
      await ses.clearHostResolverCache()
      console.log('Host resolver cache cleared for persist:dns_browser_session')

      // 3. レンダラープロセスに強制リロードを指示
      mainWindow.webContents.send('force-reload')
    } catch (error) {
      // ★ エラーが発生した場合、コンソールに出力する
      console.error('Failed to update DNS config and clear cache:', error)
    }
  })
}
