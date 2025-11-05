'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { milestones } from '@/lib/milestones'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { EventDrawer } from '@/components/EventDrawer'
import type { TimelineFilterState } from '@/components/TimelineFilters'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false }) as any

type Granularity = 'day' | 'week' | 'month'

type SeriesPoint = {
  periodStart: string
  count: number
  sentimentAvg: number
  likeSum: number
  viewSum: number
  retweetSum: number
}

type Anomaly = {
  periodStart: string
  type: 'spike' | 'trough'
  count: number
  baseline: number
  pctChange: number
  z: number
}

export function ConversationTimeline({ filters }: { filters: TimelineFilterState }) {
  const [series, setSeries] = useState<SeriesPoint[]>([])
  const [spikes, setSpikes] = useState<Anomaly[]>([])
  const [troughs, setTroughs] = useState<Anomaly[]>([])
  const [drawer, setDrawer] = useState<{ open: boolean; milestoneIndex?: number }>({ open: false })
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('granularity', filters.granularity)
    params.set('startDate', new Date(filters.startDate).toISOString())
    params.set('endDate', new Date(filters.endDate).toISOString())
    if (filters.categories.length) params.set('categories', filters.categories.join(','))
    if (filters.q) params.set('q', filters.q)
    params.set('hcp', String(filters.hcp))
    params.set('patient', String(filters.patient))
    params.set('caregiver', String(filters.caregiver))
    params.set('payer', String(filters.payer))
    params.set('stakeholderThreshold', String(filters.stakeholderThreshold))
    params.set('sentimentMin', String(filters.sentimentMin))
    params.set('sentimentMax', String(filters.sentimentMax))
    params.set('minLikes', String(filters.minLikes))
    params.set('minRetweets', String(filters.minRetweets))
    params.set('minViews', String(filters.minViews))
    if (filters.sentimentBuckets?.length) params.set('sentimentBuckets', filters.sentimentBuckets.join(','))
    fetch(`/api/timeseries?${params.toString()}`)
      .then(async (r) => {
        const payload = await r.json().catch(() => ({}))
        if (!r.ok) {
          const msg = payload?.message || 'API error'
          setError(String(msg))
          setSeries([]); setSpikes([]); setTroughs([])
          return
        }
        setError(null)
        setSeries(payload.series || [])
        setSpikes(payload.spikes || [])
        setTroughs(payload.troughs || [])
      })
      .catch((e) => {
        setError(String(e?.message || e))
        setSeries([]); setSpikes([]); setTroughs([])
      })
  }, [filters])

  const pointToX = (iso: string) => new Date(iso).getTime()

  const spikeMap = useMemo(() => {
    const m = new Map<string, Anomaly>()
    spikes.forEach((s) => m.set(s.periodStart, s))
    troughs.forEach((t) => m.set(t.periodStart, t))
    return m
  }, [spikes, troughs])

  const gridBorder = resolvedTheme === 'dark' ? 'rgba(148,163,184,0.18)' : '#E5E7EB'
  const seriesColor = resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'
  const neonBlue = resolvedTheme === 'dark' ? '#93c5fd' : '#1d4ed8'
  const tooltipTextColor = resolvedTheme === 'dark' ? '#E5E7EB' : '#111827'

  function eventIcon(tags?: string[], title?: string) {
    const t = (title || '').toLowerCase()
    const set = new Set((tags || []).map((x) => x.toLowerCase()))
    if (set.has('congress') || t.includes('ash') || t.includes('eha') || t.includes('icml')) return '🎓'
    if (t.includes('lotis') || set.has('trial')) return '🧪'
    if (set.has('2l') || t.includes('2l') || t.includes('practice')) return '🏥'
    if (set.has('bispecifics') || t.includes('bispecific')) return '🧬'
    if (t.includes('buzz') || t.includes('news')) return '📈'
    return '•'
  }

  const annotations = useMemo(() => {
    const xaxis: any[] = []
    const points: any[] = []
    const maxY = series.reduce((m, p) => Math.max(m, p.viewSum || 0), 0) || 1
    const nearestY = (xms: number) => {
      let best = series[0]
      let bestDiff = Math.abs(new Date(series[0]?.periodStart || 0).getTime() - xms)
      for (const p of series) {
        const d = Math.abs(new Date(p.periodStart).getTime() - xms)
        if (d < bestDiff) { best = p; bestDiff = d }
      }
      return Math.max(0, (best?.viewSum ?? 0))
    }
    spikes.forEach((s) => {
      xaxis.push({ x: pointToX(s.periodStart), strokeDashArray: 2, borderColor: '#22c55e', label: { style: { colors: '#22c55e', background: 'transparent' }, text: `+${Math.round(s.pctChange * 100)}%` } })
    })
    troughs.forEach((t) => {
      xaxis.push({ x: pointToX(t.periodStart), strokeDashArray: 2, borderColor: '#ef4444', label: { style: { colors: '#ef4444', background: 'transparent' }, text: `${Math.round(t.pctChange * 100)}%` } })
    })
    milestones.forEach((m, i) => {
      const xms = new Date(m.date).getTime()
      xaxis.push({ x: xms, strokeDashArray: 0, borderColor: seriesColor, label: { style: { colors: neonBlue, background: 'transparent', fontSize: '0px' }, text: '' } })
      const y = nearestY(xms) || maxY
      points.push({ x: xms, y: y, marker: { size: 6, fillColor: neonBlue, strokeColor: 'transparent', shape: 'circle' } })
    })
    return { xaxis, points }
  }, [spikes, troughs, resolvedTheme, series])

  const options: any = {
    chart: {
      type: 'area',
      id: 'timeline',
      animations: { enabled: true },
      zoom: { enabled: true },
      toolbar: { show: true },
      foreColor: resolvedTheme === 'dark' ? '#9CA3AF' : '#374151',
    },
    grid: { borderColor: gridBorder, strokeDashArray: 2 },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.2, opacityFrom: 0.6, opacityTo: 0.2 } },
    xaxis: { type: 'datetime' },
    yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
    annotations: { xaxis: annotations.xaxis, points: annotations.points },
    colors: [seriesColor],
    tooltip: {
      theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      shared: false,
      intersect: false,
      x: { format: 'yyyy-MM-dd' },
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        const x = w.globals.seriesX[seriesIndex][dataPointIndex]
        const iso = new Date(x).toISOString()
        const anomaly = spikeMap.get(iso)
        const point: SeriesPoint | undefined = series.find((p) => p.periodStart === iso)
        if (!point) return undefined
        const near = milestones.find((m) => Math.abs(new Date(m.date).getTime() - x) <= 3 * 24 * 3600 * 1000)
        const lines = [
          `<div class="px-3 py-2 text-xs" style="color:${tooltipTextColor}">`,
          `<div class="font-medium">${iso.slice(0, 10)}</div>`,
          `<div><strong>${Math.round(point.viewSum || 0).toLocaleString()}</strong> views this period</div>`,
        ]
        if (anomaly) {
          const pct = Math.round(anomaly.pctChange * 100)
          const more = anomaly.count - anomaly.baseline
          lines.push(`<div class="mt-1"><strong>${pct > 0 ? '+' : ''}${pct}%</strong> vs typical (avg ${anomaly.baseline}). ${more >= 0 ? '+' : ''}${more} posts than usual.</div>`)
        }
        lines.push(`<div>Avg sentiment: ${point.sentimentAvg?.toFixed?.(2) ?? 'n/a'}</div>`)
        if (near) {
          lines.push(`<div class="mt-1">Event: ${near.title} <span class="opacity-70">(${near.impact})</span></div>`)
          if (near.narrative) {
            const snippet = near.narrative.length > 140 ? near.narrative.slice(0, 140) + '…' : near.narrative
            lines.push(`<div class="opacity-80">${snippet}</div>`)
          }
        }
        lines.push(`</div>`)
        return lines.join('')
      },
    },
  }

  const apexSeries = [
    {
      name: 'Views',
      data: series.map((p) => [pointToX(p.periodStart), Math.max(0, p.viewSum)]),
    },
  ]

  const milestoneForDrawer = drawer.milestoneIndex !== undefined ? milestones[drawer.milestoneIndex] : undefined

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Conversation Views Over Time</CardTitle>
      </CardHeader>
      <CardContent suppressHydrationWarning>
        {error && (
          <div className="mb-3 text-xs text-destructive">Failed to load data: {error}</div>
        )}
        <div className="h-[420px]">
          {mounted && typeof window !== 'undefined' && (
            <ReactApexChart options={options} series={apexSeries} type="area" height="100%" />
          )}
        </div>
      </CardContent>
      <EventDrawer open={drawer.open} onClose={() => setDrawer({ open: false })} milestone={milestoneForDrawer} />
    </Card>
  )
}


