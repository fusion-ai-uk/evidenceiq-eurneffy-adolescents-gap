"use client"

import * as React from "react"
import { AnalysisSectionHeader } from "@/components/evidenceiq/analysis-components"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type RecommendationCard = {
  id: string
  title: string
  recommendation: string
  why: string
  implication: string[]
  direction: string[]
  whyEurneffy: string
  guardrails: string[]
}

const PRIMARY_RECOMMENDATIONS: RecommendationCard[] = [
  {
    id: "reduce-barriers",
    title: "Lead with reduce-the-barriers framing",
    recommendation:
      "Make the core message about reducing everyday friction that gets in the way of carrying and using rescue treatment, rather than asking adolescents to be more responsible.",
    why:
      "The analysis consistently shows stacked barriers rather than a single driver. Multiple barriers and improve outcomes are the strongest-performing narrative pillars, with repeated signals across training, hesitation, carry burden, and execution under pressure.",
    implication: [
      "This is hard in real life.",
      "Barriers are real.",
      "Reducing friction matters.",
      "Support should fit how teenagers actually live, move, socialise, and decide under pressure.",
    ],
    direction: [
      "It is not just about knowing what to do. It is about having something that feels realistic to carry and use.",
      "For teens, rescue readiness has to work in real life, not just in theory.",
    ],
    whyEurneffy:
      "Creates a strong umbrella for needle-free, discreet, and convenience-led messaging without overclaiming.",
    guardrails: ["Avoid blame-based language about teens.", "Do not frame this as non-compliance alone."],
  },
  {
    id: "confidence-to-act",
    title: "Prioritise confidence to act fast",
    recommendation:
      "Position rapid, confident action as a central message route: hesitation and uncertainty are practical barriers that can be reduced.",
    why:
      "Recognition and response is one of the strongest message territories in the evidence. The pattern repeatedly shows delayed adrenaline use, uncertainty about severity, uncertainty about when/how to act, and technique failure under stress.",
    implication: ["Be ready to act.", "Do not get stuck in doubt.", "Confidence and clarity matter in the moment."],
    direction: [
      "When symptoms escalate, hesitation is the danger.",
      "Confidence in the moment matters as much as preparation beforehand.",
      "A simpler-feeling rescue option may help support faster action when paired with strong training.",
    ],
    whyEurneffy:
      "Supports a credible training re-engagement and readiness narrative, framed as practical support rather than outcome proof.",
    guardrails: [
      "Do not imply training is optional.",
      "Continue to anchor action plans, emergency escalation, shared decision-making, and device familiarisation.",
    ],
  },
  {
    id: "real-life-settings",
    title: "Make messaging live in real-life settings",
    recommendation:
      "Anchor narrative in day-to-day adolescent contexts such as school, transition times, home, social settings, travel, and sport.",
    why:
      "The strongest contextual pattern is not clinic-centric. Risk and friction are repeatedly surfaced in community and school-linked settings where routine and supervision vary.",
    implication: [
      "Risk does not wait for the perfect setting.",
      "Rescue readiness has to work in school, after school, at home, out with friends, and on the move.",
    ],
    direction: [
      "The right option has to fit real life.",
      "Readiness should be practical in everyday transitions, not only in clinical conversations.",
    ],
    whyEurneffy:
      "Supports portability, discretion, and practical carry framing without forcing hard efficacy claims.",
    guardrails: ["Do not overstate under-evidenced settings as equally proven.", "Keep setting claims proportional to evidence strength."],
  },
  {
    id: "risk-with-empowerment",
    title: "Use risk to create urgency, then pivot to empowerment",
    recommendation:
      "Keep a serious risk signal, but avoid fear-only messaging. Use risk to justify readiness and support, not alarm-driven persuasion.",
    why:
      "High-risk signals matter, but behavioral evidence suggests fear alone does not resolve hesitation, avoidance, or false confidence.",
    implication: ["Serious, not alarmist.", "Urgent, not punitive.", "Empowering, not shaming."],
    direction: [
      "Anaphylaxis can escalate fast. Being ready to act matters.",
      "This is serious, but practical barriers can be reduced.",
      "The goal is not fear. The goal is readiness.",
    ],
    whyEurneffy:
      "Maintains a credible role for EURneffy as a practical readiness enabler rather than a total solution.",
    guardrails: [
      "Avoid melodramatic fatality-led headlines.",
      "Avoid implying a different device alone resolves delayed response.",
    ],
  },
  {
    id: "positioning-guarded",
    title: "Position EURneffy as barrier-reduction option",
    recommendation:
      "Frame EURneffy as a potentially helpful option for reducing reluctance linked to carrying, visibility, convenience, and needles, while remaining explicitly evidence-led.",
    why:
      "Opportunity signals are strong but mostly contextual rather than direct proof. The strongest support is around training re-engagement, convenience/adherence relevance, discreet portability, and needle-free relevance.",
    implication: [
      "For the right patient, a more compact needle-free option may reduce everyday readiness barriers.",
      "Use as a practical option framing, not a universal replacement claim.",
    ],
    direction: [
      "Barrier-reduction option for appropriate patients.",
      "Supports readiness conversations when paired with training and action planning.",
    ],
    whyEurneffy:
      "Balances opportunity with caution and aligns to the strongest defensible interpretation from the analysis.",
    guardrails: [
      "No superiority claims.",
      "No direct guaranteed-outcome claims.",
      "No universal replacement language.",
      "No implication that training is no longer needed.",
    ],
  },
]

