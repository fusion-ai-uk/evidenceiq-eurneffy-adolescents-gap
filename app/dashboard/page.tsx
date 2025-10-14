"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { HintIcon } from "@/components/ui/hint"
import { ArrowRight, Activity, Shield, Key, HeartPulse, Eye, ThumbsUp, MessageSquare, Smile, Meh, Frown, TrendingUp, ThermometerSnowflake, Users } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

//

export default function DashboardPage() {
  const [concise, setConcise] = useState<boolean>(true)
  const [themes, setThemes] = useState<any[]>([])
  const [themesLoading, setThemesLoading] = useState<boolean>(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertsLoading, setAlertsLoading] = useState<boolean>(false)
  const [audRows, setAudRows] = useState<any[]>([])
  const [audLoading, setAudLoading] = useState<boolean>(false)

  useEffect(() => {
    setThemesLoading(true)
    fetch('/api/themes/query?limit=1000')
      .then((r) => r.json())
      .then((d) => setThemes(Array.isArray(d?.rows) ? d.rows : []))
      .catch(() => setThemes([]))
      .finally(() => setThemesLoading(false))
  }, [])

  const takeaways = useMemo(() => buildThemeTakeaways(themes), [themes])
  const trendTakeaways = useMemo(() => buildTrendTakeaways(alerts), [alerts])
  const audienceTakeaways = useMemo(() => buildAudienceTakeaways(audRows), [audRows])

  useEffect(() => {
    setAlertsLoading(true)
    fetch('/api/timeseries/alerts?minBaseline=10&limit=12')
      .then((r) => r.json())
      .then((d) => setAlerts(Array.isArray(d?.rows) ? d.rows : []))
      .catch(() => setAlerts([]))
      .finally(() => setAlertsLoading(false))
  }, [])

  useEffect(() => {
    setAudLoading(true)
    fetch('/api/audience/overview?site=all')
      .then((r) => r.json())
      .then((d) => setAudRows(Array.isArray(d?.rows) ? d.rows : []))
      .catch(() => setAudRows([]))
      .finally(() => setAudLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header + quick filters */}
      <div className="flex flex-col gap-1">
        <h1>Executive Summary</h1>
        <p className="lead">High‑level, scannable takeaways.</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="opacity-80">Legend:</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />Attention</span>
          <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />Engagement</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Conversation</span>
          <span className="inline-flex items-center gap-1"><Smile className="h-3.5 w-3.5" />Tone</span>
          <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Momentum</span>
          <span className="inline-flex items-center gap-1"><Key className="h-3.5 w-3.5" />Access</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Safety</span>
          <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Durability</span>
        </div>
      </div>

      {/* 1. Themes */}
      <Section title="General Themes" href="/themes" subtitle="Theme Explorer">
        {themesLoading && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">Loading themes…</div>
        )}
        {!themesLoading && takeaways.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">No theme data available.</div>
        )}
        {!themesLoading && takeaways.slice(0,6).map((tw, idx) => (
          <TakeawayCard key={idx} data={tw} concise={concise} />
        ))}
      </Section>

      {/* 2. Trends */}
      <Section title="Trends Explorer" href="/trends" subtitle="Above‑baseline highlights">
        {alertsLoading && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">Loading trends…</div>
        )}
        {!alertsLoading && trendTakeaways.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">No trend data available.</div>
        )}
        {!alertsLoading && trendTakeaways.slice(0,6).map((tw, idx) => (
          <TakeawayCard key={`trend-${idx}`} data={tw} concise={concise} />
        ))}
      </Section>

      {/* 3. Audience */}
      <Section title="Audience Insights" href="/audience" subtitle="Who’s driving the narrative">
        {audLoading && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">Loading audience insights…</div>
        )}
        {!audLoading && audienceTakeaways.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">No audience data available.</div>
        )}
        {!audLoading && audienceTakeaways.slice(0,6).map((tw, idx) => (
          <TakeawayCard key={`aud-${idx}`} data={tw} concise={concise} />
        ))}
      </Section>

      {/* Brief tray removed per request */}

      {/* 4. Competitors */}
      <Section title="Competitor Lens" href="/competitors" subtitle="Quick competitive posture">
        <CompetitorLensTakeaways concise={concise} />
      </Section>

      {/* Sections temporarily removed: Entity Network, Events Tracker, Content Recommendations */}
                  </div>
  )
}

