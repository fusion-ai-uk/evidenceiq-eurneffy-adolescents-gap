"use client"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  groups: string[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function GroupMultiSelect({ groups, selected, onChange }: Props) {
  const label = useMemo(() => {
    if (!selected?.length) return "All groups"
    if (selected.length === 1) return selected[0]
    return `${selected.length} groups`
  }, [selected])

  const toggle = (g: string) => {
    const set = new Set(selected)
    if (set.has(g)) set.delete(g)
    else set.add(g)
    onChange(Array.from(set))
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 justify-between w-full text-left font-normal">
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 z-[100000]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Group</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!selected.length}
          onCheckedChange={() => onChange([])}
        >
          All groups
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {groups.map((g) => (
          <DropdownMenuCheckboxItem key={g} checked={selected.includes(g)} onCheckedChange={() => toggle(g)}>
            {g}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


