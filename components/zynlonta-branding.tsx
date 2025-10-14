"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function ZynlontaBranding() {
  return (
    <Card className="border-border/50 bg-accent/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" fill="black" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Zynlonta▼</h3>
              <span className="text-sm text-muted-foreground">(loncastuximab tesirine)</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This medicinal product is subject to additional monitoring in the UK. The black triangle (▼) indicates
              this is a new medicine being intensively monitored.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">NICE TA947</span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">Recommended for 3L+ DLBCL</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