/* ---------- Building blocks ---------- */

function Section({ title, subtitle, href, children }: { title: string; subtitle?: string; href: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <HintIcon content="Pin cards to build a brief. Toggle density to switch between concise and detailed views." />
          <Link
            href={href}
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] hover:bg-accent/40"
            aria-label={`Explore Data: ${title}`}
          >
            Explore Data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
            </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {children}
          </div>
        </div>
  )
}

function Card({ id, title, children, href, variant = "default", concise = true }: { id: string; title: string; children: React.ReactNode; href: string; variant?: "default" | "warning" | "positive"; concise?: boolean }) {
  const v = variant === "warning" ? "ring-amber-400/30 bg-amber-500/10" : variant === "positive" ? "ring-emerald-400/30 bg-emerald-500/10" : "ring-primary/20 bg-card/60"
  return (
    <div className={`relative rounded-xl border border-border/60 ${v} p-4`}>
      <div className="text-sm font-semibold tracking-tight mb-2">{title}</div>
      <p className="text-[13px] leading-6 text-muted-foreground" style={concise ? { display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' } : undefined}>
        {children}
                </p>
              </div>
  )
}

function StatCard({ label, value, tone = "up", href }: { label: string; value: string; tone?: "up" | "down"; href: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">vs 6‑mo baseline</div>
                  </div>
  )
}

function MiniBar({ title, items, href }: { title: string; items: { k: string; v: number }[]; href: string }) {
  const norm = (v: number) => Math.max(0, Math.min(1, (v + 1) / 2))
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="grid grid-cols-3 gap-2 items-end">
        {items.map((it) => (
          <div key={it.k} className="flex flex-col gap-1">
            <div className="h-16 w-full rounded-md bg-muted/30 overflow-hidden">
              <div className="h-full bg-primary/40" style={{ height: `${Math.round(10 + norm(it.v) * 90)}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground text-center">{it.k} {(it.v>=0?'+':'')}{it.v.toFixed(2)}</div>
            </div>
        ))}
          </div>
        </div>
  )
}

/* Build 5–6 top-tier theme takeaways from raw theme rows */
function buildThemeTakeaways(rows: any[]): Array<{ title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment: number }> {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const all = rows.map((r) => ({
    title: String(r?.topicTitle || r?.category || ''),
    summary: String(r?.topicSummary || ''),
    group: String(r?.groupName || ''),
    views: Number(r?.viewCount || 0),
    likes: Number(r?.likeCount || 0),
    replies: Number(r?.replyCount || 0) + Number(r?.retweetCount || 0),
    sentiment: Number(r?.sentimentCompound ?? 0),
  }))

  const sum = (a: number, b: number) => a + b
  const totalViews = all.map((x) => x.views).reduce(sum, 0) || 1

  // Buckets
  const buckets: Record<string, typeof all> = {
    durability: all.filter((t) => /durab|fixed[-\s]?duration/i.test(`${t.title} ${t.summary}`)),
    access: all.filter((t) => /access|nice|ta947|eligib|who\/?when/i.test(`${t.title} ${t.summary}`)),
    safety: all.filter((t) => /safety|rash|photosens|crs|icans|infection/i.test(`${t.title} ${t.summary}`)),
    qol: all.filter((t) => /qol|quality of life|patient/i.test(`${t.title} ${t.summary}`)),
    cartContext: all.filter((t) => /car[-\s]?t|cell\s*therapy/i.test(`${t.title} ${t.summary}`)),
  }

  const make = (key: string, label: string, icons: any[], defaultTitle: string) => {
    const arr = buckets[key] || []
    if (arr.length === 0) return null
    const views = arr.map((x) => x.views).reduce(sum, 0)
    const likes = arr.map((x) => x.likes).reduce(sum, 0)
    const replies = arr.map((x) => x.replies).reduce(sum, 0)
    const sentiment = arr.length ? arr.map((x) => x.sentiment).reduce(sum, 0) / arr.length : 0
    const top = [...arr].sort((a, b) => b.views - a.views)[0]
    const share = views / totalViews
    // Narrative tailored per bucket
    let implication = ''
    if (key === 'durability') {
      implication = 'attach Zynlonta\'s 3L fit to the durability storyline (not a head‑to‑head claim). Keep it visual and simple.'
    } else if (key === 'access') {
      implication = 'publish a one‑screen “who/when” micro‑flow with referral steps. Reduce effort; cue action.'
    } else if (key === 'safety') {
      implication = 'keep a calm, checklist tone. Reassurance beats rebuttal; include escalation routes.'
    } else if (key === 'qol') {
      implication = 'set expectations early in patient lanes using plain language and day‑to‑day examples; link to practical tips.'
    } else if (key === 'cartContext') {
      implication = 'position Zynlonta as the practical 3L solution around CAR‑T constraints (capacity, logistics), not against efficacy.'
    }
    // Plain-language summaries per theme (no shorthand)
    let summary = ''
    switch (key) {
      case 'durability':
        summary = `Bispecific durability is driving most conversation. Posts combine explainers with trial news. Keep Zynlonta in the 3L space and tie it to this durability story without making head‑to‑head claims. Use a clear visual summary.`
        break
      case 'access':
        summary = `People keep asking who qualifies and where to start. Share a single‑screen “who/when” with a simple referral path. The fewer steps there are, the more teams will use it.`
        break
      case 'safety':
        summary = `Most safety talk is about competitors (for example CRS or ICANS), not Zynlonta. Provide a short checklist for recognising and managing issues, and show who to contact if there are concerns.`
        break
      case 'qol':
        summary = `Patients want to know what daily life looks like during treatment. Explain it in plain language with short examples, and link to practical support tips.`
        break
      case 'cartContext':
        summary = `CAR‑T is still the reference point. Position Zynlonta as a practical 3L option when CAR‑T is not suitable—focus on capacity and logistics rather than debating efficacy.`
        break
      default:
        summary = `${defaultTitle}.`
    }
    return { title: defaultTitle, summary, icons, views, likes, replies, sentiment }
  }

  const items = [
    make('durability', 'Durability owns attention', [Activity, Eye, ThumbsUp], 'Bispecific durability sets the frame'),
    make('access', 'Access questions are rising', [Key, Eye, MessageSquare], 'Eligibility clarity converts neutrals'),
    make('safety', 'Safety discussion is prominent', [Shield, MessageSquare, Eye], 'Reassure with calm checklists'),
    make('qol', 'QoL narratives want plain language', [HeartPulse, Smile, Meh], 'Set expectations early in patient lanes'),
    make('cartContext', 'CAR‑T remains the reference anchor', [Eye, Activity, Meh], 'Position Zynlonta around 3L suitability'),
  ].filter(Boolean) as any[]

  // Add a roll‑up if enough data
  if (all.length >= 5) {
    const meanSent = all.map((x) => x.sentiment).reduce(sum, 0) / all.length
    const rollupSummary = `Durability leads most talk. Questions about who qualifies drive action. Safety sits in the background. Use a simple 3L‑fit line, a one‑screen “who/when”, and a calm safety checklist.`
    items.unshift({
      title: 'What the market is really seeing',
      summary: rollupSummary,
      icons: [Eye, Activity, Key],
      views: totalViews,
      likes: all.map((x) => x.likes).reduce(sum, 0),
      replies: all.map((x) => x.replies).reduce(sum, 0),
      sentiment: meanSent,
    })
  }

  return items
}

function sentimentText(s: number) {
  if (s > 0.1) return 'Tone skews positive.'
  if (s < -0.1) return 'Tone is pressured.'
  return 'Tone is neutral.'
}

function strip(s: string) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

/* Build trend takeaways from /api/timeseries/alerts results */
function buildTrendTakeaways(rows: any[]): Array<{ title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment: number }> {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const up = rows.filter((r) => Number(r?.pct_change || 0) > 0)
  const down = rows.filter((r) => Number(r?.pct_change || 0) < 0)

  const rank = (arr: any[]) => [...arr].sort((a, b) => Number(b.pct_change || 0) - Number(a.pct_change || 0))
  const topUps = rank(up).slice(0, 3)
  const topDowns = rank(down).slice(0, 2)

  const items: Array<{ title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment: number }> = []

  if (topUps.length) {
    const cats = topUps.map((x) => String(x.category)).join(', ')
    items.push({
      title: 'Momentum spike',
      summary: `Conversation lifted above baseline in ${cats}. Drop short reminders about Zynlonta’s 3L fit and add clear eligibility links. Let the trend do the heavy lifting.`,
      icons: [TrendingUp, Eye, ThumbsUp],
      views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  if (topDowns.length) {
    const cats = topDowns.map((x) => String(x.category)).join(', ')
    items.push({
      title: 'Cooling pockets',
      summary: `Some themes quietened (${cats}). Park them unless they matter to 3L. If they do, re‑seed with one proof point and a clean visual; otherwise focus where attention already is.`,
      icons: [ThermometerSnowflake, Eye, Meh],
      views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  // Access nudge
  if (rows.some((r) => /access|eligib|ta947|nice/i.test(String(r.category)))) {
    items.push({
      title: 'Access questions create action',
      summary: `When eligibility or “who/where” trends, people are ready to move. Give a one‑screen answer (who qualifies → refer → monitor). Simple steps spread inside DGH teams.`,
      icons: [Key, MessageSquare, Eye],
      views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  // Safety reassurance
  if (rows.some((r) => /safety|crs|icans|rash|photosens/i.test(String(r.category)))) {
    items.push({
      title: 'Safety reassurance beats rebuttal',
      summary: `For safety spikes, keep it calm: show checklists, “what good looks like”, and escalation routes. Avoid debate; it keeps tone steady and credible.`,
      icons: [Shield, Smile, MessageSquare],
      views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  // Ensure at least 4 cards with sensible fallbacks
  const addFallback = (title: string, summary: string, icons: any[]) => {
    items.push({ title, summary, icons, views: 0, likes: 0, replies: 0, sentiment: 0 })
  }

  if (items.length < 4) {
    addFallback(
      'Sequencing watch',
      'Watch for posts that link bispecific momentum to earlier lines. When that happens, re‑state where Zynlonta fits in 3L and why it helps real patients today. Keep it practical, not theoretical.',
      [Activity, Key, Eye],
    )
  }

  if (items.length < 4) {
    addFallback(
      'Steady backdrop',
      'If no single spike dominates, keep cadence: one helpful explainer a week beats one big splash. Anchor every post to a single step—who, how, or what next.',
      [TrendingUp, Eye, ThumbsUp],
    )
  }

  return items
}

/* Build audience takeaways from /api/audience/overview rows */
function buildAudienceTakeaways(rows: any[]): Array<{ title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment: number }> {
  if (!Array.isArray(rows) || rows.length === 0) return []
  // Compute weighted tone by audience and surface practical guidance
  const get = (name: string, vKey: string, sKey: string) => {
    const v = rows.map((r) => Number((r as any)[vKey] || 0)).reduce((a, b) => a + b, 0)
    const sNum = rows.map((r) => Number((r as any)[sKey] || 0) * Number((r as any)[vKey] || 0)).reduce((a, b) => a + b, 0)
    const sDen = Math.max(v, 1)
    return { name, v, s: sNum / sDen }
  }

  const hcp = get('HCP', 'hcp_volume', 'hcp_sentiment')
  const patient = get('Patient', 'patient_volume', 'patient_sentiment')
  const caregiver = get('Caregiver', 'caregiver_volume', 'caregiver_sentiment')

  const items: any[] = []

  // HCP takeaway
  items.push({
    title: 'What wins with HCPs',
      summary: `HCPs want simple, workable steps. Keep “who/when” clear and add the next action. Include eligibility cues, referral routes, and a one‑screen monitoring checklist.`,
    icons: [Users, Key, Smile], views: 0, likes: 0, replies: 0, sentiment: hcp.s,
  })

  // Patient takeaway
  items.push({
    title: 'What lands with patients',
      summary: `Patients read plain English. Set day‑to‑day expectations (appointments, common side‑effects, what’s normal vs call). Add one helpful link per asset.`,
    icons: [HeartPulse, MessageSquare, Eye], views: 0, likes: 0, replies: 0, sentiment: patient.s,
  })

  // Caregiver takeaway (if volume exists or tone matters)
  if (caregiver.v > 0 || Math.abs(caregiver.s) > 0.05) {
    items.push({
      title: 'Caregiver voice is small but important',
      summary: `Caregivers ask for practical help and clear contacts. A small tile with transport tips and out‑of‑hours numbers buys goodwill and lowers anxiety.`,
      icons: [Users, Meh, MessageSquare], views: 0, likes: 0, replies: 0, sentiment: caregiver.s,
    })
  }

  // Cross‑audience rule of thumb
  items.push({
    title: 'One job per post',
      summary: `One job per asset works best: explain eligibility, set expectations, or give a next step. Keep it short; cadence beats complexity.`,
    icons: [Eye, ThumbsUp, Smile], views: 0, likes: 0, replies: 0, sentiment: 0,
  })

  // Ensure we return 6 takeaways with helpful defaults
  if (items.length < 6) {
    items.push({
      title: 'Tone before reach',
      summary: `Fix understanding before chasing reach. If comments show confusion, simplify the message and tighten the next step; tone and reach improve.`,
      icons: [Smile, Eye, ThumbsUp], views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  if (items.length < 6) {
    items.push({
      title: 'Close with one action',
      summary: `End each asset with one clear action—refer, book, or read a one‑screen guide. One link wins; too many choices kill follow‑through.`,
      icons: [Key, MessageSquare, Eye], views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  return items
}

/* Competitor lens - fetch & synthesize 4–5 takeaways */
function CompetitorLensTakeaways({ concise }: { concise: boolean }) {
  const [rows, setRows] = useState<any[]>([])
  const [psi, setPsi] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/competitors/durability').then((r) => r.json()).catch(() => ({ rows: [] })),
      fetch('/api/competitors/sentiment').then((r) => r.json()).catch(() => ({ rows: [] })),
    ])
      .then(([dur, s]) => {
        setRows(Array.isArray(dur?.rows) ? dur.rows : [])
        setPsi(Array.isArray(s?.rows) ? s.rows : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = useMemo(() => buildCompetitorTakeaways(rows, psi), [rows, psi])

  if (loading) return <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">Loading competitor insights…</div>
  if (!cards.length) return <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">No competitor data available.</div>

  return (
    <>
      {cards.slice(0,5).map((tw, idx) => (
        <TakeawayCard key={`comp-${idx}`} data={tw} concise={concise} />
      ))}
    </>
  )
}

function buildCompetitorTakeaways(durRows: any[], psiRows: any[]) {
  const items: any[] = []
  // Durability momentum by therapy
  if (Array.isArray(durRows) && durRows.length) {
    // take last month snapshot
    const last = durRows.reduce((latest: any, r: any) => (!latest || r.ym > latest ? r.ym : latest), null)
    const monthRows = durRows.filter((r: any) => r.ym === last)
    const ranked = [...monthRows].sort((a: any, b: any) => Number(b.durability_weighted_mentions || 0) - Number(a.durability_weighted_mentions || 0))
    if (ranked.length) {
      const top = ranked[0]
      items.push({
        title: 'Durability story leadership',
        summary: `${String(top.therapy)} currently leads durability chatter. Ride this narrative by anchoring Zynlonta to 3L fit and real‑world practicality—avoid head‑to‑head framings.`,
        icons: [Activity, Eye, ThumbsUp], views: 0, likes: 0, replies: 0, sentiment: 0,
      })
    }
  }

  // Sentiment by aspect (PSI)
  if (Array.isArray(psiRows) && psiRows.length) {
    const byAspect = (asp: string) => psiRows.filter((r: any) => r.aspect === asp)
    const pick = (asp: string, title: string, hint: string) => {
      const r = byAspect(asp)
      if (!r.length) return
      const z = r.find((x: any) => x.therapy === 'Zynlonta')
      const e = r.find((x: any) => x.therapy === 'Epcoritamab')
      const g = r.find((x: any) => x.therapy === 'Glofitamab')
      const leader = [z, e, g].filter(Boolean).sort((a: any, b: any) => Number(b.psi_0_100||0) - Number(a.psi_0_100||0))[0]
      if (!leader) return
      items.push({
        title,
        summary: `${leader.therapy} currently leads on ${asp.toLowerCase()} sentiment. ${hint}`,
        icons: [Smile, Eye, MessageSquare], views: 0, likes: 0, replies: 0, sentiment: 0,
      })
    }
    pick('Efficacy', 'Efficacy sentiment leader', 'Respond by foregrounding Zynlonta’s practical 3L advantages—clarity, predictability, and serviceability.')
    pick('Access', 'Access sentiment leader', 'Meet eligibility questions with one‑screen flows; remove effort to compete for action.')
    pick('Safety', 'Safety sentiment leader', 'Keep calm checklists and escalation routes—it preserves credibility even when conversation heats up.')
  }

  if (items.length === 0) {
    items.push({
      title: 'Competitive posture',
      summary: 'If no single competitor leads consistently, keep teaching the 3L fit in short, repeatable formats and attach it to trending storylines.',
      icons: [Eye, Key, ThumbsUp], views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  return items
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function microMetricForCard(data: { views: number; likes: number; replies: number; sentiment: number; title: string; summary: string }) {
  // Prefer showing real counts when non-zero; otherwise choose a meaningful label
  if (data.views > 0 || data.likes > 0 || data.replies > 0) {
    return (
      <>
        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNum(data.views)} views</span>
        <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{formatNum(data.likes)}</span>
        <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{formatNum(data.replies)}</span>
      </>
    )
  }
  const text = `${data.title} ${data.summary}`.toLowerCase()
  if (/access|eligib|nice|ta947/.test(text)) {
    return <span className="inline-flex items-center gap-1"><Key className="h-3.5 w-3.5" />Access‑driven</span>
  }
  if (/safety|crs|icans|rash|photosens|infection/.test(text)) {
    return <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Safety‑focused</span>
  }
  if (/durab|pfs|os|cr rate|remission/.test(text)) {
    return <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Durability‑led</span>
  }
  if (/trend|spike|momentum|baseline/.test(text)) {
    return <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Momentum</span>
  }
  // Fallback to tone label
  const s = data.sentiment
  const label = s > 0.1 ? 'Positive tone' : s < -0.1 ? 'Pressured tone' : 'Neutral tone'
  const ToneIcon = s > 0.1 ? Smile : s < -0.1 ? Frown : Meh
  return <span className="inline-flex items-center gap-1"><ToneIcon className="h-3.5 w-3.5" />{label}</span>
}

function TakeawayCard({ data, concise }: { data: { title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment: number }; concise: boolean }) {
  const tone = data.sentiment > 0.1 ? 'pos' : data.sentiment < -0.1 ? 'neg' : 'neu'
  const ToneIcon = tone === 'pos' ? Smile : tone === 'neg' ? Frown : Meh
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-semibold tracking-tight">{data.title}</div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {data.icons.slice(0,3).map((Ic, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span className="inline-flex"><Ic className="h-4 w-4" /></span>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>{Ic===Activity?'Durability':Ic===Shield?'Safety':Ic===Key?'Access':Ic===HeartPulse?'QoL':Ic===TrendingUp?'Momentum':Ic===Eye?'Attention':Ic===ThumbsUp?'Engagement':Ic===MessageSquare?'Conversation':Ic===Smile?'Positive tone':Ic===Frown?'Negative tone':Ic===Meh?'Neutral tone':'Insight'}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <p className="text-[13px] leading-6 text-muted-foreground" style={concise ? { display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' } : undefined}>
        {data.summary}
      </p>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        {microMetricForCard(data)}
        <span className={`inline-flex items-center gap-1 ml-auto ${tone==='pos'?'text-emerald-400':tone==='neg'?'text-rose-400':'text-muted-foreground'}`}>
          <ToneIcon className="h-3.5 w-3.5" /> {data.sentiment.toFixed(2)}
        </span>
        </div>
    </div>
  )
}




