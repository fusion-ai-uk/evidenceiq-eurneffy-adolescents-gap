import { SentimentComparison } from "@/components/competitors/sentiment-comparison"
import { NarrativeAnalysis } from "@/components/competitors/narrative-analysis"
import { DurabilityDiscussion } from "@/components/competitors/durability-discussion"
import { WordCloud } from "@/components/competitors/word-cloud"

export default function CompetitorsPage() {
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

      {/* Narrative Analysis and Durability */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NarrativeAnalysis />
        <DurabilityDiscussion />
      </div>
    </div>
  )
}
