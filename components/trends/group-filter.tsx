"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Props = {
  groups: string[]
  selected: string[]
  onApply: (next: string[]) => void
}

export function GroupFilter({ groups, selected, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string[]>(selected)

  useEffect(() => {
    setPending(selected)
  }, [selected])

  const label = pending.length === 0 ? "All groups" : pending.length === 1 ? pending[0] : `${pending.length} groups`

  const toggle = (g: string) => {
    setPending((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 justify-between w-full text-left font-normal">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 z-[100000]" align="start">
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
          {groups.map((g) => (
            <label key={g} className="flex items-center gap-2 text-sm">
              <Checkbox checked={pending.includes(g)} onCheckedChange={() => toggle(g)} />
              <span>{g}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex justify-between gap-2">
          <Button variant="ghost" className="h-8" onClick={() => setPending([])}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-8" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="h-8" onClick={() => { onApply(pending); setOpen(false) }}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


