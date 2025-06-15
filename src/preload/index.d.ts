import { ElectronAPI } from '@electron-toolkit/preload'
import { IpcApi } from '../types/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IpcApi
  }
}
