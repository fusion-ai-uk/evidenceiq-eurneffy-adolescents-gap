"use client"

import { useState } from "react"
import { TimelineFilters, type TimelineFilterState } from "@/components/TimelineFilters"
import { ConversationTimeline } from "@/components/ConversationTimeline"
import { ThemeEvolution } from "@/components/trends/theme-evolution"
import { BaselineAlerts } from "@/components/trends/baseline-alerts"
// import { DurabilityTheme } from "@/components/trends/durability-theme"

export default function TrendsPage() {
  const today = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - 1)
  const toUK = (d: Date) => new Intl.DateTimeFormat('en-GB').format(d).split('/').reverse().join('-')
  const defaultFilters: TimelineFilterState = {
    startDate: toUK(start),
    endDate: toUK(today),
    granularity: 'week',
    categories: [],
    hcp: false,
    patient: false,
    caregiver: false,
    payer: false,
    stakeholderThreshold: 0.5,
    sentimentMin: -1,
    sentimentMax: 1,
    minLikes: 0,
    minRetweets: 0,
    minViews: 0,
    q: '',
  }
  const [filters, setFilters] = useState<TimelineFilterState>(defaultFilters)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Trends Explorer</h1>
        <p className="lead">
          Track conversation volume and theme evolution over 12 months with key event markers
        </p>
      </div>

      <div className="space-y-4">
        <TimelineFilters onApply={(f) => setFilters(f)} />
        {filters && <ConversationTimeline filters={filters} />}
      </div>

      <BaselineAlerts />

      {/* Theme Evolution full width */}
      <div>
        <ThemeEvolution />
      </div>

      {/* DurabilityTheme removed per request */}
    </div>
  )
}
