import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

const trustData = [
  {
    name: "University College London Hospitals NHS Foundation Trust",
    type: "CAR-T Centre",
    mentions: 156,
    drugs: ["Zynlonta", "Epcoritamab", "CAR-T"],
    focus: "Trial data, efficacy discussions",
  },
  {
    name: "The Christie NHS Foundation Trust",
    type: "CAR-T Centre",
    mentions: 142,
    drugs: ["Glofitamab", "CAR-T"],
    focus: "Sequencing strategies, durability",
  },
  {
    name: "King's College Hospital NHS Foundation Trust",
    type: "CAR-T Centre",
    mentions: 128,
    drugs: ["Zynlonta", "Bispecifics"],
    focus: "Safety profiles, AE management",
  },
  {
    name: "Royal Marsden NHS Foundation Trust",
    type: "CAR-T Centre",
    mentions: 119,
    drugs: ["All therapies"],
    focus: "Comparative effectiveness",
  },
  {
    name: "Leeds Teaching Hospitals NHS Trust",
    type: "DGH",
    mentions: 87,
    drugs: ["Zynlonta"],
    focus: "Practical implementation, capacity",
  },
  {
    name: "Manchester University NHS Foundation Trust",
    type: "DGH",
    mentions: 76,
    drugs: ["Zynlonta", "Epcoritamab"],
    focus: "Access barriers, staff training",
  },
  {
    name: "Birmingham Heartlands Hospital",
    type: "DGH",
    mentions: 64,
    drugs: ["Zynlonta"],
    focus: "Photosensitivity management, patient support",
  },
]

export function NHSTrustMentions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          NHS Trust Mentions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Institutions most frequently discussed in relation to Zynlonta and competitors
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trustData.map((trust, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{trust.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{trust.focus}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={trust.type === "CAR-T Centre" ? "default" : "secondary"}>{trust.type}</Badge>
                  <span className="text-xs text-muted-foreground">{trust.mentions} mentions</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {trust.drugs.map((drug, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {drug}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
