"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SummaryCard = {
  id: string
  title: string
  body: string
}

type SummarySection = {
  id: string
  title: string
  subtitle: string
  cards: SummaryCard[]
}

type SummaryUpdateSet = {
  id: string
  label: string
  dateRange: string
  cadenceNote?: string
  sections: SummarySection[]
}

const EXECUTIVE_UPDATE_SETS: SummaryUpdateSet[] = [
  {
    id: "update-set-1",
    label: "Update Set 1",
    dateRange: "Mid-Feb to first week of March (inclusive)",
    cadenceNote: "Fortnightly update sets will follow after this period.",
    sections: [
      {
        id: "general-themes",
        title: "General Themes",
        subtitle: "Core narrative dynamics and strategic implications.",
        cards: [
          {
            id: "gt-1",
            title: "The conversation is still led by efficacy, but the sharpest unmet-need signal is what happens after lorlatinib resistance",
            body:
              "Efficacy remains the dominant frame, but the more important shift in this update is that post-lorlatinib resistance is where the conversation becomes most urgent. Multiple posts point to very low activity for attempted combination strategies, with short PFS and weak response rates turning resistance into a visible proof-point gap rather than a niche research topic. That matters because it tells us the market is no longer just asking which ALK TKI performs best upfront; it is also asking what is realistically actionable once the strongest options stop working. The practical implication is that resistance is emerging as one of the clearest spaces for high-value scientific storytelling, especially when the message is grounded in what current approaches are not yet solving.",
          },
          {
            id: "gt-2",
            title: "Brigatinib shows up less as a broad brand story and more as a precision-use asset when sequencing becomes mutation-directed",
            body:
              "Brigatinib is not dominating the overall volume, but when it does appear, it shows up in a high-value way: as a purposeful choice in a defined resistance context rather than as generic class chatter. The strongest example is the case-based discussion of sustained complete response after alectinib in an I1171N setting, paired with explicit emphasis on re-biopsy and mutation-directed sequencing. That pattern matters because it suggests brigatinib's most credible lane in this dataset is not breadth, but specificity. The strategic implication is that brigatinib can win disproportionate authority when the narrative is tied to molecular decision-making, resistance mutation logic, and why the next TKI choice should be evidence-shaped rather than automatic.",
          },
        ],
      },
      {
        id: "trends",
        title: "Trends",
        subtitle: "High-salience decision filters and momentum patterns.",
        cards: [
          {
            id: "tr-1",
            title: "CNS remains one of the highest-yield attention zones, but the strongest pull is still concentrated around next-generation leaders",
            body:
              "CNS/brain metastases continues to behave like a high-salience clinical lens, especially when baseline brain involvement is made explicit. The update includes both meta-analytic and shorthand clinician posts reinforcing that intracranial response is a major decision filter, and that later-generation TKIs are the benchmark against older options in this space. Importantly, the tone of the CNS conversation is not casual; it reads like a credibility test for frontline choice. The implication is that CNS still functions as one of the clearest gateways into treatment preference, but it is also a highly competitive lens, so any attempt to enter it needs to be anchored in concrete clinical logic rather than broad \"brain mets matter\" messaging.",
          },
          {
            id: "tr-2",
            title: "The update is not driven by steady share growth - it is driven by a few concentrated evidence bursts and proof-point posts",
            body:
              "This cut of conversation behaves less like a continuous narrative and more like a sequence of sharp evidence spikes. High-information posts carrying endpoints, named combinations, specific mutations, or policy/actionable access changes do disproportionate work relative to lightweight product mentions. In practice, that means a single post with real numbers, a real resistance lesson, or a real-world sequencing signal travels further than broad promotional language. The strategic lesson is that attention is clustering around posts that help people decide, not just remember. For Alunbrig, that favors a content strategy built around interpretable clinical proof-points, case-based sequencing logic, and concrete system-level relevance rather than undifferentiated brand presence.",
          },
        ],
      },
      {
        id: "audience",
        title: "Audience",
        subtitle: "How HCP and non-HCP narratives diverge.",
        cards: [
          {
            id: "au-1",
            title: "HCP discussion is where clinical meaning is made, while non-HCP voices pull the story toward cost burden, recurrence anxiety, and practical access",
            body:
              "The HCP layer of this update is where the most consequential framing happens: resistance biology, intracranial efficacy, sequencing after prior TKIs, and interpretation of evidence quality. By contrast, advocacy and caregiver signals are fewer, but they are emotionally concentrated around affordability, customs-duty relief, and fear of recurrence after response. That split matters because the two audiences are not reacting to the same story. HCPs are asking what works, when, and why; patients and families are asking whether they can afford it, how long it will last, and what happens next. The implication is that one message system will not serve both audiences well. Clinical authority content and support/access content need to be deliberately separated rather than blended.",
          },
        ],
      },
      {
        id: "competitor-lens",
        title: "Competitor Lens",
        subtitle: "Where brigatinib can insert against dominant competitor narratives.",
        cards: [
          {
            id: "cl-1",
            title: "The competitor landscape is still anchored by alectinib and lorlatinib, while brigatinib's opening is in the spaces they leave unresolved",
            body:
              "Alectinib and lorlatinib continue to define the mental scoreboard: alectinib through strong response and early-stage standard-setting, lorlatinib through best-in-class PFS and strong CNS/resistance-adjacent visibility. That makes the competitive problem less about direct volume parity and more about where those dominant narratives become vulnerable or incomplete. In this update, the clearest openings are mutation-specific sequencing after prior ALK TKIs, the dissatisfaction around post-lorlatinib resistance strategies, and market-specific access stories where brigatinib is directly relevant. The practical insight is that brigatinib does not need to out-shout the leading brands everywhere; it needs to insert itself where the current leaders do not fully answer the decision problem.",
          },
        ],
      },
    ],
  },
]

