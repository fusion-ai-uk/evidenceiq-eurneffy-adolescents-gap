"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan 23", zynlonta: 120, bispecifics: 80, cart: 150 },
  { month: "Mar 23", zynlonta: 145, bispecifics: 95, cart: 160 },
  { month: "May 23", zynlonta: 165, bispecifics: 110, cart: 155 },
  { month: "Jul 23", zynlonta: 180, bispecifics: 140, cart: 145 },
  { month: "Sep 23", zynlonta: 195, bispecifics: 175, cart: 140 },
  { month: "Nov 23", zynlonta: 210, bispecifics: 220, cart: 135 },
  { month: "Jan 24", zynlonta: 225, bispecifics: 280, cart: 130 },
  { month: "Mar 24", zynlonta: 240, bispecifics: 350, cart: 125 },
  { month: "May 24", zynlonta: 255, bispecifics: 420, cart: 120 },
  { month: "Jul 24", zynlonta: 270, bispecifics: 480, cart: 115 },
  { month: "Sep 24", zynlonta: 285, bispecifics: 540, cart: 110 },
  { month: "Nov 24", zynlonta: 300, bispecifics: 600, cart: 105 },
]

export function TimelineChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Treatment Landscape Timeline (24 Months)</CardTitle>
        <p className="text-sm text-muted-foreground">Conversation volume trends across therapies</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorZynlonta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBispecifics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="zynlonta"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorZynlonta)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="bispecifics"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorBispecifics)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cart"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorCart)"
              strokeWidth={2}
            />
          </AreaChart>
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
