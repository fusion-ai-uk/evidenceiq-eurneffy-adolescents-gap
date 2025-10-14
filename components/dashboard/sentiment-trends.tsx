"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

const data = [
  { week: "Week 1", zynlonta: 65, epcoritamab: 58, glofitamab: 62, cart: 71 },
  { week: "Week 2", zynlonta: 67, epcoritamab: 60, glofitamab: 63, cart: 70 },
  { week: "Week 3", zynlonta: 66, epcoritamab: 62, glofitamab: 64, cart: 69 },
  { week: "Week 4", zynlonta: 68, epcoritamab: 63, glofitamab: 65, cart: 68 },
]

export function SentimentTrends() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Sentiment Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Positive sentiment % by therapy over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="week" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} domain={[50, 75]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="zynlonta" stroke="#3b82f6" strokeWidth={2} name="Zynlonta" />
            <Line type="monotone" dataKey="epcoritamab" stroke="#ef4444" strokeWidth={2} name="Epcoritamab" />
            <Line type="monotone" dataKey="glofitamab" stroke="#f59e0b" strokeWidth={2} name="Glofitamab" />
            <Line type="monotone" dataKey="cart" stroke="#8b5cf6" strokeWidth={2} name="CAR-T" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
