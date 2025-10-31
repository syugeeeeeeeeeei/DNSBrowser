import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// ★ トグルアイテム自体のバリアント
const toggleGroupItemVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    // ★ アニメーションを調整: 0.2秒かけて色と影が変化
    'transition-all duration-200 ease-in-out',
    'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', // フォーカス
    'disabled:pointer-events-none disabled:opacity-50', // 無効
    // ★ OFFの状態: 透明背景、ホバーで少し色づく
    'data-[state=off]:bg-transparent data-[state=off]:hover:bg-accent/50',
    // ★ ONの状態: グレー背景(bg-muted)に影をつけて浮き上がらせる
    'data-[state=on]:bg-muted data-[state=on]:text-accent-foreground data-[state=on]:shadow'
  ),
  {
    variants: {
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2.5',
        lg: 'h-10 px-4'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleGroupItemVariants>>({
  size: 'default'
})

// ★ 修正: Rootにグレー背景 (bg-muted), パディング (p-1), 枠線 (border) を設定
const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg border bg-white p-1', // ★ 変更
      className
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, children, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      className={cn(
        toggleGroupItemVariants({
          size: context.size || size
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
