"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, FileText, Users } from "lucide-react"

const sessions = [
  {
    title: "Oral Abstract Session: Lymphoma - Non-Hodgkin",
    type: "Oral Presentation",
    mentions: 234,
    keyTopics: ["CAR-T durability", "Bispecific efficacy", "3L sequencing"],
    icon: Users,
  },
  {
    title: "Poster Session: Novel Therapeutics in B-Cell Malignancies",
    type: "Poster",
    mentions: 189,
    keyTopics: ["ADC mechanisms", "Safety profiles", "Real-world outcomes"],
    icon: FileText,
  },
  {
    title: "Educational Symposium: Optimizing DLBCL Treatment Pathways",
    type: "Webcast",
    mentions: 156,
    keyTopics: ["Treatment algorithms", "Patient selection", "Access barriers"],
    icon: Video,
  },
  {
    title: "Late-Breaking Abstract: LOTIS-2 Extended Follow-up",
    type: "Oral Presentation",
    mentions: 312,
    keyTopics: ["Long-term durability", "Photosensitivity management", "QoL data"],
    icon: Users,
  },
]

export function CongressSessions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Congress Sessions Monitored</CardTitle>
        <p className="text-sm text-muted-foreground">ASH 2025 sessions generating the most discussion</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const Icon = session.icon
            return (
              <div
                key={index}
                className="p-3 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground leading-tight">{session.title}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {session.mentions}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {session.type}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {session.keyTopics.map((topic, i) => (
                        <span key={i} className="text-xs text-muted-foreground">
                          {topic}
                          {i < session.keyTopics.length - 1 && " •"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
