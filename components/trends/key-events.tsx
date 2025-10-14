import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

const events = [
  {
    date: "March 2023",
    title: "NICE TA947 Approval",
    description: "Zynlonta recommended for 3L+ DLBCL treatment",
    impact: "High",
    mentions: 342,
  },
  {
    date: "July 2023",
    title: "CAR-T Moves to 2L",
    description: "CAR-T therapy approved for second-line treatment",
    impact: "High",
    mentions: 487,
  },
  {
    date: "December 2023",
    title: "ASH 2023 Congress",
    description: "New data presented on bispecific durability",
    impact: "Medium",
    mentions: 521,
  },
  {
    date: "March 2024",
    title: "Bispecifics Enter 2L",
    description: "Bispecific antibodies approved for second-line use",
    impact: "High",
    mentions: 634,
  },
  {
    date: "December 2024",
    title: "ASH 2024 Congress",
    description: "Latest efficacy and safety data across therapies",
    impact: "High",
    mentions: 712,
  },
]

export function KeyEvents() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Key Events Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">Major milestones affecting the treatment landscape</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                  <Badge variant={event.impact === "High" ? "default" : "secondary"}>{event.impact} Impact</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{event.date}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{event.mentions} related mentions</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
