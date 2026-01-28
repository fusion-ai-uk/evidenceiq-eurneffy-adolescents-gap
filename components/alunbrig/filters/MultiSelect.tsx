"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"

type MultiSelectOption = { value: string; label?: string }

export function MultiSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled,
  className,
  maxBadges = 2,
  searchPlaceholder = "Search...",
}: {
  value: string[]
  options: Array<string | MultiSelectOption>
  onChange: (next: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxBadges?: number
  searchPlaceholder?: string
}) {
  const normalizedOptions = React.useMemo<MultiSelectOption[]>(
    () =>
      options
        .map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }))
        .filter((o) => o.value),
    [options],
  )

  const selectedSet = React.useMemo(() => new Set(value), [value])

  const toggle = React.useCallback(
    (v: string) => {
      const next = new Set(value)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      onChange(Array.from(next))
    },
    [value, onChange],
  )

  const clear = React.useCallback(() => onChange([]), [onChange])

  const selectedLabels = React.useMemo(() => {
    const labelByValue = new Map(normalizedOptions.map((o) => [o.value, o.label ?? o.value]))
    return value.map((v) => labelByValue.get(v) ?? v).filter(Boolean)
  }, [value, normalizedOptions])

  const preview = selectedLabels.slice(0, maxBadges)
  const overflow = Math.max(0, selectedLabels.length - preview.length)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-between gap-2 px-3 text-left font-normal",
            selectedLabels.length === 0 && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedLabels.length === 0 ? (
              placeholder
            ) : (
              <span className="flex flex-wrap items-center gap-1">
                {preview.map((l) => (
                  <Badge key={l} variant="secondary" className="max-w-[140px] truncate">
                    {l}
                  </Badge>
                ))}
                {overflow > 0 ? <Badge variant="secondary">+{overflow}</Badge> : null}
              </span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0" sideOffset={8}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  if (selectedSet.size === normalizedOptions.length) clear()
                  else onChange(normalizedOptions.map((o) => o.value))
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                    selectedSet.size === normalizedOptions.length ? "bg-primary text-primary-foreground" : "opacity-50",
                  )}
                >
                  {selectedSet.size === normalizedOptions.length ? <Check className="h-3 w-3" /> : null}
                </div>
                Select all
              </CommandItem>
              <CommandItem onSelect={clear} disabled={value.length === 0}>
                <X className="mr-2 h-4 w-4 opacity-60" />
                Clear
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Options">
              {normalizedOptions.map((o) => {
                const isOn = selectedSet.has(o.value)
                return (
                  <CommandItem key={o.value} onSelect={() => toggle(o.value)}>
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isOn ? "bg-primary text-primary-foreground" : "opacity-50",
                      )}
                    >
                      {isOn ? <Check className="h-3 w-3" /> : null}
                    </div>
                    <span className="truncate" title={o.label ?? o.value}>
                      {o.label ?? o.value}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
