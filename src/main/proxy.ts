import dns from 'dns'
import { net as electronNet, session } from 'electron'
import http from 'http'
import net from 'net'
import Stream from 'stream'
import { URL } from 'url'

const PROXY_PORT = 8899
let currentDnsServer: string | null = null

const proxyServer = http.createServer(async (clientReq, clientRes) => {
  console.log(`[Proxy HTTP] Request received for: ${clientReq.url}`)
  const url = new URL(clientReq.url!, `http://${clientReq.headers.host}`)

  try {
    let resolvedIp: string
    // currentDnsServerが設定されていない場合は、ElectronのデフォルトのDNS解決機能を使用
    if (!currentDnsServer) {
      const resolved = await electronNet.resolveHost(url.hostname)
      if (!resolved.endpoints || resolved.endpoints.length === 0) {
        throw new Error(`No valid endpoints found for ${url.hostname}`)
      }
      resolvedIp = resolved.endpoints[0].address
    } else {
      // currentDnsServerが設定されている場合は、指定されたDNSサーバーを使用
      const resolver = new dns.promises.Resolver()
      resolver.setServers([currentDnsServer])
      const addresses = await resolver.resolve4(url.hostname)
      if (!addresses || addresses.length === 0) {
        throw new Error(`No IPv4 addresses found for ${url.hostname}`)
      }
      resolvedIp = addresses[0]
    }

    const options = {
      hostname: resolvedIp,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        Host: url.hostname
      }
    }

    const proxyReq = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode!, proxyRes.headers)
      proxyRes.pipe(clientRes, { end: true })
    })

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] Failed to connect to ${options.hostname}:${options.port}`, err)
      clientRes.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
      clientRes.end(
        `Proxy connection error: Could not connect to the destination server.\n\n` +
          `URL: ${clientReq.url}\n` +
          `IP: ${resolvedIp}\n` +
          `Reason: ${err.message}`
      )
    })

    clientReq.pipe(proxyReq, { end: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      `[DNS Error] Failed to resolve ${url.hostname} using server ${currentDnsServer}. Full error:`,
      err
    )
    clientRes.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    clientRes.end(
      `DNS Resolution Failed for "${url.hostname}"\n\n` +
        `Reason: ${err.message}\n` +
        `Error Code: ${err.code}`
    )
  }
})

// HTTPSのCONNECTメソッドに対する処理
proxyServer.on('connect', async (req, clientSocket, head): Promise<Stream.Duplex | void> => {
  console.log(`[Proxy CONNECT] Tunnel request received for: ${req.url}`)
  if (!req.url) return clientSocket.end()
  const { port, hostname } = new URL(`http://${req.url}`)
  if (!hostname) return clientSocket.end()

  const lookup = async (): Promise<string> => {
    if (!currentDnsServer) {
      const resolved = await electronNet.resolveHost(hostname)
      if (!resolved.endpoints || resolved.endpoints.length === 0) {
        throw new Error(`No valid endpoints found for ${hostname}`)
      }
      return resolved.endpoints[0].address // 成功時は値をreturn
    } else {
      const resolver = new dns.promises.Resolver()
      resolver.setServers([currentDnsServer])
      const addresses = await resolver.resolve4(hostname)
      if (!addresses || addresses.length === 0) {
        throw new Error(`No IPv4 addresses found for ${hostname}`)
      }
      return addresses[0] // 成功時は値をreturn
    }
  }
  clientSocket.on('error', (err) => {
    // clientSocket自体のエラーハンドリング
    console.error(`[Client Socket Error]`, err)
  })
  try {
    const address = await lookup()

    const serverSocket = net.connect(Number(port) || 443, address, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      serverSocket.write(head)
      serverSocket.pipe(clientSocket)
      clientSocket.pipe(serverSocket)
    })

    serverSocket.on('error', (socketErr) => {
      console.error(`[CONNECT Error] Failed to connect to ${hostname}:${port}`, socketErr)
      clientSocket.end()
    })
  } catch (err) {
    // lookup でエラーが発生した場合の処理
    console.error(`[DNS Lookup Error] in CONNECT method for ${hostname}:`, err)
    clientSocket.end()
  }
})

/**
 * プロキシサーバーを起動します。
 * @returns プロキシサーバーのインスタンス
 */
export function startProxyServer(): http.Server {
  proxyServer.listen(PROXY_PORT)
  console.log(`Proxy server listening on port ${PROXY_PORT}`)
  return proxyServer
}

/**
 * プロキシが使用するDNSサーバーを更新します。
 * @param host - DNSサーバーのホストIP。空文字列の場合はOSデフォルトを使用します。
 */
export async function updateProxyDns(host: string): Promise<void> {
  currentDnsServer = host === '' ? null : host
  console.log(`Proxy DNS updated to: ${currentDnsServer || 'OS Default'}`)

  // WebViewが使用している特定のセッションを取得
  const webviewSession = session.fromPartition('persist:dns_browser_session')

  try {
    // このセッションのDNS解決キャッシュをクリアする
    await webviewSession.clearHostResolverCache()
    console.log('[DNS Switch] Host resolver cache cleared successfully.')
  } catch (err) {
    console.error('[DNS Switch] Failed to clear host resolver cache:', err)
  }
}

export function getProxyPort(): number {
  return PROXY_PORT
}
