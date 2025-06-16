// src/preload/index.ts
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
  },
  // アップデート関連のAPI
  onUpdateAvailable: (callback) => {
    const listener = (_event, version: string): void => callback(version)
    ipcRenderer.on('update-available', listener)
    return () => {
      ipcRenderer.removeListener('update-available', listener)
    }
  },
  onUpdateDownloaded: (callback) => {
    const listener = (_event, version: string): void => callback(version)
    ipcRenderer.on('update-downloaded', listener)
    return () => {
      ipcRenderer.removeListener('update-downloaded', listener)
    }
  },
  onUpdateError: (callback) => {
    const listener = (_event, message: string): void => callback(message)
    ipcRenderer.on('update-error', listener)
    return () => {
      ipcRenderer.removeListener('update-error', listener)
    }
  },
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  onUpdateDownloading: (callback) => {
    // ★ 追加
    const listener = (_event, progress: { percent: number }): void => callback(progress)
    ipcRenderer.on('update-downloading', listener)
    return () => {
      ipcRenderer.removeListener('update-downloading', listener)
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
