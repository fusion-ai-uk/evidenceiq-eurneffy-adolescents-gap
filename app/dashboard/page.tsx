"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { HintIcon } from "@/components/ui/hint"
import { ArrowRight, Activity, Shield, Key, HeartPulse, Eye, ThumbsUp, MessageSquare, Smile, Meh, Frown, TrendingUp, ThermometerSnowflake, Users } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { weekOneTakeaways } from "@/data/week-one-takeaways"

//

export default function DashboardPage() {
  const [concise, setConcise] = useState<boolean>(false)
  const [weekOne, setWeekOne] = useState<boolean>(false)
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
        <h1>{weekOne ? 'Week‑One Takeaways' : 'Executive Summary'}</h1>
        <p className="lead">High‑level, scannable takeaways.</p>
        <div className="mt-1 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={weekOne} onCheckedChange={(v) => setWeekOne(Boolean(v))} />
            Week‑One Update
          </label>
          <button onClick={() => setConcise((c) => !c)} className="ml-2 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent/40" aria-pressed={concise}>Concise</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="opacity-80">Legend:</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />Attention</span>
          <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />Engagement</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Conversation</span>
          <span className="inline-flex items-center gap-1"><Smile className="h-3.5 w-3.5" />Tone (positive)</span>
          <span className="inline-flex items-center gap-1"><Meh className="h-3.5 w-3.5" />Tone (neutral)</span>
          <span className="inline-flex items-center gap-1"><Frown className="h-3.5 w-3.5" />Tone (negative)</span>
          <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Momentum</span>
          <span className="inline-flex items-center gap-1"><Key className="h-3.5 w-3.5" />Access</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Safety</span>
          <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Durability</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />Audience</span>
          <span className="inline-flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5" />QoL</span>
          <span className="inline-flex items-center gap-1"><ThermometerSnowflake className="h-3.5 w-3.5" />Cooling</span>
        </div>
      </div>

      {/* Market positioning (neon cards) */}
      <Section title="Zynlonta market positioning" href="/competitors" subtitle="Now vs next priorities" hideExplore>
        <NeonCard
          title="Cement third‑line use (now)"
          icon={Key}
          color="emerald"
        >
          The market reads efficacy through a durability lens, but engagement is won by practical advice. 3L posts that clarify “who/when” and the next step travel further and keep tone steady. Zynlonta shows up as the dependable 3L option when the message stays simple and calm on safety.
        </NeonCard>
        <NeonCard
          title="Explore second‑line positioning (next)"
          icon={TrendingUp}
          color="fuchsia"
        >
          In 2L, bispecific momentum sets the frame. Audiences respond to clear sequencing maps and predictable outpatient experience; continuity‑of‑care and QoL proof points land best. Keep the narrative data‑backed but plain: where Zynlonta fits when simplicity and regular clinic care matter.
        </NeonCard>
      </Section>

      {/* 1. Themes */}
      <Section title={weekOne ? "Week‑One Takeaways" : "General Themes"} href="/themes" subtitle={weekOne ? undefined : "Theme Explorer"}>
        {themesLoading && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">Loading themes…</div>
        )}
        {!themesLoading && (weekOne ? weekOneTakeaways : takeaways).length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">No theme data available.</div>
        )}
        {!themesLoading && (weekOne ? weekOneTakeaways : takeaways).slice(0,6).map((tw, idx) => (
          <TakeawayCard key={idx} data={tw} concise={concise} />
        ))}
      </Section>

      {/* 2. Trends */}
      {!weekOne && (
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
      )}

      {/* 3. Audience */}
      {!weekOne && (
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
      )}

      {/* 4. Competitors */}
      {!weekOne && (
      <Section title="Competitor Lens" href="/competitors" subtitle="Quick competitive posture">
        <CompetitorLensTakeaways concise={concise} />
      </Section>
      )}

      {/* Sections temporarily removed: Entity Network, Events Tracker, Content Recommendations */}
                  </div>
  )
}

/* ---------- Building blocks ---------- */

