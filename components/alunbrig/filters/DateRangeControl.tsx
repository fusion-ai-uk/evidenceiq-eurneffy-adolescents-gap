"use client"

import { useMemo } from "react"
import { CalendarIcon } from "lucide-react"
import { format, startOfYear, subMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { normalizeDateRange, toDateInputValue } from "@/lib/date-input"
import type { DateRange } from "react-day-picker"

type Props = {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}

export function DateRangeControl({ startDate, endDate, onChange }: Props) {
  const start = useMemo(() => (startDate ? new Date(`${startDate}T00:00:00`) : undefined), [startDate])
  const end = useMemo(() => (endDate ? new Date(`${endDate}T00:00:00`) : undefined), [endDate])

  const setStart = (nextStart: string) => {
    const nextEnd = endDate && nextStart > endDate ? nextStart : endDate
    onChange(nextStart, nextEnd)
  }

  const setEnd = (nextEnd: string) => {
    const nextStart = startDate && nextEnd < startDate ? nextEnd : startDate
    onChange(nextStart, nextEnd)
  }

  const applyMonthsPreset = (months: number) => {
    const end = endDate || toDateInputValue(new Date())
    const start = toDateInputValue(subMonths(new Date(`${end}T00:00:00`), months))
    onChange(start, end)
  }

  const applyYtdPreset = () => {
    const end = endDate || toDateInputValue(new Date())
    onChange(toDateInputValue(startOfYear(new Date(`${end}T00:00:00`))), end)
  }

  const onRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) return

    const nextStart = toDateInputValue(range.from)
    const nextEnd = range.to ? toDateInputValue(range.to) : (endDate && endDate >= nextStart ? endDate : nextStart)
    const normalized = normalizeDateRange(nextStart, nextEnd)
    onChange(normalized.startDate, normalized.endDate)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
              <CalendarIcon />
              {start ? format(start, "dd MMM yyyy") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={start}
              onSelect={(d) => d && setStart(toDateInputValue(d))}
              captionLayout="dropdown"
              fromYear={2018}
              toYear={2035}
            />
          </PopoverContent>
        </Popover>

        <div className="text-xs text-muted-foreground">to</div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
              <CalendarIcon />
              {end ? format(end, "dd MMM yyyy") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={end}
              onSelect={(d) => d && setEnd(toDateInputValue(d))}
              captionLayout="dropdown"
              fromYear={2018}
              toYear={2035}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm">Open range calendar</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={{ from: start, to: end }}
              onSelect={onRangeSelect}
              defaultMonth={start}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => applyMonthsPreset(3)}>Last 3M</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyMonthsPreset(6)}>Last 6M</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyMonthsPreset(12)}>Last 12M</Button>
        <Button type="button" size="sm" variant="outline" onClick={applyYtdPreset}>YTD</Button>
      </div>
    </div>
  )
}

