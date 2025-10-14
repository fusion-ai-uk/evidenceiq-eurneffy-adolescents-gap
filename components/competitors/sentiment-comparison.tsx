"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type Row = { aspect: string; zynlonta: number; epcoritamab: number; glofitamab: number; cart: number }

export function SentimentComparison() {
  const [rows, setRows] = useState<Row[]>([])
  const [audiences, setAudiences] = useState<string[]>(["all"]) // multi-select
  const [aspectWeights, setAspectWeights] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Build from topic rows (BigQuery via existing /api/themes/query)
    setLoading(true)
    fetch(`/api/themes/query?limit=3000`)
      .then((r) => r.json())
      .then((d) => {
        const items: any[] = d.rows || []
        const therapyDefs = [
          { key: 'zynlonta', rx: /(\bzynlonta\b|loncastuximab(?:\s+tesirine)?|\blonca\b|loncastux\b|adc\b|antibody[- ]drug\s*conjugate|long\s*car|long\s*tux|long\s*colou?r)/i },
          { key: 'epcoritamab', rx: /(epcoritamab|epkinly|epco\b|epcor\b)/i },
          { key: 'glofitamab', rx: /(glofitamab|columvi|glofi\b|glofit\b)/i },
          { key: 'cart', rx: /(car[- ]?t|\bcart\b|chimeric\s+antigen\s+receptor|cell\s+therapy|tisagenlecleucel|axicabtagene|brexucabtagene|liso-?cel|kymriah|yescarta|breyanzi|tecartus|abecma)/i },
        ]
        const bispecificRx = /(bispecific|bsabs?|bi[- ]?specifics?)/i
        const efficacyRx = /(efficacy|response|durabil|pfs|os|cr\b|orr\b|remission)/i
        const accessRx = /(access|nice|ta947|eligib|capacity|bed|staff|fund|reimburs|waiting|approve|commission|nhs\b)/i
        const qolRx = /(qol|quality of life|daily|fatigue|burden|caregiver|outpatient|convenience)/i
        const toAspect = (cat: string, text: string) => {
          const c = cat.toLowerCase()
          if (c.includes('treatmentthemes_efficacy')) return 'Efficacy'
          if (c.includes('treatmentthemes_access')) return 'Access'
          if (c.includes('treatmentthemes_qol')) return 'QoL'
          if (efficacyRx.test(text)) return 'Efficacy'
          if (accessRx.test(text)) return 'Access'
          if (qolRx.test(text)) return 'QoL'
          return 'Other'
        }
        const acc: Record<string, { sum: number; w: number }> = {}
        const overall: Record<string, { sum: number; w: number }> = {}
        const weightsMap: Record<string, Record<string, number>> = {}

        const selected = audiences.includes('all') ? ['hcp','patient','caregiver'] : audiences
        for (const r of items) {
          const category = String(r.category || '')
          const text = `${r.topicTitle || ''} ${r.topicSummary || ''} ${r.groupName || ''} ${category}`.toLowerCase()
          const aspect = toAspect(category, text)
          if (aspect === 'Other') continue
          // Determine therapy match(es)
          let hits: { key: string; weight: number }[] = []
          const direct = therapyDefs.find((t) => t.rx.test(text))?.key
          if (direct) {
            hits.push({ key: direct, weight: 1 })
          } else if (bispecificRx.test(text)) {
            // Generic bispecific mention: split weight across epco + glofi
            hits.push({ key: 'epcoritamab', weight: 0.5 })
            hits.push({ key: 'glofitamab', weight: 0.5 })
          }
          if (!hits.length) continue
          const sentiment = Number(r.sentimentCompound ?? 0)
          const h = Number(r.hcpScore ?? 0)
          const p = Number(r.patientScore ?? 0)
          const c = Number(r.caregiverScore ?? 0)
          let weight = 0
          if (selected.includes('hcp')) weight += h
          if (selected.includes('patient')) weight += p
          if (selected.includes('caregiver')) weight += c
          if (weight <= 0) continue
          for (const hit of hits) {
            const key = `${aspect}|${hit.key}`
            acc[key] ||= { sum: 0, w: 0 }
            acc[key].sum += sentiment * weight * hit.weight
            acc[key].w += weight * hit.weight
            // aspect weights for tooltip
            weightsMap[aspect] ||= {}
            weightsMap[aspect][hit.key] = (weightsMap[aspect][hit.key] || 0) + weight * hit.weight
            // overall per therapy
            overall[hit.key] ||= { sum: 0, w: 0 }
            overall[hit.key].sum += sentiment * weight * hit.weight
            overall[hit.key].w += weight * hit.weight
          }
        }

        const aspects = ['Access','Efficacy','QoL']
        const psiOverall = (ther: string) => {
          const e = overall[ther]
          if (!e || e.w === 0) return 0
          const mean = e.sum / e.w
          return Math.round(((mean + 1) / 2) * 100)
        }
        const psiAspect = (a: string, ther: string) => {
          const k = `${a}|${ther}`
          const e = acc[k]
          if (!e || e.w === 0) return undefined
          const mean = e.sum / e.w
          return Math.round(((mean + 1) / 2) * 100)
        }
        const result: Row[] = aspects.map((a) => {
          return {
            aspect: a,
            zynlonta: psiAspect(a,'zynlonta') ?? psiOverall('zynlonta'),
            epcoritamab: psiAspect(a,'epcoritamab') ?? psiOverall('epcoritamab'),
            glofitamab: psiAspect(a,'glofitamab') ?? psiOverall('glofitamab'),
            cart: psiAspect(a,'cart') ?? psiOverall('cart'),
          }
        })
        setRows(result)
        setAspectWeights(weightsMap)
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [audiences])

  const insights = useMemo(() => {
    // Permanently exclude safety from insights per brief
    const base = rows.filter((r) => r.aspect.toLowerCase() !== "safety")
    if (!base.length) return [] as { aspect: string; msg: string }[]
    const list = base.map((r) => {
      const compAvg = ((r.epcoritamab || 0) + (r.glofitamab || 0)) / 2
      const delta = (r.zynlonta || 0) - compAvg
      const msg = `${delta >= 0 ? "Leads" : "Trails"} by ${Math.abs(Math.round(delta))} pts vs bispecifics`
      return { aspect: r.aspect, msg }
    })
    list.sort((a, b) => {
      const da = Math.abs((rows.find((x) => x.aspect === a.aspect)?.zynlonta || 0) - (((rows.find((x) => x.aspect === a.aspect)?.epcoritamab || 0) + (rows.find((x) => x.aspect === a.aspect)?.glofitamab || 0)) / 2))
      const db = Math.abs((rows.find((x) => x.aspect === b.aspect)?.zynlonta || 0) - (((rows.find((x) => x.aspect === b.aspect)?.epcoritamab || 0) + (rows.find((x) => x.aspect === b.aspect)?.glofitamab || 0)) / 2))
      return db - da
    })
    return list.slice(0, 3)
  }, [rows])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const r = rows.find((x) => x.aspect === label)
    if (!r) return null
    const compAvg = ((r.epcoritamab || 0) + (r.glofitamab || 0)) / 2
    const deltaVsBispecifics = Math.round((r.zynlonta || 0) - compAvg)
    const deltaVsCart = Math.round((r.zynlonta || 0) - (r.cart || 0))
    const flags = aspectWeights[label] || {}
    return (
      <div style={{ background: "#0b0b0b", border: "1px solid #333", borderRadius: 8, padding: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <div>Zynlonta: {(r.zynlonta || 0).toFixed(0)}{flags['zynlonta'] ? '' : ' (overall)'}</div>
        <div>Epcoritamab: {(r.epcoritamab || 0).toFixed(0)}{flags['epcoritamab'] ? '' : ' (overall)'}</div>
        <div>Glofitamab: {(r.glofitamab || 0).toFixed(0)}{flags['glofitamab'] ? '' : ' (overall)'}</div>
        <div>CAR‑T: {(r.cart || 0).toFixed(0)}{flags['cart'] ? '' : ' (overall)'}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9CA3AF" }}>Δ vs bispecifics avg: {deltaVsBispecifics >= 0 ? "+" : ""}{deltaVsBispecifics} pts; Δ vs CAR‑T: {deltaVsCart >= 0 ? "+" : ""}{deltaVsCart} pts</div>
      </div>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
        <CardTitle className="text-base font-medium">Comparative Sentiment Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Positive Sentiment Index (0–100) by aspect. Filter by audience.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => setAudiences(["all"])} className={`h-8 px-2 rounded-md border text-xs ${audiences.includes("all") ? 'bg-accent/50' : ''}`}>All</button>
              {(["hcp","patient","caregiver"] as const).map(a => (
                <button
                  key={a}
                  onClick={() => {
                    setAudiences((prev) => {
                      const set = new Set(prev)
                      if (set.has("all")) set.delete("all")
                      if (set.has(a)) set.delete(a)
                      else set.add(a)
                      return Array.from(set).length ? Array.from(set) : ["all"]
                    })
                  }}
                  className={`h-8 px-2 rounded-md border text-xs ${audiences.includes(a) ? 'bg-accent/50' : ''}`}
                >{a.charAt(0).toUpperCase()+a.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-muted/60" />
              Fetching data…
            </div>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={rows.filter((r) => r.aspect.toLowerCase() !== "safety")}> {/** exclude safety permanently */}
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="aspect" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="zynlonta" fill="#3b82f6" name="Zynlonta" radius={[4, 4, 0, 0]} />
            <Bar dataKey="epcoritamab" fill="#10b981" name="Epcoritamab" radius={[4, 4, 0, 0]} />
            <Bar dataKey="glofitamab" fill="#f59e0b" name="Glofitamab" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cart" fill="#8b5cf6" name="CAR-T" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
        {insights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {insights.map((i, idx) => (
              <Badge key={idx} variant="secondary">{i.aspect}: {i.msg}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
