// WebViewのナビゲーション状態
export interface NavState {
  url: string
  canGoBack: boolean
  canGoForward: boolean
}

// ページの読み込みエラーの状態
export interface LoadError {
  code: number
  description: string
  url: string
}
