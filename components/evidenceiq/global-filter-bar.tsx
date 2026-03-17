"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FILTER_OPTIONS } from "@/lib/evidence/constants"
import type { EvidenceFilters } from "@/lib/evidence/filtering"
import { MultiSelect } from "@/components/evidenceiq/multi-select"
import { InfoHint } from "@/components/evidenceiq/analysis-components"
import { getHelpTooltipText } from "@/lib/evidence/help-text"

type FilterOptions = {
  usefulnessLabels: string[]
  gapPriorities: string[]
  sourceTypes: string[]
  articleKinds: string[]
  audiencePrimary: string[]
  bestUse: string[]
  barrierTags: string[]
  settingTags: string[]
  dosingTags: string[]
  recognitionTags: string[]
  equityTags: string[]
  dataGapTags: string[]
  eurOpportunityTags: string[]
}

type Props = {
  filters: EvidenceFilters
  options: FilterOptions
  onChange: (next: EvidenceFilters) => void
  onReset: () => void
}

export function GlobalFilterBar({ filters, options, onChange, onReset }: Props) {
  const [searchInput, setSearchInput] = React.useState(filters.search)

  React.useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput })
      }
    }, 250)
    return () => window.clearTimeout(handle)
  }, [searchInput, filters, onChange])

  function update<K extends keyof EvidenceFilters>(key: K, value: EvidenceFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>{label}</span>
          <InfoHint text={hint ?? getHelpTooltipText(label) ?? "Filter definition unavailable."} />
        </div>
        {children}
      </div>
    )
  }

  return (
    <Card className="mb-3 py-3">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-1 text-sm">
            Key filters
            <InfoHint text={getHelpTooltipText("Key filters") ?? ""} />
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Search">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search evidence / gaps / excerpts..."
              className="h-9"
            />
          </Field>

          <Field label="Geography">
            <MultiSelect
              value={filters.geographyFocus}
              options={FILTER_OPTIONS.geographyFocus.map((entry) => entry.value)}
              onChange={(next) => update("geographyFocus", next)}
              placeholder="Geography"
            />
          </Field>
          <Field label="Population">
            <MultiSelect value={filters.populationDirectness} options={FILTER_OPTIONS.populationDirectness.map((entry) => entry.value)} onChange={(next) => update("populationDirectness", next)} placeholder="Population" />
          </Field>
          <Field label="Source type">
            <MultiSelect value={filters.sourceTypes} options={options.sourceTypes} onChange={(next) => update("sourceTypes", next)} placeholder="Source type" />
          </Field>
          <Field label="Barrier tags">
            <MultiSelect value={filters.barrierTags} options={options.barrierTags} onChange={(next) => update("barrierTags", next)} placeholder="Barrier tags" />
          </Field>
          <Field label="Setting tags">
            <MultiSelect value={filters.settingTags} options={options.settingTags} onChange={(next) => update("settingTags", next)} placeholder="Setting tags" />
          </Field>
          <Field label="Data gap tags">
            <MultiSelect value={filters.dataGapTags} options={options.dataGapTags} onChange={(next) => update("dataGapTags", next)} placeholder="Data gap tags" />
          </Field>
          <Field label="EURneffy opportunity tags">
            <MultiSelect value={filters.eurOpportunityTags} options={options.eurOpportunityTags} onChange={(next) => update("eurOpportunityTags", next)} placeholder="EURneffy opportunity tags" />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

