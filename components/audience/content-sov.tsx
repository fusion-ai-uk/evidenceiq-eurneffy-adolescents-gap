"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HintIcon } from "@/components/ui/hint"

type Row = { hcp_volume: number; patient_volume: number; caregiver_volume: number; payer_volume: number }

export function ContentSOV() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    fetch("/api/audience/overview")
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const mix = useMemo(() => {
    const total = rows.reduce(
      (a, r) => {
        a.hcp += r.hcp_volume || 0
        a.patient += r.patient_volume || 0
        a.caregiver += r.caregiver_volume || 0
        a.payer += r.payer_volume || 0
        return a
      },
      { hcp: 0, patient: 0, caregiver: 0, payer: 0 },
    )
    const sum = total.hcp + total.patient + total.caregiver + total.payer || 1
    const pct = (v: number) => Math.round((v / sum) * 100)
    return [
      { label: "Patient", value: pct(total.patient), color: "#60a5fa" },
      { label: "HCP", value: pct(total.hcp), color: "#34d399" },
      { label: "Caregiver", value: pct(total.caregiver), color: "#f59e0b" },
      { label: "Payer/NHS", value: pct(total.payer), color: "#a78bfa" },
    ]
  }, [rows])

  const focusByAudience = useMemo(() => {
    const sums = {
      efficacy: { patient: 0, hcp: 0, caregiver: 0, payer: 0 },
      access: { patient: 0, hcp: 0, caregiver: 0, payer: 0 },
      qol: { patient: 0, hcp: 0, caregiver: 0, payer: 0 },
    }
    for (const r of rows as any[]) {
      const cat = String((r as any).category || '').toLowerCase()
      const key = cat.includes('efficacy') ? 'efficacy' : cat.includes('access') ? 'access' : cat.includes('qol') ? 'qol' : null
      if (!key) continue
      sums[key].patient += Number((r as any).patient_volume || 0)
      sums[key].hcp += Number((r as any).hcp_volume || 0)
      sums[key].caregiver += Number((r as any).caregiver_volume || 0)
      sums[key].payer += Number((r as any).payer_volume || 0)
    }
    const mk = (a: { patient: number; hcp: number; caregiver: number; payer: number }) => {
      const total = a.patient + a.hcp + a.caregiver + a.payer || 1
      return {
        patient: a.patient / total,
        hcp: a.hcp / total,
        caregiver: a.caregiver / total,
        payer: a.payer / total,
      }
    }
    const perAudience = (aud: 'patient' | 'hcp' | 'caregiver' | 'payer') => {
      const tot = (sums.efficacy as any)[aud] + (sums.access as any)[aud] + (sums.qol as any)[aud] || 1
      return {
        efficacy: (sums.efficacy as any)[aud] / tot,
        access: (sums.access as any)[aud] / tot,
        qol: (sums.qol as any)[aud] / tot,
      }
    }
    return {
      patient: perAudience('patient'),
      hcp: perAudience('hcp'),
      caregiver: perAudience('caregiver'),
      payer: perAudience('payer'),
    }
  }, [rows])

  return (
    <>
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Audience Split (soft‑weighted)</CardTitle>
        <div className="text-xs text-muted-foreground">
          <HintIcon content={"Share of conversation by inferred audience. Each post is weighted by the model’s likelihood (HCP, patient, caregiver, payer). Use as a guide to who is driving the discussion."} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary animate-pulse"/> Fetching data…</span></div>
        ) : (
        <div className="flex gap-4 items-end h-32">
          {mix.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <div className="w-12 rounded-md" style={{ height: `${m.value * 1.1}px`, backgroundColor: m.color }} />
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="text-xs">{m.value}%</div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>

    {/* New: Audience focus by pillar */}
    <Card className="border-border/50 mt-4">
      <CardHeader>
        <CardTitle className="text-base font-medium">Where each audience focuses</CardTitle>
        <div className="text-xs text-muted-foreground">
          <HintIcon content={"For each audience, shows the share of attention across Efficacy, Access and QoL (soft‑weighted). Use it to see different priorities at a glance."} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-xs">
          {([
            { key: 'patient', label: 'Patient' },
            { key: 'hcp', label: 'HCP' },
            { key: 'caregiver', label: 'Caregiver' },
            { key: 'payer', label: 'Payer/NHS' },
          ] as const).map((a) => {
            const v = (focusByAudience as any)[a.key] || { efficacy: 0, access: 0, qol: 0 }
            const toPct = (x: number) => `${Math.round(x * 100)}%`
            return (
              <div key={a.key} className="flex items-center gap-3">
                <span className="w-24 text-muted-foreground">{a.label}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden bg-secondary">
                  <div className="h-full inline-block" style={{ width: toPct(v.efficacy), backgroundColor: '#3b82f6' }} />
                  <div className="h-full inline-block" style={{ width: toPct(v.access), backgroundColor: '#10b981' }} />
                  <div className="h-full inline-block" style={{ width: toPct(v.qol), backgroundColor: '#f59e0b' }} />
                </div>
                <div className="w-40 flex items-center justify-between text-muted-foreground">
                  <span>E {toPct(v.efficacy)}</span>
                  <span>A {toPct(v.access)}</span>
                  <span>QoL {toPct(v.qol)}</span>
                </div>
              </div>
            )
          })}
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#3b82f6' }} /> Efficacy</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10b981' }} /> Access</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#f59e0b' }} /> QoL</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  )
}


