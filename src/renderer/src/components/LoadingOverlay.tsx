import { Loader2 } from 'lucide-react'
import React from 'react'

export function LoadingOverlay(): React.JSX.Element {
	return (
		<div className="absolute inset-0 z-30 flex h-full w-full flex-col items-center justify-center gap-4 bg-background/80 p-8 text-center backdrop-blur-sm">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
			<p className="text-lg font-medium text-muted-foreground">アクセス待機中...</p>
		</div>
	)
}