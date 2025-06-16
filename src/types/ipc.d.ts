export interface DnsConfig {
  name: string
  host: string
}

export interface IpcApi {
  // DNS関連のIPC
  updateDnsConfig: (host: string) => void
  getDnsList: () => Promise<DnsConfig[]>
  saveDnsList: (dnsList: DnsConfig[]) => void
  onForceReload: (callback: () => void) => () => void

  // アップデート関連のIPC
  onUpdateAvailable: (callback: (version: string) => void) => () => void
  onUpdateDownloaded: (callback: (version: string) => void) => () => void
  onUpdateError: (callback: (message: string) => void) => () => void
  quitAndInstall: () => void
  downloadUpdate: () => void
  onUpdateDownloading: (callback: (progress: { percent: number }) => void) => () => void
}
