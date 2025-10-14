import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download } from "lucide-react"

const signals = [
  {
    ae: "Photosensitivity Rash",
    drug: "Zynlonta",
    mentions: 127,
    severity: "Moderate",
    trend: "↑ 23%",
    status: "Under Review",
  },
  {
    ae: "Cytokine Release Syndrome",
    drug: "Epcoritamab",
    mentions: 98,
    severity: "High",
    trend: "↑ 15%",
    status: "Flagged",
  },
  {
    ae: "ICANS",
    drug: "Glofitamab",
    mentions: 76,
    severity: "High",
    trend: "↑ 12%",
    status: "Flagged",
  },
  {
    ae: "Prolonged Cytopenias",
    drug: "CAR-T",
    mentions: 64,
    severity: "Moderate",
    trend: "↑ 8%",
    status: "Monitoring",
  },
  {
    ae: "Infection Risk",
    drug: "All Bispecifics",
    mentions: 54,
    severity: "Moderate",
    trend: "↑ 10%",
    status: "Monitoring",
  },
]

export function FlaggedSignals() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Flagged Safety Signals</CardTitle>
            <p className="text-sm text-muted-foreground">AEs requiring pharmacovigilance review</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export for PV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h4 className="text-sm font-medium text-foreground">{item.ae}</h4>
                    <Badge variant={item.severity === "High" ? "destructive" : "secondary"}>{item.severity}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">Drug: {item.drug}</span>
                    <span className="text-xs text-muted-foreground">{item.mentions} mentions</span>
                    <span className="text-xs text-chart-2">{item.trend}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    item.status === "Flagged" ? "destructive" : item.status === "Under Review" ? "default" : "outline"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
