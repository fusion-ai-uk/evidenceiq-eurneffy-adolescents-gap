"use client"

import { SentimentComparison } from "@/components/competitors/sentiment-comparison"
import { NarrativeAnalysis } from "@/components/competitors/narrative-analysis"
import { DurabilityDiscussion } from "@/components/competitors/durability-discussion"
import EmotionRadar from "@/app/insights/components/EmotionRadar"
import { useState } from "react"
import { WordCloud } from "@/components/competitors/word-cloud"

export default function CompetitorsPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Competitor Lens</h1>
        <p className="lead">
          Positioning analysis of Zynlonta vs bispecifics (Epcoritamab, Glofitamab) and CAR-T
        </p>
      </div>

      {/* Sentiment Comparison */}
      <SentimentComparison />

      <WordCloud />

      {/* Combined card: Radar + Narratives with joined borders */}
      <div className="rounded-xl border overflow-hidden bg-card/60">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Emotional Tone Comparison</h2>
          <p className="text-sm text-muted-foreground mb-2">Relative intensity of hope, trust, fear and frustration across brands.</p>
          <EmotionRadar selected={selectedBrands} onChangeSelected={setSelectedBrands} frameless className="rounded-xl" />
        </div>
        <div className="p-4 pt-7">
          <NarrativeAnalysis selected={selectedBrands} frameless />
        </div>
      </div>

      {/* Durability (full width) */}
      <DurabilityDiscussion />
    </div>
  )
}
