"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const terms = [
  { term: "Consolidation", lift: 216 },
  { term: "CD20 loss", lift: 187 },
  { term: "Outpatient‑friendly", lift: 143 },
  { term: "Dual‑modality", lift: 98 },
  { term: "Bridging regimen", lift: 94 },
  { term: "High‑risk biology", lift: 76 },
]

export function RisingTerms() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Rising Terms @ ASH 2025</CardTitle>
        <p className="text-sm text-muted-foreground">Relative frequency lift vs prior months</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={terms} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" stroke="#666" tickFormatter={(v)=>`+${v}%`} />
            <YAxis type="category" dataKey="term" stroke="#666" width={160} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
            <Bar dataKey="lift" fill="#10b981" radius={[4,4,4,4]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


