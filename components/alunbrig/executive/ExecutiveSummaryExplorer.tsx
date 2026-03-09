"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  timelineLabel: string
  dateRange: string
  cadenceNote?: string
  isLocked?: boolean
  lockLabel?: string
  sections: SummarySection[]
}

const ALL_EXECUTIVE_SECTIONS: SummarySection[] = [
  {
    id: "general-themes",
    title: "General Themes",
    subtitle: "Core narrative dynamics, attention patterns, and strategic implications.",
    cards: [
      {
        id: "gt-1",
        title: "Efficacy is not just the biggest theme - it is the attention magnet",
        body:
          "Efficacy dominates the conversation, but the more important point is that it over-performs on attention relative to its size. In other words, when people talk efficacy, it tends to travel further and land harder than average. This suggests the market is rewarding outcomes-oriented messaging with higher amplification, not just steady background discussion. Within efficacy content, there is also a meaningful overlay of CNS language, indicating the conversation often links 'does it work?' with 'does it work in the brain?' The takeaway for Takeda is that efficacy is not merely table stakes here - it is the core attention engine for the whole ecosystem.",
      },
      {
        id: "gt-2",
        title: "CNS/Brain Mets is a high-yield storyline: smaller slice, outsized pull",
        body:
          "CNS/Brain Mets is a smaller portion of the dataset, but it punches above its weight on both engagement and views. That usually means the audience treats CNS as a decision-shaping filter, not a niche academic detail. The topic 'Brain metastases' is also a pure CNS signal and acts as a clean anchor for this discussion, which makes it easy to build coherent narrative cards from it. Importantly, CNS shows up beyond the CNS bucket too, including in outcome-led topics like overall survival and disease-free survival, which implies CNS is being discussed as part of broader efficacy credibility. The practical insight: CNS is one of the clearest places where Takeda can win disproportionate attention per unit of conversation.",
      },
      {
        id: "gt-3",
        title: "The biggest attention winners are peri-/neo-adjuvant outcome narratives",
        body:
          "The single strongest attention cluster is around neoadjuvant alectinib and pathologic response (plus related endpoints like MPR/pCR). These are not just high-volume topics; they also generate high engagement and very strong views per post, which is what you see when content feels 'new,' 'clinically meaningful,' or 'conference-adjacent.' This is a signal that early-stage / perioperative framing is where curiosity and sharing behavior concentrate, even if day-to-day practice is still metastatic-weighted. For Takeda, this matters because it shapes what clinicians and commentators are leaning into as 'future-facing' ALK discussion. Net: peri-/neo-adjuvant outcomes are functioning like a high-energy narrative lane.",
      },
      {
        id: "gt-4",
        title: "Sequencing is not one story - it splits into pathway debate vs topic outliers",
        body:
          "Sequencing is structurally owned by the sequencing bucket, but the interesting part is that sequencing spikes inside specific topics, especially first-line treatment, which is heavily sequencing-coded. That means 'sequencing' is not just generic line-of-therapy chatter - it concentrates when people argue the starting point and what comes next. Competitor discourse also carries elevated sequencing incidence, which implies competitor talk is often really a proxy debate about optimal order rather than product-to-product comparisons in isolation. The net insight: sequencing is a choice architecture conversation, and first-line framing is the lever that turns it from background to high-salience. Takeda can treat sequencing as a targeted storyline rather than a broad theme.",
      },
      {
        id: "gt-5",
        title: "UK access is narrow, but it is highly concentrated and policy-shaped",
        body:
          "UK access is not frequent overall, but when it appears it is high-specificity and tied to policy language that travels through recognisable anchors like NICE and criteria framing. The UK-heavy topics are especially clean: 'NICE recommendation' is an unambiguous policy signal, and 'first-line lorlatinib' carries strong UK association as well. This suggests UK access content is less general affordability talk and more decision or eligibility mechanics that certain audiences track closely. The implication for Takeda is that UK access is not a volume game - it is a precision narrative where a small number of posts can shape stakeholder interpretation. If you are going to speak into it, it needs to be exact and credible, because it is not diluted by noise.",
      },
      {
        id: "gt-6",
        title: "Sentiment splits cleanly: endpoints inspire, real-world frictions feel heavier",
        body:
          "The most positive sentiment clusters around outcomes endpoints - disease-free survival, overall survival, pathologic response, and neoadjuvant efficacy narratives. In contrast, lower sentiment concentrates in more practical or frictional topics like real-world evidence, weight gain, and safety or tolerability. That split is useful because it shows what the market experiences as progress versus trade-off management. It also flags a risk: even when efficacy is strong, tolerability and lived-experience signals can pull tone down if they become more prominent. For Takeda, this suggests an executive narrative structure that pairs headline outcomes with confidence-building management guidance to prevent the conversation from drifting into friction.",
      },
    ],
  },
  {
    id: "trends",
    title: "Trends",
    subtitle: "Temporal momentum, spike behavior, and period-driven strategic implications.",
    cards: [
      {
        id: "tr-1",
        title: "The year is driven by a handful of event weeks, not steady growth",
        body:
          "This trendline is not a gradual build - it is event-driven, with a few weeks doing disproportionate work. Only 4 alert weeks (about 9% of weeks) account for 109 posts - more than a quarter of the entire year's conversation. That is a classic pattern for conference readouts, major data drops, or high-salience news cycles: attention surges, then quickly normalises. The practical implication is that timing and packaging around key moments matters more than trying to raise the baseline week-by-week. For Takeda, this suggests planning content to ride spikes (and extend them) is more impactful than trying to smooth the curve.",
      },
      {
        id: "tr-2",
        title: "The two defining moments are back-to-back and outcomes-led (with strong tone)",
        body:
          "The biggest consecutive surges are 2025-W42 and 2025-W43, and they are both high sentiment weeks with strong HCP participation. These weeks pull in survival or outcomes language repeatedly (overall survival and disease-free survival concepts recur across alerts), which aligns with the idea that the audience is responding to meaningful endpoints rather than general brand chatter. Importantly, these are not hot takes weeks - they read like data validation weeks (milestone framing, strong metrics, reinforces standard-of-care language). If you want to explain the year's narrative arc to an exec in one sentence: late-year outcomes readouts shaped the conversation most.",
      },
      {
        id: "tr-3",
        title: "Efficacy is the only theme that repeatedly breaks baseline",
        body:
          "Across the alert system, Efficacy is the repeat trigger - it shows up as the dominant mix in 3 of the 4 alerts, and it peaks in W43. That is not just because it is big overall; it is because efficacy content is the kind that creates abnormal surges, not just steady volume. Said differently: the market's attention reflex is strongest when efficacy data is on the table. For Takeda, this is a signal that efficacy narratives can be treated as spike starters-the content most likely to generate sharp increases in reach and discussion density. The corollary is that non-efficacy themes may be better positioned as spike extenders (supporting angles that keep the week alive).",
      },
      {
        id: "tr-4",
        title: "CNS behaves like a multiplier during the biggest outcome weeks",
        body:
          "CNS signal intensity climbs inside the two defining spike weeks (W42/W43), meaning CNS is not just a separate niche wave - it co-travels with outcomes when attention is highest. In those peak weeks, CNS incidence is notably elevated alongside strong sentiment, which suggests the audience is evaluating how strong is the data? together with does it hold in the brain? There are also separate CNS-heavy weeks (for example, weeks with especially high CNS incidence), but the key commercial insight is that CNS becomes most visible when it is attached to broader efficacy moments. For Takeda, the implication is that CNS framing is most powerful when it is positioned as a proof-point that strengthens the efficacy story, not as a standalone message competing for attention.",
      },
      {
        id: "tr-5",
        title: "Sequencing is structurally present, but it cools over the year and is not the spike driver",
        body:
          "Sequencing shows up consistently across the year, but its intensity declines meaningfully from early to late windows. That pattern suggests that the conversation becomes less about what do I use after what? over time, and more about digesting results and implications when major events hit. Crucially, the biggest alert weeks are not the most sequencing-heavy weeks - sequencing can surge in specific weeks, but it does not explain the largest baseline breaks. For Takeda, this points to a useful split: treat sequencing as a targeted HCP decision-support storyline, rather than the main lever for broad attention. Sequencing is important, but it behaves like a clinician utility thread, not a mass-amplification trigger.",
      },
      {
        id: "tr-6",
        title: "Access/policy appears as a distinct mini-wave with friction language",
        body:
          "Separate from data-driven spikes, there is a clear policy or access mini-wave that clusters into specific weeks and appears explicitly in alert drivers and topics (GST and not GST-free frustration; Blueteq or criteria language; NICE-linked framing). This is a different kind of attention: less celebration of endpoints and more system friction and eligibility mechanics. It also tends to appear as a secondary co-theme in at least one major spike week, implying access talk can ride the same attention cycles as efficacy. For Takeda, the opportunity is to treat access as a precision comms lane: when it appears, it is specific, emotionally loaded, and likely to influence stakeholder interpretation even at low volume. The risk is that access narratives can pull tone down if left unaddressed during peak-attention windows.",
      },
    ],
  },
  {
    id: "audience",
    title: "Audience",
    subtitle: "Stakeholder-specific narrative dynamics, signal concentration, and comms implications.",
    cards: [
      {
        id: "au-1",
        title: "The conversation is HCP-led and that is where clinical meaning is made",
        body:
          "Hard attribution shows the discussion is structurally HCP-dominant (about half of all posts), which matters because it means the narrative is being shaped in a clinical, evidence-first register. In HCP content, sequencing and CNS both over-index versus baseline, signalling that clinicians are not just discussing does it work, but where does it fit and what about the brain. The HCP topic spine is consistent: overall survival, neoadjuvant alectinib, pathologic response, resistance mechanisms, plus ALK+ NSCLC endpoints like MPR/pCR. This is the audience where Alunbrig's perceived role will be influenced most by data interpretation and line-of-therapy framing, not awareness messaging. If Takeda wants to move the narrative, it has to win inside this clinical logic.",
      },
      {
        id: "au-2",
        title: "CNS is disproportionately an HCP lens - it is part of how credibility is judged",
        body:
          "CNS signal rates are much higher in the HCP audience than the overall baseline, which suggests CNS is functioning as a clinical filter rather than a general-interest theme. That pattern implies CNS performance is being used as a proxy for robustness and real-world relevance in ALK+ decision-making. Importantly, CNS appears in both dedicated CNS discussion and in broader efficacy conversations clinicians engage with. For Takeda, the implication is that CNS should not be treated as a niche substory - in this dataset it behaves more like a credibility amplifier for clinical audiences. When HCPs are active, CNS is one of the strongest make this matter lenses they bring.",
      },
      {
        id: "au-3",
        title: "Patient and caregiver posts are few, but unusually concentrated around QoL + affordability",
        body:
          "Patient and caregiver volumes are small, but what is striking is how different the content mix is when they do speak. Patient posts are heavily QoL-coded, and caregiver posts strongly cluster around burden and affordability, including distress and burden language that does not show up in HCP conversation. Topic examples reinforce this: patient experience and treatment experience nodes, and caregiver affordability and cost-support requests. This is not an efficacy debate - it is a lived-experience and access friction narrative. For Takeda, the actionable insight is that a separate support and navigation storyline is needed for these audiences; clinical data alone does not address what is animating them.",
      },
      {
        id: "au-4",
        title: "When non-HCP voices appear, access mechanics and cost reality are the emotional drivers",
        body:
          "Even with low counts, the pattern is consistent: non-HCP voices are pulled toward affordability, pricing, access barriers, and how do I get help questions. Caregiver content is especially fragile and concentrated (high topic concentration), meaning a small number of posts can shape perceived tone quickly. This is also where sentiment can swing negative: affordability nodes in caregiver content are associated with very low sentiment scores. The takeaway is not scale - it is reputational sensitivity: access and cost narratives can punch above volume because they carry emotion and can be easily amplified. If Takeda speaks into this space, it needs to be practical and specific (signposting, support pathways, clarity), not brand-level reassurance.",
      },
      {
        id: "au-5",
        title: "Competitive talk dominates across audiences, but is rarely framed as Alunbrig versus X",
        body:
          "Across HCP, patient, caregiver, and broader conversation, competitive mentions are mostly competitor-centric rather than explicitly comparative to Alunbrig. The stance toward Alunbrig is largely not applicable or unclear, which means the market is often discussing the ALK class and leading agents without directly placing Alunbrig in the matchup. The most common competitor names are consistent: alectinib, lorlatinib, crizotinib. This is an important commercial insight: Alunbrig may not be losing debates - it may simply be absent from the comparison frame in much of the discussion. The opportunity is to create credible reasons to include Alunbrig in the mental shortlist, especially where sequencing and CNS questions are being asked.",
      },
      {
        id: "au-6",
        title: "UK/payer access signal exists, but is thin - treat it as a watchlist, not a headline",
        body:
          "Payer volume is extremely small in this slice, so it is not safe to overstate payer trends. That said, the payer and UK access lens that does appear is highly policy-specific (for example, Scotland/SMC framing and nation-level differences), which is exactly how access narratives often emerge: small, technical, and decisive. The value here is early warning, not scale - it flags that nation-level access differences can become a storyline when they surface. For Takeda, the practical approach is to monitor and be ready with precise, non-promotional clarity on pathways and criteria. This is a precision comms lane: low volume, high consequence.",
      },
    ],
  },
  {
    id: "competitor-lens",
    title: "Competitor Lens",
    subtitle: "Competitive framing dynamics, category benchmarks, and strategic insertion points.",
    cards: [
      {
        id: "cl-1",
        title: "Competitor talk overwhelms the dataset, but it is not Alunbrig vs X",
        body:
          "Most of this conversation is competitive in nature (about 9 in 10 posts), but the surprising part is how rarely it is framed as a direct head-to-head with Alunbrig. The dominant context is competitor-only or broader class discussion, while explicit Alunbrig versus competitor framing is only a small fraction. Stance is mostly not applicable or unclear, which means the market is often talking about ALK therapy through the leading competitor narratives, not by explicitly evaluating Alunbrig. This is a different problem than negative sentiment - it is share-of-frame: Alunbrig is frequently not the reference point in the comparison. For Takeda, the core challenge is less rebuttal and more earning inclusion in the comparison set.",
      },
      {
        id: "cl-2",
        title: "The landscape is concentrated around a familiar triad and that shapes what good looks like",
        body:
          "Even with 16 competitors detected, attention concentrates heavily in a top cluster, meaning the market's mental model is anchored by a small set of familiar agents. That concentration matters because it tends to standardise the attributes people use to judge the class - the default scoreboard becomes whatever the triad is known for. In this dataset, that scoreboard repeatedly leans on efficacy first, with sequencing and CNS as persistent secondary lenses. Once those lenses dominate the discourse, products that are not explicitly tied to them struggle to enter the conversation. So the competitive environment is not wide open; it is structured around a few dominant narratives that set the terms of debate.",
      },
      {
        id: "cl-3",
        title: "Efficacy is the primary comparative currency; CNS and sequencing are differentiator lanes",
        body:
          "When posts become comparative, the most common attribute frame is efficacy, and it also carries a relatively strong tone. But what is more commercially useful is the pattern that CNS and sequencing recur as the next differentiators across competitor slices. CNS-heavy content appears repeatedly across major competitors, which suggests brain control functions as a near-universal filter in ALK comparisons. Sequencing also shows up consistently - not necessarily as a headline, but as the mechanism by which people justify choices (what first, what after, what if progression). For Takeda, this implies you win attention by connecting Alunbrig to the same decision lenses the category already uses: outcomes credibility first, then CNS and sequencing clarity.",
      },
      {
        id: "cl-4",
        title: "Competitor signatures differ by brand, and Alunbrig can use that to choose where to compete",
        body:
          "Competitors do not attract the same type of conversation. For example, lorlatinib discourse shows a notable mix across efficacy, sequencing, and safety or neuro, while alectinib's mix leans toward efficacy plus competitor framing and sequencing. Crizotinib appears frequently in efficacy and sequencing context as well, often serving as a comparator anchor in discussions of benefit or no-benefit. These signature mixes tell you where each competitor owns mindshare (for example, safety/neuro association vs sequencing debates vs efficacy primacy). Takeda can use this to avoid trying to fight every battle everywhere; instead, choose one to two narrative lanes where Alunbrig can be credibly inserted and repeated until it becomes part of the reflex comparison.",
      },
      {
        id: "cl-5",
        title: "There is a recurring evidence clarity gap, and that is a real strategic opportunity",
        body:
          "A meaningful portion of competitive discourse is evidence-light in the body of posts (for example, endpoints not in-text, details behind link not available, OS immaturity, limited detail or case report). That matters because it creates a market dynamic where many people share claims without the supporting context that would let others evaluate them. In an HCP- and media-heavy conversation, this becomes a credibility and interpretation risk: the loudest take can win simply because it is easiest to repeat. For Takeda, this is a concrete opportunity: become the source of clear, in-post endpoint explanation and practical interpretation (without overclaiming), so Alunbrig content is easier to cite and harder to distort.",
      },
      {
        id: "cl-6",
        title: "Access and policy signals are small but persistent, and often attach to big competitor names",
        body:
          "UK and access signals are not the dominant driver of competitive talk, but they recur and cluster more strongly around certain competitor slices than others. That pattern is important because access narratives can travel quickly once they latch onto a well-known brand - especially when they involve criteria, reimbursement, or why cannot patients get X friction. Even when volume is low, policy talk can influence the perceived practicality of therapies and therefore the competitive frame. For Takeda, access is not a mass-volume storyline here; it is a precision vulnerability or opportunity that can be activated in bursts. The right play is to monitor and be prepared with specific pathway clarity rather than broad messaging.",
      },
    ],
  },
]

