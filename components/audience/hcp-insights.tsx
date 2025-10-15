"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HCPCarTCentres } from "@/components/audience/hcp-cart-centres"
import { HCPDghInsights } from "@/components/audience/hcp-dgh-insights"
import { HintIcon } from "@/components/ui/hint"
import { Building2, Hospital, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type OverviewRow = {
  category: string
  hcp_volume: number
  hcp_sentiment: number
}

type SafetyRow = {
  keyword: string
  mentions: number
  hcp_sentiment: number
}


function sentimentBadge(s: number) {
  if (s >= 0.2) return { label: "Positive", variant: "default" as const }
  if (s <= -0.1) return { label: "Negative", variant: "destructive" as const }
  return { label: "Neutral", variant: "secondary" as const }
}

export function HCPInsights() {
  const [overview, setOverview] = useState<OverviewRow[]>([])
  const [allOverview, setAllOverview] = useState<OverviewRow[]>([])
  const [safety, setSafety] = useState<SafetyRow[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [view, setView] = useState<'all'|'cart'|'dgh'>('all')

  useEffect(() => {
    const site = view
    fetch(`/api/audience/overview?site=${site}`).then((r) => r.json()).then((d) => setOverview(d.rows || [])).catch(() => setOverview([]))
  }, [view])

  // Also load the global (all HCPs) overview once for baseline comparisons
  useEffect(() => {
    fetch(`/api/audience/overview?site=all`).then((r) => r.json()).then((d) => setAllOverview(d.rows || [])).catch(() => setAllOverview([]))
  }, [])

  // Fetch topic modeling rows for HCP-weighted analysis
  useEffect(() => {
    fetch(`/api/themes/query?limit=500`)
      .then((r) => r.json())
      .then((d) => setTopics(d.rows || []))
      .catch(() => setTopics([]))
  }, [])

  const pillars = useMemo(() => {
    // Exclude safety from CAR-T/DGH bars per brief
    const wanted = new Set(["treatmentthemes_efficacy", "treatmentthemes_access", "treatmentthemes_qol"]) 
    const rows = overview.filter((r) => wanted.has(r.category))
    const total = rows.reduce((a, r) => a + (r.hcp_volume || 0), 0) || 1
    return rows
      .map((r) => {
        const { label, variant } = sentimentBadge(r.hcp_sentiment ?? 0)
        const pct = Math.max(0, Math.min(100, Math.round(((r.hcp_volume || 0) / total) * 100)))
        const pretty = r.category.replace("treatmentthemes_", "").toUpperCase()
        return { theme: pretty, sentiment: label, variant, mentions: Math.round(r.hcp_volume || 0), percentage: pct }
      })
  }, [overview])

  // Derive top HCP topics using existing topic rows
  const topHcpTopics = useMemo(() => {
    const items = (topics || []).map((t) => {
      const h = Number(t.hcpScore ?? t.hcp_score ?? 0)
      const p = Number(t.patientScore ?? t.patient_score ?? 0)
      const c = Number(t.caregiverScore ?? t.caregiver_score ?? 0)
      const y = Number(t.payerScore ?? t.payer_score ?? 0)
      const denom = h + p + c + y || 1
      const hWeight = h / denom
      const interactions = Number(t.likeCount || 0) + Number(t.replyCount || 0) + Number(t.retweetCount || 0)
      const signal = hWeight * (interactions + Number(t.viewCount || 0) / 1000)
      return {
        title: String(t.topicTitle || t.topic_title || "(untitled)"),
        summary: String(t.topicSummary || t.topic_summary || ""),
        category: String(t.category || ""),
        group: String(t.groupName || t.group || ""),
        sentiment: Number(t.sentimentCompound || t.sentiment_compound || 0),
        signal,
      }
    })

    items.sort((a, b) => b.signal - a.signal)
    return items.filter((i) => !/noise|off[- ]?topic/i.test(i.title || '')).slice(0, 6)
  }, [topics])

  // Entity slices (Zynlonta vs comparators/classes)
  const entitySlices = useMemo(() => {
    const ents = [
      { key: 'zynlonta', label: 'Zynlonta', rx: /(zynlonta|loncastuximab|lonca)/i },
      { key: 'epcoritamab', label: 'Epcoritamab', rx: /epcoritamab/i },
      { key: 'glofitamab', label: 'Glofitamab', rx: /glofitamab/i },
      { key: 'car-t', label: 'CAR-T', rx: /car[- ]?t/i },
      { key: 'bispecifics', label: 'Bispecifics', rx: /bispecific/i },
    ]
    const acc: Record<string, { label: string; signal: number; sentimentSum: number; count: number; top: { title: string; sentiment: number }[] }> = {}
    for (const e of ents) acc[e.key] = { label: e.label, signal: 0, sentimentSum: 0, count: 0, top: [] }

    const rows = topHcpTopics.length ? topics : topics // use full set for breadth
    for (const t of (rows as any[])) {
      const title = String(t.topicTitle || t.topic_title || '')
      const summary = String(t.topicSummary || t.topic_summary || '')
      const group = String(t.groupName || t.group || '')
      const h = Number(t.hcpScore ?? t.hcp_score ?? 0)
      const p = Number(t.patientScore ?? t.patient_score ?? 0)
      const c = Number(t.caregiverScore ?? t.caregiver_score ?? 0)
      const y = Number(t.payerScore ?? t.payer_score ?? 0)
      const denom = h + p + c + y || 1
      const hWeight = h / denom
      const interactions = Number(t.likeCount || 0) + Number(t.replyCount || 0) + Number(t.retweetCount || 0)
      const signal = hWeight * (interactions + Number(t.viewCount || 0) / 1000)
      const sentiment = Number(t.sentimentCompound || t.sentiment_compound || 0)
      for (const e of ents) {
        if (e.rx.test(title) || e.rx.test(summary) || e.rx.test(group)) {
          const bucket = acc[e.key]
          bucket.signal += signal
          bucket.sentimentSum += sentiment
          bucket.count += 1
          if (bucket.top.length < 3) bucket.top.push({ title, sentiment })
          break
        }
      }
    }
    return Object.entries(acc).map(([key, v]) => ({ key, label: v.label, signal: v.signal, sentiment: v.count ? v.sentimentSum / v.count : 0, top: v.top }))
  }, [topics, topHcpTopics])

  // Pillar split for HCP
  const pillarSplit = useMemo(() => {
    const map: Record<string, { mentions: number; sentimentSum: number; count: number }> = {}
    const rows = topics as any[]
    for (const t of rows) {
      const cat = String(t.category || '').toLowerCase()
      if (!cat.startsWith('treatmentthemes_')) continue
      if (cat === 'treatmentthemes_safety') continue // exclude safety per brief
      const h = Number(t.hcpScore ?? t.hcp_score ?? 0)
      const p = Number(t.patientScore ?? t.patient_score ?? 0)
      const c = Number(t.caregiverScore ?? t.caregiver_score ?? 0)
      const y = Number(t.payerScore ?? t.payer_score ?? 0)
      const denom = h + p + c + y || 1
      const hWeight = h / denom
      map[cat] ||= { mentions: 0, sentimentSum: 0, count: 0 }
      map[cat].mentions += hWeight
      map[cat].sentimentSum += Number(t.sentimentCompound || t.sentiment_compound || 0)
      map[cat].count += 1
    }
    const order = ['treatmentthemes_efficacy','treatmentthemes_access','treatmentthemes_qol']
    const total = order.reduce((s, k) => s + (map[k]?.mentions || 0), 0) || 1
    return order.map(k => ({ key: k, label: k.replace('treatmentthemes_','').toUpperCase(), share: (map[k]?.mentions || 0) / total, sentiment: map[k]?.count ? map[k].sentimentSum / map[k].count : 0 }))
  }, [topics])

  // Utility: compute pillar share (Efficacy/Access/QoL only) from an overview set
  const computeShares = (rows: OverviewRow[]) => {
    const keys = ['treatmentthemes_efficacy','treatmentthemes_access','treatmentthemes_qol']
    const totals = rows.filter((r:any) => keys.includes(r.category))
    const sum = totals.reduce((s:any, r:any) => s + (r.hcp_volume || 0), 0) || 1
    const share = (k: string) => {
      const r: any = rows.find((x:any) => x.category === k) || { hcp_volume: 0, hcp_sentiment: 0 }
      return {
        share: (r.hcp_volume || 0) / sum,
        sentiment: r.hcp_sentiment || 0,
      }
    }
    return {
      efficacy: share('treatmentthemes_efficacy'),
      access: share('treatmentthemes_access'),
      qol: share('treatmentthemes_qol'),
    }
  }

  const currentShares = useMemo(() => computeShares(overview), [overview])
  const allShares = useMemo(() => computeShares(allOverview), [allOverview])

  const deltas = useMemo(() => {
    const toPct = (x:number) => Math.round(x * 100)
    const items = [
      { key: 'EFFICACY', cur: currentShares.efficacy.share, base: allShares.efficacy.share, sent: currentShares.efficacy.sentiment },
      { key: 'ACCESS',   cur: currentShares.access.share,   base: allShares.access.share,   sent: currentShares.access.sentiment },
      { key: 'QOL',      cur: currentShares.qol.share,      base: allShares.qol.share,      sent: currentShares.qol.sentiment },
    ].map(x => ({
      label: x.key,
      sharePct: toPct(x.cur),
      deltaPct: toPct(x.cur - x.base),
      sentiment: x.sent,
    }))
    items.sort((a,b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    return items
  }, [currentShares, allShares])

  // Overall tone (weighted by pillar share)
  const overallTone = useMemo(() => {
    const s = currentShares
    const weights = [s.efficacy.share, s.access.share, s.qol.share]
    const sents = [s.efficacy.sentiment, s.access.sentiment, s.qol.sentiment]
    const total = weights.reduce((a,b)=>a+b,0) || 1
    const weighted = weights.reduce((acc, w, i) => acc + w * sents[i], 0) / total
    const { label } = sentimentBadge(weighted)
    return { value: weighted, label }
  }, [currentShares])

  // Mentions tally (approximate, from overview volumes)
  const mentionsTally = useMemo(() => {
    const keys = ['treatmentthemes_efficacy','treatmentthemes_access','treatmentthemes_qol']
    const total = overview.filter((r:any) => keys.includes(r.category)).reduce((s:any,r:any)=>s + (r.hcp_volume||0),0)
    return Math.round(total)
  }, [overview])

  // Insight bullets for lay readers
  const insightBullets = useMemo(() => {
    if (!deltas.length) return [] as { title: string; desc: string }[]
    const top = deltas[0]
    const second = deltas[1]
    const dir = (d:number) => d > 0 ? 'higher focus' : 'lower focus'
    const emph = (d:number) => (d>0? '↑' : '↓') + Math.abs(d) + '%'
    return [
      { title: `${top.label}: ${emph(top.deltaPct)} vs All`, desc: `This slice shows ${dir(top.deltaPct)} on ${top.label}. Tone is ${sentimentBadge(top.sentiment).label.toLowerCase()}.` },
      { title: `${second.label}: ${emph(second.deltaPct)} vs All`, desc: `Also ${dir(second.deltaPct)} than the baseline.` },
      { title: `Overall tone: ${overallTone.label}`, desc: `Computed as a pillar‑weighted sentiment across efficacy, access and QoL. Mentions analysed ≈ ${mentionsTally.toLocaleString()}.` },
    ]
  }, [deltas, overallTone, mentionsTally])

  // Keyword lenses
  const keywordLens = useMemo(() => {
    const make = (label: string, rx: RegExp) => {
      const matches: { title: string; sentiment: number }[] = []
      let score = 0
      for (const t of (topics as any[])) {
        const text = `${t.topicTitle || ''} ${t.topicSummary || ''}`
        if (!rx.test(text)) continue
        const h = Number(t.hcpScore ?? t.hcp_score ?? 0)
        const p = Number(t.patientScore ?? t.patient_score ?? 0)
        const c = Number(t.caregiverScore ?? t.caregiver_score ?? 0)
        const y = Number(t.payerScore ?? t.payer_score ?? 0)
        const denom = h + p + c + y || 1
        const hWeight = h / denom
        const interactions = Number(t.likeCount || 0) + Number(t.replyCount || 0) + Number(t.retweetCount || 0)
        score += hWeight * (interactions + Number(t.viewCount || 0) / 1000)
        if (matches.length < 3) matches.push({ title: String(t.topicTitle || ''), sentiment: Number(t.sentimentCompound || 0) })
      }
      return { label, score, matches }
    }
    return {
      access: make('Access & Capacity', /(NICE|TA947|eligibility|capacity|staff|monitoring|inpatient|outpatient|affordab|reimburse|NHS)/i),
      sequencing: make('Sequencing & Line of Therapy', /(2L|3L|second line|third line|sequenc|reserve|late|frail)/i),
    }
  }, [topics])

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            <Users className="mr-2 h-4 w-4" />
            All HCPs
          </TabsTrigger>
          <TabsTrigger value="cart">
            <Building2 className="mr-2 h-4 w-4" />
            CAR-T Centres
          </TabsTrigger>
          <TabsTrigger value="dgh">
            <Hospital className="mr-2 h-4 w-4" />
            District General Hospitals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">What HCPs are talking about (top topics)</CardTitle>
              <div className="text-xs text-muted-foreground"><HintIcon content={"Built from HCP‑weighted engagement (interactions + views). See which topics resonate most with clinicians."} /></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topHcpTopics.map((t, i) => {
                  const { label, variant } = sentimentBadge(t.sentiment)
                  const prettyCat = t.category?.replace?.("treatmentthemes_", "").toUpperCase?.() || t.category
                  return (
                    <div key={i} className="p-3 rounded-lg bg-accent/50 flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{t.title}</span>
                          <Badge variant="secondary">{prettyCat}</Badge>
                          <Badge variant={variant}>{label}</Badge>
                        </div>
                        {t.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.summary}</p>}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">signal {(t.signal).toFixed(1)}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Removed per request: baseline comparison vs All HCPs */}

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Where HCP attention goes (Zynlonta vs competitors)</CardTitle>
              <div className="text-xs text-muted-foreground"><HintIcon content={"Signal = HCP‑weighted engagement (interactions + views). Sentiment shows tone. Compare Zynlonta with bispecifics, CAR‑T, and others."} /></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {entitySlices.map((e) => {
                  const { label, variant } = sentimentBadge(e.sentiment)
                  return (
                    <div key={e.key} className="p-3 rounded-lg bg-accent/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{e.label}</span>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round(e.signal))}%` }} />
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">Top refs: {e.top.map(t => t.title).join('; ').slice(0, 120)}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Pillars discussed by HCPs</CardTitle>
              <div className="text-xs text-muted-foreground"><HintIcon content={"Share normalised across Efficacy, Access and QoL; badge shows tone per pillar."} /></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pillarSplit.map((p, i) => {
                  const { label, variant } = sentimentBadge(p.sentiment)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-24 text-sm">{p.label}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round(p.share * 100))}%` }} />
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Signals to watch</CardTitle>
              <div className="text-xs text-muted-foreground"><HintIcon content={"Access/capacity and sequencing cues often drive prescribing decisions. These indicators surface when those narratives are active."} /></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {Object.values(keywordLens).map((k, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-accent/50">
                    <div className="text-sm font-medium text-foreground">{k.label}</div>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round(k.score))}%` }} />
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">Examples: {k.matches.map(m => m.title).join('; ').slice(0, 120)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="space-y-4 mt-4">
          {/* Re-fetch overview with CAR-T filter when this tab mounts via a tiny inline loader */}
          <div style={{ display: 'none' }}>{/* trigger fetch */}</div>
          <HCPCarTCentres />
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Theme focus (HCP-weighted)</CardTitle>
              <p className="text-sm text-muted-foreground">Share of HCP conversation and tone by pillar</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pillars.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.theme}</span>
                        <Badge variant={item.variant}>{item.sentiment}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">{item.mentions} weighted mentions</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quotes section removed per request */}
        </TabsContent>

        <TabsContent value="dgh" className="space-y-4 mt-4">
          <HCPDghInsights />
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">DGH Discussions</CardTitle>
              <p className="text-sm text-muted-foreground">Operational focus (capacity, training, AE routines)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pillars.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.theme}</span>
                        <Badge variant={item.variant}>{item.sentiment}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">{item.mentions} weighted mentions</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-destructive" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quotes section removed per request */}
        </TabsContent>
      </Tabs>

      {/* AE section removed */}
    </div>
  )
}
