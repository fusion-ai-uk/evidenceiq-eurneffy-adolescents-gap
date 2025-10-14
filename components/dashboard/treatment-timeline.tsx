"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from "recharts"
import { treatmentTimeline } from "@/lib/content-plan"

const data = [
  { month: "Month 0", cart: treatmentTimeline.baseline.cartTopics, bispecifics: treatmentTimeline.baseline.bispecificTopics, zynlonta: treatmentTimeline.baseline.zynlontaTopics },
]

export function TreatmentTimeline() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Treatment Landscape Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">Baseline topics and key milestones</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
            <Line type="monotone" dataKey="cart" name="CAR-T" stroke="#f59e0b" strokeWidth={2} dot />
            <Line type="monotone" dataKey="bispecifics" name="Bispecifics" stroke="#10b981" strokeWidth={2} dot />
            <Line type="monotone" dataKey="zynlonta" name="Zynlonta" stroke="#3b82f6" strokeWidth={2} dot />
            {treatmentTimeline.keyEvents.map((evt, idx) => (
              <ReferenceDot key={idx} x="Month 0" y={treatmentTimeline.baseline.zynlontaTopics} r={4} fill="#3b82f6" stroke="none" ifOverflow="visible" />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {treatmentTimeline.keyEvents.map((evt, idx) => (
            <div key={idx} className="text-xs text-muted-foreground px-2 py-1 rounded border border-border/50 bg-accent/30">
              {evt.month}: {evt.label}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/40 border border-border/50">
          <p className="text-sm text-foreground">{treatmentTimeline.insight}</p>
        </div>
      </CardContent>
    </Card>
  )
}