const SUPPORTING_THEMES = [
  {
    title: "Two doses, in date, ready to go",
    copy:
      "Use this as a practical-readiness support theme, not the lead brand platform. Keep emphasis on readiness in real life rather than checklist-heavy technical messaging.",
  },
  {
    title: "Dosing transitions as validation need",
    copy:
      "Keep dosing transitions visible as a watch-out and review theme, but not as the primary adolescent creative territory until stronger direct evidence is available.",
  },
]

const DO_NOT_LEAD_WITH = [
  "Do not lead with equity/access as the main adolescent message platform.",
  "Do not turn the tab into a dosing-led narrative.",
  "Do not present EURneffy as proven to improve outcomes from this analysis alone.",
]

const EVIDENCE_GAPS_TO_CLOSE = [
  "UK adolescent real-world carriage and use patterns.",
  "UK adolescent delay, hesitation, and real-world error data.",
  "Setting-specific metrics for school, sport, travel, and weekend pathways.",
  "Stronger adolescent-specific evidence on device switching, confidence, and outcomes.",
]

export default function MessagingRecommendationsPage() {
  const [activeCard, setActiveCard] = React.useState(PRIMARY_RECOMMENDATIONS[0].id)
  const selected = PRIMARY_RECOMMENDATIONS.find((card) => card.id === activeCard) ?? PRIMARY_RECOMMENDATIONS[0]

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader
        title="Messaging Recommendations"
        description="Strategic recommendation layer built from the full analysis and extracted evidence corpus across the app."
      />

      <section id="messaging-hero" className="scroll-mt-24">
        <Card className="border-primary/20 bg-gradient-to-br from-indigo-500/10 via-background to-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-base">What the full analysis supports most strongly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              This recommendation layer rolls up the entire analysis corpus (all extracted rows and supporting evidence extracts
              shown elsewhere in the app). The strongest strategic case is a barrier-reduction story for UK adolescents: make rescue
              readiness easier, more normal, more discreet, and more actionable in real-life settings.
            </p>
            <p>
              The evidence supports training/rehearsal, confidence under pressure, practical carry burden, and setting context more
              strongly than hard efficacy or outcome-claim territory. EURneffy is best framed as an evidence-linked barrier-reduction
              option, with explicit caution that most support is contextual rather than direct proof.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Multiple Barriers and Improve Outcomes lead</Badge>
              <Badge variant="secondary">Recognition and Response is strongest action territory</Badge>
              <Badge variant="secondary">Dosing transitions remain strategically important but under-evidenced</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="messaging-hierarchy" className="scroll-mt-24 space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Recommended Message Hierarchy</h2>
        <div className="grid gap-3 xl:grid-cols-[1.1fr_1.9fr]">
          <Card className="border-border/70">
            <CardContent className="p-3">
              <div className="grid gap-2">
                {PRIMARY_RECOMMENDATIONS.map((item, index) => (
                  <Button
                    key={item.id}
                    variant={item.id === selected.id ? "default" : "outline"}
                    className="h-auto justify-start whitespace-normal text-left"
                    onClick={() => setActiveCard(item.id)}
                  >
                    <div>
                      <p className="text-xs opacity-80">Priority {index + 1}</p>
                      <p className="text-sm">{item.title}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/25 bg-card/90 shadow-[0_12px_30px_color-mix(in_oklch,var(--primary)_12%,transparent)]">
            <CardHeader>
              <CardTitle className="text-base">{selected.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Recommendation</p>
                <p className="text-muted-foreground">{selected.recommendation}</p>
              </div>
              <div>
                <p className="font-medium">Why this should lead</p>
                <p className="text-muted-foreground">{selected.why}</p>
              </div>
              <div>
                <p className="font-medium">Strategic implication</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selected.implication.map((line) => (
                    <Badge key={line} variant="secondary">
                      {line}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Illustrative messaging direction</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {selected.direction.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-2.5">
                <p className="font-medium">Why this helps EURneffy</p>
                <p className="text-muted-foreground">{selected.whyEurneffy}</p>
              </div>
              <div>
                <p className="font-medium">Guardrails</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {selected.guardrails.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="messaging-supporting" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Secondary Supporting Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {SUPPORTING_THEMES.map((item) => (
              <div key={item.title} className="rounded-lg border border-border/70 bg-background/50 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="messaging-watchouts" className="scroll-mt-24">
        <Card className="border-amber-500/35 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">What Not to Overclaim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {DO_NOT_LEAD_WITH.map((item) => (
                <div key={item} className="rounded-md border border-amber-500/30 bg-background/70 px-3 py-2 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="messaging-gaps" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evidence Gaps Still to Close</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {EVIDENCE_GAPS_TO_CLOSE.map((item) => (
              <div key={item} className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="messaging-bottom-line" className="scroll-mt-24">
        <Card className="border-fuchsia-500/35 bg-gradient-to-r from-fuchsia-500/10 via-background to-indigo-500/10">
          <CardHeader>
            <CardTitle className="text-base">Bottom-line Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Lead with <span className="font-medium text-foreground">make rescue readiness easier in real teen life</span>, then
            support with confidence-to-act and real-world setting context. Keep the EURneffy bridge focused on barrier reduction,
            discretion, convenience, and needle-free relevance, with explicit caution that most support is contextual rather than
            direct proof.
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

