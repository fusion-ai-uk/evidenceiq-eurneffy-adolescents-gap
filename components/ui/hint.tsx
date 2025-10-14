'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HintProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={80}>{children}</TooltipPrimitive.Provider>
  )
}

export function HintIcon({
  content,
  side = 'bottom',
  className,
  size = 14,
}: {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  size?: number
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={80}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="More info"
            className={cn(
              'inline-flex h-5 w-5 items-center justify-center rounded-md bg-muted/20 text-muted-foreground hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              className,
            )}
          >
            <Info width={size} height={size} strokeWidth={2} />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 max-w-[520px] rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 shadow-xl data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 animate-in fade-in-0 zoom-in-95',
            )}
          >
            {typeof content === 'string' ? <span className="leading-snug">{content}</span> : content}
            <TooltipPrimitive.Arrow className="fill-neutral-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )}


