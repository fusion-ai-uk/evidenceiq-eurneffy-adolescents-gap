"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip } from "recharts"

const points = [
  { x: 20, y: 80, z: 60, name: "Post‑bsAb (CD20‑loss)" },     // High opp, low risk
  { x: 70, y: 75, z: 70, name: "ADC + bsAb combinations" },   // High opp, high risk
  { x: 25, y: 30, z: 40, name: "Real‑world Lonca stability" },// Low opp, low risk
  { x: 75, y: 25, z: 50, name: "Fixed‑duration cost pressure" }, // Low opp, high risk
]

export function RiskOpportunity() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Risk & Opportunity Radar</CardTitle>
        <p className="text-sm text-muted-foreground">Opportunity (↑) vs Risk (→) — ASH 2025</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <CartesianGrid stroke="#333" />
            <XAxis type="number" dataKey="x" name="Risk" unit="" tick={{ fill: "#666", fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Opportunity" unit="" tick={{ fill: "#666", fontSize: 12 }} />
            <ZAxis type="number" dataKey="z" range={[60, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
              formatter={(v: any, k: string, p: any) => [p.payload.name, k]}
            />
            <Scatter data={points} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


