"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { trendsExplorer } from "@/lib/content-plan"
import { useState } from "react"

export type TrendsFilters = {
  timeframe: string
  geography: string
  audience: "hcp" | "patient" | "caregiver" | "all"
}

export function FilterSidebar({ onChange }: { onChange: (filters: TrendsFilters) => void }) {
  const [timeframe, setTimeframe] = useState(trendsExplorer.filters.timeframe.current)
  const [geography, setGeography] = useState(trendsExplorer.filters.geography.default)
  const [audience, setAudience] = useState<TrendsFilters["audience"]>("all")

  function emit(next: Partial<TrendsFilters>) {
    const merged = { timeframe, geography, audience, ...next } as TrendsFilters
    onChange(merged)
  }

  return (
    <Card className="border-border/50 sticky top-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Timeframe</Label>
          <Select
            value={timeframe}
            onValueChange={(v) => {
              setTimeframe(v)
              emit({ timeframe: v })
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trendsExplorer.filters.timeframe.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Geography</Label>
          <Select
            value={geography}
            onValueChange={(v) => {
              setGeography(v)
              emit({ geography: v })
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trendsExplorer.filters.geography.options.map((opt) => (
                <SelectItem key={opt.name} value={opt.name} disabled={!opt.enabled}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-[11px] text-muted-foreground">{trendsExplorer.filters.geography.dataGapNote}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Audience Focus</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["all", "hcp", "patient", "caregiver"] as const).map((opt) => (
              <button
                key={opt}
                className={`text-xs rounded border px-2 py-1 ${
                  audience === opt ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
                onClick={() => {
                  setAudience(opt)
                  emit({ audience: opt })
                }}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Thresholds — HCP ≥ {trendsExplorer.filters.audienceThresholds.hcp}, Patient ≥ {trendsExplorer.filters.audienceThresholds.patient}, Caregiver ≥ {trendsExplorer.filters.audienceThresholds.caregiver}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


