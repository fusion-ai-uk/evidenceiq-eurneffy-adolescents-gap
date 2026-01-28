"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type ActiveFilterChip = {
  key: string
  label: string
  onClear: () => void
}

export function ActiveFiltersBar({
  chips,
  onClearAll,
  className,
}: {
  chips: ActiveFilterChip[]
  onClearAll?: () => void
  className?: string
}) {
  if (!chips.length) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="text-xs text-muted-foreground">Active filters</div>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <Badge key={c.key} variant="secondary" className="gap-1 pr-1">
            <span className="max-w-[240px] truncate" title={c.label}>
              {c.label}
            </span>
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-background/50" onClick={c.onClear}>
              <X className="h-3 w-3" />
              <span className="sr-only">Clear</span>
            </Button>
          </Badge>
        ))}
      </div>
      {onClearAll ? (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  )
}
