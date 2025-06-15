import Store from 'electron-store'
import type { DnsConfig } from '../types/ipc'

// スキーマを定義して型安全性を高める
const schema = {
  dnsList: {
    type: 'array' as const,
    items: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        host: { type: 'string' as const }
      },
      required: ['name', 'host']
    },
    default: [
      { name: 'Google DNS', host: '8.8.8.8' },
      { name: 'Cloudflare DNS', host: '1.1.1.1' },
      { name: 'OS Default', host: '' }
    ]
  }
}

export const store = new Store<{ dnsList: DnsConfig[] }>({ schema })
