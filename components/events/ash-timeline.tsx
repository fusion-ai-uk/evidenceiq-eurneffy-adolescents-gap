"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// #ASH25 daily volume (sample, per provided brief)
const daily = [
  { day: "Dec 4", posts: 5 },
  { day: "Dec 5", posts: 8 },
  { day: "Dec 6", posts: 18 },
  { day: "Dec 7", posts: 22 },
  { day: "Dec 8", posts: 35 },
  { day: "Dec 9", posts: 21 },
  { day: "Dec 10", posts: 12 },
  { day: "Dec 11", posts: 32 },
]

export function AshTimeline() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">#ASH25 conversation over time</CardTitle>
        <p className="text-sm text-muted-foreground">Daily posts in our DLBCL stream sample (Dec 4–11, 2025)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
            <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


