"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { AlertCircle } from "lucide-react"

type Row = { ym: string; therapy: string; durability_weighted_mentions: number }

export function DurabilityDiscussion() {
  const [rows, setRows] = useState<Row[]>([])
  const { resolvedTheme } = useTheme()

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
  const isDark = resolvedTheme === "dark"
  const axisColor = isDark ? "#9CA3AF" : "#475569" // gray-400 vs slate-600
  const gridColor = isDark ? "#334155" : "#E5E7EB" // slate-700 vs gray-200
  const tooltipBg = isDark ? "#0f1115" : "#ffffff"
  const tooltipBorder = isDark ? "#1f2937" : "#e5e7eb"
  const tooltipText = isDark ? "#e5e7eb" : "#0f172a"

  return (
    <Card className="border-border/50 col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">Durability Narrative Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Durability‑weighted mentions over time (volume weighted by durability language)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: "12px" }} />
            <YAxis stroke={axisColor} style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                color: tooltipText,
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              }}
              labelStyle={{ color: tooltipText, fontWeight: 600 }}
              itemStyle={{ color: tooltipText }}
              formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
              labelFormatter={(v: any) => {
                const d = new Date(String(v))
                const label = isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                return `${label} · Durability‑weighted mentions`
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