const UPDATE_SET_1_SECTIONS: SummarySection[] = [
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
]

const EXECUTIVE_UPDATE_SETS: SummaryUpdateSet[] = [
  {
    id: "all",
    label: "All",
    timelineLabel: "Baseline",
    dateRange: "Full original executive summary set",
    sections: ALL_EXECUTIVE_SECTIONS,
  },
  {
    id: "update-set-1",
    label: "Update Set 1",
    timelineLabel: "Mid-Feb to Wk 1 Mar",
    dateRange: "Mid-Feb to first week of March (inclusive)",
    cadenceNote: "Fortnightly update sets will follow after this period.",
    isLocked: true,
    lockLabel: "Under expert review",
    sections: UPDATE_SET_1_SECTIONS,
  },
]

export function ExecutiveSummaryExplorer() {
  const [activeUpdateSetId, setActiveUpdateSetId] = useState("all")
  const [activeSectionId, setActiveSectionId] = useState(ALL_EXECUTIVE_SECTIONS[0]?.id ?? "")
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

      <div className="rounded-xl border border-border/60 bg-card/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-7">
            Update Set
          </Badge>
          {EXECUTIVE_UPDATE_SETS.map((updateSet) => (
            <div key={updateSet.id} className="flex items-center gap-2">
              <Button
                type="button"
                variant={activeUpdateSet.id === updateSet.id ? "default" : "outline"}
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => handleUpdateSetChange(updateSet.id)}
                disabled={Boolean(updateSet.isLocked)}
                aria-disabled={Boolean(updateSet.isLocked)}
              >
                {updateSet.label}
              </Button>
              {updateSet.isLocked ? (
                <span className="inline-flex animate-pulse items-center rounded-full border border-amber-300/60 bg-amber-100/70 px-2 py-0.5 text-[10px] font-medium text-amber-900 shadow-[0_0_12px_rgba(251,191,36,0.45)] dark:border-amber-700/70 dark:bg-amber-500/15 dark:text-amber-200">
                  {updateSet.lockLabel ?? "Under review"}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="relative h-5">
            <div className="absolute left-1 right-1 top-2.5 h-px bg-border/70" />
            {EXECUTIVE_UPDATE_SETS.map((updateSet, idx) => {
              const left = EXECUTIVE_UPDATE_SETS.length <= 1 ? 0 : (idx / (EXECUTIVE_UPDATE_SETS.length - 1)) * 100
              const isActive = activeUpdateSet.id === updateSet.id
              return (
                <div
                  key={updateSet.id}
                  className={`absolute top-1.5 h-2 w-2 -translate-x-1/2 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
                  style={{ left: `${left}%` }}
                  title={`${updateSet.label}: ${updateSet.dateRange}`}
                />
              )
            })}
          </div>
          <div className="flex items-start justify-between gap-2 text-[11px] text-muted-foreground">
            {EXECUTIVE_UPDATE_SETS.map((updateSet) => (
              <span key={`${updateSet.id}-label`} className={activeUpdateSet.id === updateSet.id ? "text-foreground" : ""}>
                {updateSet.timelineLabel}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Date range: {activeUpdateSet.dateRange}
            {activeUpdateSet.cadenceNote ? ` - ${activeUpdateSet.cadenceNote}` : ""}
          </p>
        </div>
      </div>

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

