import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

const kols = [
  { name: "Dr. Sarah Mitchell", institution: "Royal Marsden Hospital", mentions: 47, focus: "Bispecific efficacy" },
  { name: "Prof. James Chen", institution: "Christie Hospital", mentions: 38, focus: "CAR-T sequencing" },
  { name: "Dr. Emma Thompson", institution: "UCL Cancer Institute", mentions: 32, focus: "ADC safety profiles" },
  { name: "Prof. David Williams", institution: "Oxford Cancer Centre", mentions: 28, focus: "Real-world evidence" },
  { name: "Dr. Lisa Anderson", institution: "Edinburgh Cancer Centre", mentions: 24, focus: "Patient QoL outcomes" },
]

export function KOLMentions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Key Opinion Leader Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Most mentioned HCP influencers at ASH 2025</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {kols.map((kol, index) => (
            <div key={index} className="p-3 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{kol.name}</span>
                    <TrendingUp className="h-3 w-3 text-chart-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{kol.institution}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {kol.mentions} mentions
                    </Badge>
                    <span className="text-xs text-muted-foreground">Focus: {kol.focus}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
