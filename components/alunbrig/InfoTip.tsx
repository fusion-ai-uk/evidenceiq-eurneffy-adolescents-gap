"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function InfoTip({
  text,
  className,
  iconClassName,
}: {
  text: string
  className?: string
  iconClassName?: string
}) {
  const content = (text || "").trim()
  if (!content) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            className,
          )}
          aria-label="Info"
        >
          <Info className={cn("h-4 w-4", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8} className="max-w-[360px]">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