export function ExecutiveSummaryExplorer() {
  const [activeUpdateSetId, setActiveUpdateSetId] = useState(EXECUTIVE_UPDATE_SETS[0]?.id ?? "")
  const [activeSectionId, setActiveSectionId] = useState(EXECUTIVE_UPDATE_SETS[0]?.sections[0]?.id ?? "")
  const activeUpdateSet = useMemo(
    () => EXECUTIVE_UPDATE_SETS.find((updateSet) => updateSet.id === activeUpdateSetId) ?? EXECUTIVE_UPDATE_SETS[0],
    [activeUpdateSetId],
  )
  const activeSections = activeUpdateSet?.sections ?? []

  const activeSection = useMemo(
    () => activeSections.find((section) => section.id === activeSectionId) ?? activeSections[0],
    [activeSectionId, activeSections],
  )

  const handleUpdateSetChange = (updateSetId: string) => {
    const nextSet = EXECUTIVE_UPDATE_SETS.find((updateSet) => updateSet.id === updateSetId)
    setActiveUpdateSetId(updateSetId)
    setActiveSectionId(nextSet?.sections[0]?.id ?? "")
  }

  if (!activeUpdateSet || !activeSection) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.12] via-card/60 to-card p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Executive Summary
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Key Takeaway Cards</h1>
          <p className="max-w-4xl text-sm text-muted-foreground">
            Executive summary cards structured into narrative sections so each insight is easier to scan, present, and operationalize.
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Update Set</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:max-w-md">
            <Select value={activeUpdateSet.id} onValueChange={handleUpdateSetChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXECUTIVE_UPDATE_SETS.map((updateSet) => (
                  <SelectItem key={updateSet.id} value={updateSet.id}>
                    {updateSet.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Date range: {activeUpdateSet.dateRange}
              {activeUpdateSet.cadenceNote ? ` - ${activeUpdateSet.cadenceNote}` : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activeSections.map((section) => {
              const isActive = section.id === activeSection.id
              return (
                <Button
                  key={section.id}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setActiveSectionId(section.id)}
                >
                  {section.title}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-lg">{activeSection.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{activeSection.subtitle}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {activeSection.cards.map((card, idx) => (
              <Card key={card.id} className="h-full border-border/70 bg-gradient-to-b from-card to-card/70 shadow-sm">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <Badge variant="outline">Key Takeaway</Badge>
                  </div>
                  <CardTitle className="text-base leading-tight">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

