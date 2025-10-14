import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

const upcomingEvents = [
  {
    name: "EHA 2025",
    date: "June 12-15, 2025",
    location: "Frankfurt, Germany",
    relevance: "High",
    expectedTopics: ["New ADC data", "Bispecific updates", "CAR-T innovations"],
  },
  {
    name: "ICML 2025",
    date: "June 18-22, 2025",
    location: "Lugano, Switzerland",
    relevance: "High",
    expectedTopics: ["Lymphoma treatment advances", "Real-world evidence", "Sequencing strategies"],
  },
  {
    name: "ESMO 2025",
    date: "September 13-17, 2025",
    location: "Barcelona, Spain",
    relevance: "Medium",
    expectedTopics: ["Oncology innovations", "Immunotherapy updates"],
  },
]

export function UpcomingEvents() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Upcoming Congresses</CardTitle>
        <p className="text-sm text-muted-foreground">Key events to monitor for new discourse</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium text-foreground">{event.name}</h4>
                </div>
                <Badge variant={event.relevance === "High" ? "default" : "secondary"}>{event.relevance}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {event.date} • {event.location}
              </p>
              <div className="flex flex-wrap gap-2">
                {event.expectedTopics.map((topic, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                    {topic}
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
