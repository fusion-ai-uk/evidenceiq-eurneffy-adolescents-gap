"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { humanizeLabel } from "@/lib/evidence/display"
import { getHelpTooltipText } from "@/lib/evidence/help-text"
import { InfoHint } from "@/components/evidenceiq/analysis-components"

export function MultiSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
  getOptionHelp,
  humanizeOptions = true,
}: {
  value?: string[]
  options?: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  getOptionHelp?: (option: string) => string | undefined
  humanizeOptions?: boolean
}) {
  const safeValue = value ?? []
  const safeOptions = options ?? []
  const safePlaceholder = placeholder ?? "Select options"
  const selected = new Set(safeValue)

  function toggle(option: string) {
    const next = new Set(selected)
    if (next.has(option)) next.delete(option)
    else next.add(option)
    onChange(Array.from(next))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-9 w-full justify-between", className)}>
          <span className="truncate text-left">
            {safeValue.length === 0 ? (
              <span className="text-muted-foreground">{safePlaceholder}</span>
            ) : (
              <span className="inline-flex items-center gap-1">
                {safeValue.slice(0, 2).map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="max-w-[110px] truncate"
                    title={getOptionHelp?.(item) ?? getHelpTooltipText(item)}
                  >
                    {humanizeOptions ? humanizeLabel(item) : item}
                  </Badge>
                ))}
                {safeValue.length > 2 ? <Badge variant="secondary">+{safeValue.length - 2}</Badge> : null}
              </span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${safePlaceholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No options.</CommandEmpty>
            <CommandGroup>
              {safeOptions.map((option) => (
                <CommandItem key={option} onSelect={() => toggle(option)}>
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      selected.has(option) ? "bg-primary text-primary-foreground" : "opacity-50",
                    )}
                  >
                    {selected.has(option) ? <Check className="h-3 w-3" /> : null}
                  </div>
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate" title={getOptionHelp?.(option) ?? getHelpTooltipText(option) ?? option}>
                      {humanizeOptions ? humanizeLabel(option) : option}
                    </span>
                    {(getOptionHelp?.(option) ?? getHelpTooltipText(option)) ? (
                      <span onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
                        <InfoHint text={(getOptionHelp?.(option) ?? getHelpTooltipText(option))!} />
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

