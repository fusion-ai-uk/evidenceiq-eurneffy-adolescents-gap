"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "KOL Physicians", value: 44 },
  { name: "Cancer Centers / Institutions", value: 28 },
  { name: "Medical Media", value: 16 },
  { name: "Investors / Watchers", value: 9 },
  { name: "Patient Advocates", value: 3 },
]
const colors = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444"]

export function AudienceSplit() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Audience Segmentation @ ASH 2025</CardTitle>
        <p className="text-sm text-muted-foreground">Share of posts by account type (sample)</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {data.map((_, i)=>(<Cell key={i} fill={colors[i%colors.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[i%colors.length] }} />
                  <span className="text-sm">{d.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


