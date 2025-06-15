export interface DnsConfig {
  name: string
  host: string
}

export interface IpcApi {
  // DNS関連のAPIのみ残す
  updateDnsConfig: (host: string) => void
  getDnsList: () => Promise<DnsConfig[]>
  saveDnsList: (dnsList: DnsConfig[]) => void
  onForceReload: (callback: () => void) => () => void
}
