"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { useEffect, useMemo, useState } from "react"

type ApiRow = { month: string; category: string; value: number }

function formatMonthLabel(d: string) {
  const dt = new Date(d)
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(dt)
}

export function VolumeChart() {
  const [rows, setRows] = useState<ApiRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = "/api/timeseries/monthly-by-category?categories=zynlonta,epcoritamab,glofitamab,car-t&months=24&metric=volume"
    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const data = useMemo(() => {
    const byMonth: Record<string, { zynlonta: number; epcoritamab: number; glofitamab: number; cart: number }> = {}
    for (const r of rows) {
      const label = formatMonthLabel(r.month)
      byMonth[label] ||= { zynlonta: 0, epcoritamab: 0, glofitamab: 0, cart: 0 }
      if (r.category === "zynlonta") byMonth[label].zynlonta += r.value || 0
      else if (r.category === "epcoritamab") byMonth[label].epcoritamab += r.value || 0
      else if (r.category === "glofitamab") byMonth[label].glofitamab += r.value || 0
      else if (r.category === "car-t") byMonth[label].cart += r.value || 0
    }
    const entries = Object.entries(byMonth)
      .map(([date, v]) => ({
        date,
        zynlonta: v.zynlonta,
        bispecifics: v.epcoritamab + v.glofitamab,
        cart: v.cart,
      }))
      .sort((a, b) => {
        // parse "MMM yy"
        const pa = Date.parse(`01 ${a.date}`)
        const pb = Date.parse(`01 ${b.date}`)
        return pa - pb
      })
    return entries
  }, [rows])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Conversation Volume Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">24-month trend with key event markers</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            />
            <ReferenceLine x="Mar 23" stroke="#00d4ff" strokeDasharray="3 3" label="NICE TA947" />
            <ReferenceLine x="Jul 23" stroke="#00d4ff" strokeDasharray="3 3" label="CAR-T 2L" />
            <ReferenceLine x="Dec 23" stroke="#00d4ff" strokeDasharray="3 3" label="ASH 2023" />
            <ReferenceLine x="Mar 24" stroke="#00d4ff" strokeDasharray="3 3" label="Bispecific 2L" />
            <ReferenceLine x="Dec 24" stroke="#00d4ff" strokeDasharray="3 3" label="ASH 2024" />
            <Line type="monotone" dataKey="zynlonta" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={!loading} />
            <Line type="monotone" dataKey="bispecifics" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={!loading} />
            <Line type="monotone" dataKey="cart" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={!loading} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
            <span className="text-sm text-muted-foreground">Zynlonta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#10b981]" />
            <span className="text-sm text-muted-foreground">Bispecifics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="text-sm text-muted-foreground">CAR-T</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
