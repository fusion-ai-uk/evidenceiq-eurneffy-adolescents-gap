"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Download } from "lucide-react"

const photosensitivityData = {
  totalMentions: 127,
  trend: "+23%",
  severity: "Moderate",
  sources: [
    { source: "Patient Forums", mentions: 67, percentage: 53 },
    { source: "HCP Discussions", mentions: 34, percentage: 27 },
    { source: "Caregiver Posts", mentions: 26, percentage: 20 },
  ],
  timeline: [
    { period: "Q1 2024", mentions: 18, baseline: 12 },
    { period: "Q2 2024", mentions: 24, baseline: 12 },
    { period: "Q3 2024", mentions: 38, baseline: 12 },
    { period: "Q4 2024", mentions: 47, baseline: 12 },
  ],
  keyQuotes: [
    {
      quote: "The photosensitivity rash was unexpected. I wish I'd been better prepared with sun protection advice.",
      source: "Patient, UK Forum",
      date: "15 Jan 2025",
    },
    {
      quote: "We're seeing more photosensitivity reports than initially anticipated. Patient education is critical.",
      source: "HCP, DGH",
      date: "12 Jan 2025",
    },
    {
      quote:
        "My husband developed a severe rash after minimal sun exposure. The information leaflet didn't emphasize this enough.",
      source: "Caregiver, Blood Cancer UK Forum",
      date: "8 Jan 2025",
    },
  ],
  managementDiscussions: [
    { topic: "Sun protection education", mentions: 45, sentiment: "Concerned" },
    { topic: "Rash severity grading", mentions: 32, sentiment: "Neutral" },
    { topic: "Treatment interruptions", mentions: 28, sentiment: "Negative" },
    { topic: "Patient information gaps", mentions: 22, sentiment: "Negative" },
  ],
}

export function PhotosensitivityDeepDive() {
  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-medium">Photosensitivity Rash Deep Dive</CardTitle>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {photosensitivityData.trend}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Key client concern: Mentions increasing beyond Med Info reports</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Total Mentions</p>
            <p className="text-2xl font-bold text-foreground">{photosensitivityData.totalMentions}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Severity</p>
            <p className="text-lg font-medium text-orange-500">{photosensitivityData.severity}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Trend vs Baseline</p>
            <p className="text-lg font-medium text-destructive">{photosensitivityData.trend}</p>
          </div>
        </div>

        {/* Source Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Mention Sources</h4>
          <div className="space-y-2">
            {photosensitivityData.sources.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-32">{item.source}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">{item.mentions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Quarterly Trend</h4>
          <div className="space-y-2">
            {photosensitivityData.timeline.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                <span className="text-sm text-foreground">{item.period}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Baseline: {item.baseline}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm font-medium text-orange-500">{item.mentions}</span>
                  <Badge variant="outline" className="text-xs">
                    +{Math.round(((item.mentions - item.baseline) / item.baseline) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Discussions */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Management Topics</h4>
          <div className="grid grid-cols-2 gap-2">
            {photosensitivityData.managementDiscussions.map((item, index) => (
              <div key={index} className="p-2 rounded-lg bg-accent/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{item.topic}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.mentions}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${
                    item.sentiment === "Concerned" || item.sentiment === "Negative"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {item.sentiment}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Key Quotes */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Recent Flagged Mentions</h4>
          <div className="space-y-2">
            {photosensitivityData.keyQuotes.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-accent/30 border-l-4 border-orange-500">
                <p className="text-sm text-foreground italic">"{item.quote}"</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{item.source}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button variant="outline" className="w-full bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Export Photosensitivity Report for PV Review
        </Button>

        {/* Insight Box */}
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <p className="text-xs text-foreground">
            <strong>Key Insight:</strong> Photosensitivity mentions are increasing at 23% above baseline, primarily from
            patient forums. KAMs report hearing about this more frequently than Med Info logs suggest. Enhanced patient
            education materials and HCP training on sun protection protocols may be needed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
