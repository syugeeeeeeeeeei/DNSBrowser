import { ipcMain } from 'electron'
import type { DnsConfig } from '../types/ipc'
import { updateProxyDns } from './proxy'
import { store } from './store'

export function registerIpcHandlers(): void {
  // レンダラーからDNSサーバーの変更を受け取り、プロキシに反映する
  ipcMain.on('update-dns-config', (_, host: string) => {
    updateProxyDns(host)
  })

  // 保存されているDNSリストをレンダラーに返す
  ipcMain.handle('get-dns-list', () => {
    return store.get('dnsList')
  })

  // レンダラーで編集されたDNSリストを保存する
  ipcMain.on('save-dns-list', (_, dnsList: DnsConfig[]) => {
    store.set('dnsList', dnsList)
  })
}
