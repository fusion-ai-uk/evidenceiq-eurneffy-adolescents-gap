"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { month: "Jan 24", photosensitivity: 8, crs: 12, icans: 6, infections: 10 },
  { month: "Feb 24", photosensitivity: 10, crs: 14, icans: 7, infections: 11 },
  { month: "Mar 24", photosensitivity: 12, crs: 18, icans: 9, infections: 13 },
  { month: "Apr 24", photosensitivity: 15, crs: 22, icans: 11, infections: 15 },
  { month: "May 24", photosensitivity: 18, crs: 26, icans: 13, infections: 17 },
  { month: "Jun 24", photosensitivity: 21, crs: 30, icans: 15, infections: 19 },
  { month: "Jul 24", photosensitivity: 24, crs: 34, icans: 17, infections: 21 },
  { month: "Aug 24", photosensitivity: 27, crs: 38, icans: 19, infections: 23 },
  { month: "Sep 24", photosensitivity: 30, crs: 42, icans: 21, infections: 25 },
  { month: "Oct 24", photosensitivity: 33, crs: 46, icans: 23, infections: 27 },
  { month: "Nov 24", photosensitivity: 36, crs: 50, icans: 25, infections: 29 },
  { month: "Dec 24", photosensitivity: 39, crs: 54, icans: 27, infections: 31 },
]

export function AERadar() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Adverse Event Signal Tracking</CardTitle>
        <p className="text-sm text-muted-foreground">Cumulative mentions of key AEs over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
            <Line
              type="monotone"
              dataKey="photosensitivity"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Photosensitivity (Zynlonta)"
            />
            <Line type="monotone" dataKey="crs" stroke="#ef4444" strokeWidth={2} name="CRS (Bispecifics)" />
            <Line type="monotone" dataKey="icans" stroke="#f59e0b" strokeWidth={2} name="ICANS (Bispecifics)" />
            <Line type="monotone" dataKey="infections" stroke="#8b5cf6" strokeWidth={2} name="Infections (All)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
