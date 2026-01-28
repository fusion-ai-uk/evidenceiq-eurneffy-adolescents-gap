"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function FilterPane({
  title = "Filters",
  description,
  rightSlot,
  metaLine,
  hasUnsavedChanges,
  children,
  advanced,
  advancedOpen,
  onAdvancedOpenChange,
  className,
}: {
  title?: string
  description?: React.ReactNode
  rightSlot?: React.ReactNode
  metaLine?: React.ReactNode
  hasUnsavedChanges?: boolean
  children: React.ReactNode
  advanced?: React.ReactNode
  advancedOpen?: boolean
  onAdvancedOpenChange?: (open: boolean) => void
  className?: string
}) {
  const showAdvanced = Boolean(advanced)

  return (
    <Card className={cn("border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              {hasUnsavedChanges ? <Badge variant="secondary">Unsaved changes</Badge> : null}
            </div>
            {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
          </div>
          {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border/60 bg-background/40 p-3">{children}</div>

        {showAdvanced ? (
          <Collapsible open={advancedOpen} onOpenChange={onAdvancedOpenChange}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8">
                {advancedOpen ? "Hide advanced" : "Show advanced"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 rounded-md border border-border/60 bg-background/40 p-3">{advanced}</CollapsibleContent>
          </Collapsible>
        ) : null}

        {metaLine ? (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">{metaLine}</div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
