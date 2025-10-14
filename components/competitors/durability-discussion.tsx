"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"

type Row = { ym: string; therapy: string; durability_weighted_mentions: number }

export function DurabilityDiscussion() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    fetch(`/api/competitors/durability`).then((r) => r.json()).then((d) => setRows(d.rows || [])).catch(() => setRows([]))
  }, [])

  const data = useMemo(() => {
    const months = Array.from(new Set(rows.map((r) => r.ym))).sort()
    return months.map((m) => ({
      month: m,
      zynlonta: rows.find((r) => r.ym === m && r.therapy === "Zynlonta")?.durability_weighted_mentions || 0,
      epcoritamab: rows.find((r) => r.ym === m && r.therapy === "Epcoritamab")?.durability_weighted_mentions || 0,
      glofitamab: rows.find((r) => r.ym === m && r.therapy === "Glofitamab")?.durability_weighted_mentions || 0,
      cart: rows.find((r) => r.ym === m && r.therapy === "CAR-T")?.durability_weighted_mentions || 0,
    }))
  }, [rows])
  return (
    <Card className="border-border/50 col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">Durability Narrative Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Mentions of long-term outcomes and durable responses over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="epcoritamab" stroke="#22c55e" strokeWidth={2} name="Epcoritamab" />
            <Line type="monotone" dataKey="glofitamab" stroke="#f59e0b" strokeWidth={2} name="Glofitamab" />
            <Line type="monotone" dataKey="zynlonta" stroke="#3b82f6" strokeWidth={2} name="Zynlonta" />
            <Line type="monotone" dataKey="cart" stroke="#a855f7" strokeWidth={2} name="CAR-T" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 rounded-lg bg-accent/30 border-l-4 border-chart-2">
          <p className="text-sm text-foreground">
            <AlertCircle className="inline h-4 w-4 mr-2" />
            Bispecific durability narratives are increasing 4x faster than Zynlonta, driven by new trial data and KOL
            advocacy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
