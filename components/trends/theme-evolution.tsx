"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"

type ApiRow = { month: string; category: string; value: number }

function formatMonthLabel(d: string) {
  const dt = new Date(d)
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(dt)
}

export function ThemeEvolution() {
  const [rows, setRows] = useState<ApiRow[]>([])
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const url = "/api/timeseries/monthly-by-pillar?months=24&metric=volume"
    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const byPillar: Record<string, { month: string; mentions: number }[]> = {
      treatmentthemes_efficacy: [],
      treatmentthemes_safety: [],
      treatmentthemes_access: [],
      treatmentthemes_qol: [],
    }
    const map: Record<string, Record<string, number>> = {}
    for (const r of rows) {
      const m = formatMonthLabel(r.month)
      map[m] ||= {}
      map[m][r.category] = (map[m][r.category] || 0) + (r.value || 0)
    }
    const months = Object.keys(map).sort((a, b) => Date.parse(`01 ${a}`) - Date.parse(`01 ${b}`))
    for (const m of months) {
      byPillar.treatmentthemes_efficacy.push({ month: m, mentions: map[m]["treatmentthemes_efficacy"] || 0 })
      byPillar.treatmentthemes_safety.push({ month: m, mentions: map[m]["treatmentthemes_safety"] || 0 })
      byPillar.treatmentthemes_access.push({ month: m, mentions: map[m]["treatmentthemes_access"] || 0 })
      byPillar.treatmentthemes_qol.push({ month: m, mentions: map[m]["treatmentthemes_qol"] || 0 })
    }
    return byPillar
  }, [rows])

  const tooltipStyles = useMemo(() => {
    const dark = resolvedTheme === "dark"
    return {
      contentStyle: { backgroundColor: dark ? "#0b0b0b" : "#ffffff", border: dark ? "1px solid #333" : "1px solid #e5e7eb", borderRadius: "8px", color: dark ? "#E5E7EB" : "#111827" },
      labelStyle: { color: dark ? "#E5E7EB" : "#111827" },
      itemStyle: { color: dark ? "#E5E7EB" : "#111827" },
    }
  }, [resolvedTheme])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Theme Evolution</CardTitle>
        <p className="text-sm text-muted-foreground">Track how key themes have evolved over time</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="efficacy" className="w-full">
          <TabsList className="grid w/full grid-cols-3">
            <TabsTrigger value="efficacy">Efficacy</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="qol">QoL</TabsTrigger>
          </TabsList>
          <TabsContent value="efficacy" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grouped.treatmentthemes_efficacy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyles.contentStyle as any} labelStyle={tooltipStyles.labelStyle as any} itemStyle={tooltipStyles.itemStyle as any} />
                <Bar dataKey="mentions" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={!loading} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          {/* Safety tab removed per request */}
          <TabsContent value="access" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grouped.treatmentthemes_access}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyles.contentStyle as any} labelStyle={tooltipStyles.labelStyle as any} itemStyle={tooltipStyles.itemStyle as any} />
                <Bar dataKey="mentions" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={!loading} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="qol" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grouped.treatmentthemes_qol}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyles.contentStyle as any} labelStyle={tooltipStyles.labelStyle as any} itemStyle={tooltipStyles.itemStyle as any} />
                <Bar dataKey="mentions" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={!loading} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