function Section({ title, subtitle, href, hideExplore, children }: { title: string; subtitle?: string; href: string; hideExplore?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <HintIcon content="These cards are a living set of key takeaways, updated from the live analysis. They summarise what matters right now and why, in plain language—so you can scan, understand, and decide what to open next." />
          {!hideExplore && (
            <Link
              href={href}
              className="ml-1 inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] hover:bg-accent/40"
              aria-label={`Explore Data: ${title}`}
            >
              Explore Data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
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
      <p className="text-[13px] leading-6 text-muted-foreground">
        {children}
                </p>
              </div>
  )
}

function NeonCard({ title, icon: Icon, children, color = "emerald" }: { title: string; icon: any; children: React.ReactNode; color?: "emerald" | "fuchsia" | "cyan" | "amber" }) {
  const ring = color === 'emerald' ? 'emerald' : color === 'fuchsia' ? 'fuchsia' : color === 'cyan' ? 'cyan' : 'amber'
  const glow = color === 'emerald' ? 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_6px_24px_rgba(16,185,129,0.25)]'
    : color === 'fuchsia' ? 'shadow-[0_0_0_1px_rgba(217,70,239,0.25),0_6px_24px_rgba(217,70,239,0.25)]'
    : color === 'cyan' ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_6px_24px_rgba(6,182,212,0.25)]'
    : 'shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_6px_24px_rgba(245,158,11,0.25)]'
  return (
    <div className={`relative rounded-xl border border-${ring}-400/40 bg-card/60 p-4 ${glow}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-${ring}-500/15 ring-1 ring-${ring}-500/30`}>
            <Icon className={`h-4 w-4 text-${ring}-400`} />
          </span>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-muted-foreground">{children}</p>
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
        summary = `Durability now frames most efficacy talk. Short explainers alongside trial headlines set expectations, and readers judge treatments through this lens.`
        break
      case 'access':
        summary = `Eligibility and first‑step questions dominate outside specialist centres — who qualifies, where to start, what happens next. Audiences want a quick “who/when” check and a clear next step.`
        break
      case 'safety':
        summary = `Safety chatter clusters around competitor CRS/ICANS; Zynlonta‑specific issues are less visible. The tone favours clear, non‑alarmist guidance that can be used quickly.`
        break
      case 'qol':
        summary = `Patient and caregiver posts focus on day‑to‑day realities — energy, appointments, side‑effects, how long things last. Plain, concrete expectations land better than slogans.`
        break
      case 'cartContext':
        summary = `CAR‑T remains the reference point; people use it to frame expectations for other options. Comparisons that show suitability, capacity and logistics resonate more than head‑to‑head claims.`
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
    const rollupSummary = `Durability sets the frame; eligibility clarity drives action; safety sits in the background.`
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
function buildTrendTakeaways(rows: any[]): Array<{ title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment?: number; strength?: string }> {
  const items: any[] = []
  items.push({
    title: 'Momentum sits with safety and quality-of-life themes',
    summary: 'Recent activity moved noticeably above its baseline in epcoritamab, safety, and treatment-experience topics. Attention is already flowing here, suggesting that current interest in reassurance and practical guidance continues to drive discovery and sharing.',
    icons: [Shield, HeartPulse, TrendingUp], views: 0, likes: 0, replies: 0, strength: 'Strong momentum',
  })
  items.push({
    title: 'Access questions remain the most reliable trigger',
    summary: 'When eligibility and referral topics trend, audience activity rises. Posts that clarify “who qualifies,” “where to start,” and “what happens next” generate the most onward action, showing that clarity still outperforms novelty in prompting engagement.',
    icons: [Key, MessageSquare, Eye], views: 0, likes: 0, replies: 0, strength: 'Consistent trigger',
  })
  items.push({
    title: 'Cooling pockets reflect a shift in attention, not rejection',
    summary: 'Themes such as glofitamab have eased below baseline in recent weeks. This typically signals a pause in visibility rather than a negative swing—interest will return when fresh data or local relevance re-enters the feed.',
    icons: [ThermometerSnowflake, Eye, Meh], views: 0, likes: 0, replies: 0, strength: 'Cooling',
  })
  items.push({
    title: 'Safety discussion grows without tonal volatility',
    summary: 'Safety-related threads show clear momentum yet maintain steady sentiment. The pattern indicates that increased conversation volume is being managed through measured, factual sharing rather than debate, reflecting confidence in protocol-based handling.',
    icons: [Shield, Smile, TrendingUp], views: 0, likes: 0, replies: 0, strength: 'Steady growth',
  })
  items.push({
    title: 'Above-baseline spikes track around major data releases',
    summary: 'Short, defined surges follow post-congress and data-drop periods, particularly after ASH and mid-year updates. This confirms that congress coverage and headline data moments remain the main levers for driving temporary visibility shifts across themes.',
    icons: [TrendingUp, Eye, ThumbsUp], views: 0, likes: 0, replies: 0, strength: 'Spike windows',
  })
  items.push({
    title: 'Simplicity sustains tone between peaks',
    summary: 'Outside those peaks, quieter periods favour posts that restate core facts in plain language. Across the time series, uncomplicated explainers maintain stable reach and tone—evidence that steady clarity holds value even when topic momentum cools.',
    icons: [Eye, MessageSquare, ThumbsUp], views: 0, likes: 0, replies: 0, strength: 'Baseline steady',
  })
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
  const payer = get('Payer/NHS', 'payer_volume', 'payer_sentiment')

  const items: any[] = []

  // HCP takeaway
  items.push({
    title: 'What wins with HCPs',
    summary: `In the HCP slice, posts with the most traction are practical and low‑friction. Threads cluster around “who qualifies”, “when to use”, and “what happens next”. This suggests an appetite for simple operational guidance rather than long arguments. As a broad steer, clarity on “who/when” with an obvious next step (e.g., a concise referral route and a one‑screen monitoring view) aligns with what the audience is already seeking.`,
    icons: [Users, Key, Smile], views: 0, likes: 0, replies: 0, sentiment: hcp.s,
  })

  // Patient takeaway
  items.push({
    title: 'What lands with patients',
    summary: `Patient comments focus on everyday life: appointments, common side‑effects, and what is normal versus a reason to call. The pattern in the data indicates that plain language with short, relatable examples is preferred over clinical phrasing. A gentle steer is to set expectations in clear terms and point to one genuinely useful link per asset so readers are not overloaded.`,
    icons: [HeartPulse, MessageSquare, Eye], views: 0, likes: 0, replies: 0, sentiment: patient.s,
  })

  // Caregiver takeaway (if volume exists or tone matters)
  if (caregiver.v > 0 || Math.abs(caregiver.s) > 0.05) {
    items.push({
      title: 'Caregiver voice is small but important',
      summary: `Caregiver volume is smaller, but the content is specific: transport, scheduling, and who to ring out‑of‑hours. The takeaway is that concrete information reduces anxiety more than general reassurance. As a light touch, a small tile that captures essential contacts and practical tips tends to be well received.`,
      icons: [Users, Meh, MessageSquare], views: 0, likes: 0, replies: 0, sentiment: caregiver.s,
    })
  }

  // Cross‑audience rule of thumb
  items.push({
    title: 'One job per post',
    summary: `Across audiences, the strongest performers do one clear job: either explain eligibility, set expectations, or provide a next step. When an asset tries to do all three, engagement usually drops. The takeaway is that clarity and cadence matter more than volume—short, focused posts are easier to understand and share.`,
    icons: [Eye, ThumbsUp, Smile], views: 0, likes: 0, replies: 0, sentiment: 0,
  })

  // Data-backed: who is driving volume now
  {
    const totals = [hcp, patient, caregiver, payer]
    const totalV = Math.max(totals.map(t => t.v).reduce((a,b)=>a+b, 0), 1)
    const leader = [...totals].sort((a,b)=>b.v-a.v)[0]
    const sharePct = ((leader.v / totalV) * 100).toFixed(1)
    items.push({
      title: "Who's driving now",
      summary: `${leader.name} account for the largest share of posts in this slice (${sharePct}%). This shapes the tone you see elsewhere. Patients, caregivers and Payer/NHS contribute the remainder in smaller, more focused threads.`,
      icons: [Users, Eye, MessageSquare], views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  // Ensure we return 6 takeaways with helpful defaults
  if (items.length < 6) {
    items.push({
      title: 'Tone before reach',
      summary: `Where confusion shows up in comments, tone tends to soften and reach stalls. That pattern suggests understanding is a prerequisite for scale. A broad steer is to simplify the core message first and only then work on expanding distribution; both tone and reach typically improve together.`,
      icons: [Smile, Eye, ThumbsUp], views: 0, likes: 0, replies: 0, sentiment: 0,
    })
  }

  if (items.length < 6) {
    items.push({
      title: 'Patient voice in plain terms',
      summary: `Patient and caregiver threads most often ask about day‑to‑day experience. Clear, non‑technical language correlates with higher response and sharing in these threads, whereas jargon slows interaction. Use short examples and one practical link to keep the flow going.`,
      icons: [HeartPulse, MessageSquare, Eye], views: 0, likes: 0, replies: 0, sentiment: 0,
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
      {cards.slice(0,6).map((tw, idx) => (
        <TakeawayCard key={`comp-${idx}`} data={tw} concise={concise} />
      ))}
    </>
  )
}

function buildCompetitorTakeaways(_durRows: any[], _psiRows: any[]) {
  // Hardcoded to ensure consistent copy and ordering per latest brief
  return [
    {
      title: 'CAR-T still defines the durability frame',
      summary:
        'Across the data, CAR-T continues to dominate durability talk. Its long-term outcomes and trial milestones anchor how readers judge “lasting benefit.” This confirms that durability remains a benchmark lens rather than an attribute any one brand owns outright.',
      icons: [Activity, Eye, ThumbsUp], views: 0, likes: 0, replies: 0,
    },
    {
      title: 'Zynlonta holds the most positive efficacy tone',
      summary:
        'In this slice of conversation, Zynlonta leads on efficacy sentiment. Mentions focus on consistent outcomes and clear response descriptions. This shows that efficacy discussions link Zynlonta with reliability and stable performance in 3L use.',
      icons: [Smile, Eye, MessageSquare], views: 0, likes: 0, replies: 0,
    },
    {
      title: 'Glofitamab leads on access positivity',
      summary:
        'Access-related posts mention Glofitamab most often and in the most favourable tone, helped by simple pathway explanations and outpatient cues. The data indicate that practical clarity continues to drive positivity in access discussions across the category.',
      icons: [Key, Eye, MessageSquare], views: 0, likes: 0, replies: 0,
    },
    {
      title: 'Epcoritamab stands out for safety confidence',
      summary:
        'Epcoritamab content attracts the highest positive tone on safety. Words such as “manageable,” “protocol,” and “monitoring” appear frequently, shaping a calm, credible narrative. This reflects how audiences reward clarity and preparedness in safety talk.',
      icons: [Shield, Smile, MessageSquare], views: 0, likes: 0, replies: 0,
    },
    {
      title: 'Zynlonta performs strongest on quality-of-life language',
      summary:
        'Comparative sentiment shows Zynlonta ahead on QoL references. Readers associate it with predictable side-effects and everyday practicality. While not dominant in volume, these mentions highlight a quieter strength in tolerance and continuity.',
      icons: [HeartPulse, Smile, MessageSquare], views: 0, likes: 0, replies: 0,
    },
    {
      title: 'Simplicity consistently wins across brands',
      summary:
        'Regardless of topic, posts that explain one clear point—whether efficacy, access, or safety—attract higher engagement. This pattern reinforces that plain, confident communication shapes perception more effectively than complex or data-dense updates.',
      icons: [Eye, ThumbsUp, MessageSquare], views: 0, likes: 0, replies: 0,
    },
  ]
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function microMetricForCard(data: { views: number; likes: number; replies: number; sentiment?: number; title: string; summary: string; strength?: string }) {
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
  // Trend strength label (for Trends Explorer)
  if (data.strength) {
    return <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{data.strength}</span>
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
  const s = (data.sentiment ?? 0)
  const label = s > 0.1 ? 'Positive tone' : s < -0.1 ? 'Pressured tone' : 'Neutral tone'
  const ToneIcon = s > 0.1 ? Smile : s < -0.1 ? Frown : Meh
  return <span className="inline-flex items-center gap-1"><ToneIcon className="h-3.5 w-3.5" />{label}</span>
}

function TakeawayCard({ data, concise }: { data: { title: string; summary: string; icons: any[]; views: number; likes: number; replies: number; sentiment?: number }; concise: boolean }) {
  const hasSentiment = typeof data.sentiment === 'number' && !Number.isNaN(data.sentiment as number)
  const tone = hasSentiment ? ((data.sentiment as number) > 0.1 ? 'pos' : (data.sentiment as number) < -0.1 ? 'neg' : 'neu') : 'neu'
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
      <p className="text-[13px] leading-6 text-muted-foreground">
        {data.summary}
      </p>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        {microMetricForCard(data)}
        {hasSentiment && (
          <span className={`inline-flex items-center gap-1 ml-auto ${tone==='pos'?'text-emerald-400':tone==='neg'?'text-rose-400':'text-muted-foreground'}`}>
            <ToneIcon className="h-3.5 w-3.5" /> {(data.sentiment as number).toFixed(2)}
          </span>
        )}
        </div>
    </div>
  )
}




