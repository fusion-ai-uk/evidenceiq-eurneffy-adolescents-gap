"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { durabilityTheme } from "@/lib/content-plan"

export function DurabilityTheme() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Theme: Durability</CardTitle>
        <p className="text-sm text-muted-foreground">Mentions and narrative ownership</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border border-border/50 bg-accent/30">
            <h4 className="text-sm font-medium text-foreground">Zynlonta mentions</h4>
            <p className="text-2xl font-semibold text-blue-400 mt-2">{durabilityTheme.zynlontaMentions}</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-accent/30">
            <h4 className="text-sm font-medium text-foreground">Bispecific mentions</h4>
            <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-1">
              {durabilityTheme.bispecificMentions.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/40 border border-border/50">
          <p className="text-sm text-foreground">{durabilityTheme.insight}</p>
        </div>
      </CardContent>
    </Card>
  )
}


