import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../types/ipc'

const api: IpcApi = {
  // DNS関連のAPIのみにする
  updateDnsConfig: (host: string) => ipcRenderer.send('update-dns-config', host),
  getDnsList: () => ipcRenderer.invoke('get-dns-list'),
  saveDnsList: (dnsList) => ipcRenderer.send('save-dns-list', dnsList),
  onForceReload: (callback) => {
    const listener = (): void => callback()
    ipcRenderer.on('force-reload', listener)
    // リスナーを解除するための関数を返す
    return () => {
      ipcRenderer.removeListener('force-reload', listener)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
