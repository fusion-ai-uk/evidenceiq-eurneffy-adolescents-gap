'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HintIcon } from '@/components/ui/hint'

export type TimelineFilterState = {
  startDate: string
  endDate: string
  granularity: 'day' | 'week' | 'month'
  categories: string[]
  hcp: boolean
  patient: boolean
  caregiver: boolean
  payer: boolean
  stakeholderThreshold: number
  sentimentBuckets: ('strong_neg'|'neg'|'neu'|'pos'|'strong_pos')[]
  sentimentMin: number
  sentimentMax: number
  minLikes: number
  minRetweets: number
  minViews: number
  q: string
}

const toUK = (d: Date) => new Intl.DateTimeFormat('en-GB').format(d).split('/').reverse().join('-')
const todayISO = () => toUK(new Date())
const yearAgoISO = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return toUK(d) }

export function TimelineFilters({ onApply }: { onApply: (f: TimelineFilterState) => void }) {
  const [f, setF] = useState<TimelineFilterState>({
    startDate: yearAgoISO(),
    endDate: todayISO(),
    granularity: 'week',
    categories: [],
    hcp: false,
    patient: false,
    caregiver: false,
    payer: false,
    stakeholderThreshold: 0.5,
    sentimentBuckets: ['neu','pos','neg','strong_pos','strong_neg'],
    sentimentMin: -1,
    sentimentMax: 1,
    minLikes: 0,
    minRetweets: 0,
    minViews: 0,
    q: '',
  })

  const apply = () => onApply(f)
  const chipDefs: { id: TimelineFilterState['sentimentBuckets'][number]; label: string; active: string }[] = [
    { id: 'strong_neg', label: '--', active: 'bg-red-600 text-white' },
    { id: 'neg',        label: '-',  active: 'bg-red-500 text-white' },
    { id: 'neu',        label: 'Neutral', active: 'bg-slate-600 text-white' },
    { id: 'pos',        label: '+',  active: 'bg-emerald-500 text-white' },
    { id: 'strong_pos', label: '++', active: 'bg-emerald-600 text-white' },
  ]

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 md:p-4 grid gap-3 md:grid-cols-2">
        <div id="granularity-select" className="flex flex-col items-center gap-1 md:col-span-1">
          <span className="text-xs text-muted-foreground">Granularity
            <HintIcon className="ml-2 align-middle" content={"Changes the chart’s time unit. Week helps spot event-driven spikes; Month smooths noise to show durable shifts."} />
          </span>
          <select value={f.granularity} onChange={(e) => setF({ ...f, granularity: e.target.value as any })} className="h-8 w-full max-w-[280px] rounded-md bg-background border px-2 text-sm">
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div id="date-range-picker" className="flex flex-col items-center gap-1 md:col-span-1">
          <span className="text-xs text-muted-foreground">Date range
            <HintIcon className="ml-2 align-middle" content={"Pick any 12‑month window. Include Dec–Jan to catch ASH and NICE cycles where sentiment and volume often inflect."} />
          </span>
          <div className="flex items-center gap-1.5 w-full max-w-[420px] justify-center">
            <input value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} type="date" className="h-8 rounded-md bg-background border px-2 text-sm" />
            <span className="text-xs">→</span>
            <input value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} type="date" className="h-8 rounded-md bg-background border px-2 text-sm" />
          </div>
        </div>
        <div id="stakeholder-toggles" className="flex flex-col items-center gap-1 md:col-span-1">
          <span className="text-xs text-muted-foreground">Stakeholders
            <HintIcon className="ml-2 align-middle" content={"Filters weight curves by posts likely from each audience (HCP, patient, caregiver, payer). Probabilistic—compare viewpoints, not identity."} />
          </span>
          <div className="flex items-center justify-center gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={f.hcp} onChange={(e) => setF({ ...f, hcp: e.target.checked })} />HCP</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={f.patient} onChange={(e) => setF({ ...f, patient: e.target.checked })} />Patient</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={f.caregiver} onChange={(e) => setF({ ...f, caregiver: e.target.checked })} />Caregiver</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={f.payer} onChange={(e) => setF({ ...f, payer: e.target.checked })} />Payer</label>
          </div>
          {/* Strictness fixed at 0.5 (UI removed) */}
        </div>
        <div id="sentiment-chips" className="flex flex-col items-center gap-1 md:col-span-1">
          <span className="text-xs text-muted-foreground">Sentiment
            <HintIcon className="ml-2 align-middle" content={"Aspect-aware: a negative month often means safety (e.g., CRS or rash) dominated. Doesn’t mean everything was bad."} />
          </span>
          <div className="flex flex-nowrap gap-1.5 text-xs items-center justify-center">
            {chipDefs.map((b) => {
              const active = f.sentimentBuckets.includes(b.id)
              return (
                <button key={b.id} aria-pressed={active} onClick={() => {
                  const set = new Set(f.sentimentBuckets)
                  active ? set.delete(b.id) : set.add(b.id)
                  setF({ ...f, sentimentBuckets: Array.from(set) as any })
                }} className={`h-7 px-2.5 rounded-md border ${active ? b.active + ' border-transparent' : 'bg-background border-slate-300 text-slate-600 hover:bg-slate-100'} transition-colors whitespace-nowrap`}>{b.label}</button>
              )
            })}
          </div>
        </div>


        

        <div id="apply-reset-buttons" className="md:col-span-2 flex items-center justify-between gap-2 pt-1">
          <button onClick={() => setF({ ...f, startDate: yearAgoISO(), endDate: todayISO(), granularity: 'week', hcp: false, patient: false, caregiver: false, payer: false, stakeholderThreshold: 0.5, sentimentMin: -1, sentimentMax: 1, minLikes: 0, minRetweets: 0, minViews: 0, q: '' })} className="text-xs h-8 px-3 rounded-md border">Reset</button>
          <div className="flex items-center gap-2">
            <HintIcon className="hidden md:inline-flex" content={"Apply locks filters for all widgets on this page. Reset returns to All audiences, Week granularity, full sentiment."} />
            <button onClick={apply} className="text-xs h-8 px-4 rounded-md bg-primary text-primary-foreground shadow-sm transition will-change-transform hover:shadow-md hover:scale-[1.02] hover:animate-pulse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.99]">Apply</button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


