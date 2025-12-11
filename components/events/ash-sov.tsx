 "use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const sovData = [
  { label: "CAR-T", pct: 19 },
  { label: "Epcoritamab", pct: 16 },
  { label: "Glofitamab", pct: 13 },
  { label: "Bispecifics (generic)", pct: 8 },
  { label: "Zynlonta", pct: 5 },
]

export function AshShareOfVoice() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Share of Voice @ ASH 2025 (DLBCL stream)</CardTitle>
        <p className="text-sm text-muted-foreground">Approximate proportion of mentions in our #ASH25 sample</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sovData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" stroke="#666" tickFormatter={(v)=>`${v}%`} />
            <YAxis type="category" dataKey="label" stroke="#666" width={160} />
            <Tooltip
              formatter={(v:number)=>`${v}%`}
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
            />
            <Bar dataKey="pct" fill="#3b82f6" radius={[4,4,4,4]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


