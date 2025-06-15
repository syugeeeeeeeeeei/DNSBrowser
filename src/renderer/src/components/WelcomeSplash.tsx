import { Dna, Globe, ShieldCheck } from 'lucide-react'
import React from 'react'

export function WelcomeSplash(): React.JSX.Element {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-background p-8 text-center">
      <div className="flex items-center gap-4">
        <Dna className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold">DNS-Based Browser</h1>
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        指定したDNSサーバーを利用してウェブサイトを閲覧するためのブラウザです。
        アドレスバーにURLを入力して閲覧を開始してください。
      </p>
      <div className="mt-8 flex gap-12">
        <div className="flex flex-col items-center gap-2">
          <Globe className="h-10 w-10" />
          <h2 className="font-semibold">ブラウジング</h2>
          <p className="text-sm text-muted-foreground">URLを入力してページを閲覧</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="h-10 w-10" />
          <h2 className="font-semibold">DNS切り替え</h2>
          <p className="text-sm text-muted-foreground">右下のメニューからDNSを選択</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Dna className="h-10 w-10" />
          <h2 className="font-semibold">DNS編集</h2>
          <p className="text-sm text-muted-foreground">設定ボタンからリストを編集</p>
        </div>
      </div>
    </div>
  )
}
