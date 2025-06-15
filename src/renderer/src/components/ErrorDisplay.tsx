import { RotateCw, ShieldAlert } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'

interface ErrorDisplayProps {
  error: {
    code: number
    description: string
    url: string
  }
  onReload: () => void
}

export function ErrorDisplay({ error, onReload }: ErrorDisplayProps): React.JSX.Element {
  return (
    <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">ページの読み込みに失敗しました</h1>
      <p className="text-muted-foreground">
        ページを読み込めませんでした。ネットワーク接続を確認するか、時間をおいて再度お試しください。
      </p>
      <div className="mt-4 max-w-full rounded-md border bg-secondary/30 p-4 text-left text-sm">
        <p className="font-semibold">URL:</p>
        <p className="break-all font-mono text-muted-foreground">{error.url}</p>
        <p className="mt-2 font-semibold">エラー詳細:</p>
        <p className="font-mono text-muted-foreground">
          {error.description} (Code: {error.code})
        </p>
      </div>
      <Button onClick={onReload} className="mt-6">
        <RotateCw className="mr-2 h-4 w-4" />
        再読み込み
      </Button>
    </div>
  )
}
