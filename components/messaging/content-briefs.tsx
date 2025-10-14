import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"

const briefs = [
  {
    title: "Countering Bispecific Durability Narrative",
    audience: "HCPs at CAR-T Centres",
    format: "Slide Deck",
    pages: 12,
    keyMessages: ["Zynlonta bridging role", "Complementary positioning", "Real-world durability data"],
    status: "Ready",
  },
  {
    title: "Photosensitivity Management Guide",
    audience: "DGH HCPs and Patients",
    format: "Patient Brochure",
    pages: 4,
    keyMessages: ["Prevention strategies", "What to expect", "When to contact healthcare team"],
    status: "Ready",
  },
  {
    title: "NHS Access and Eligibility FAQ",
    audience: "All HCPs and Patients",
    format: "FAQ Document",
    pages: 6,
    keyMessages: ["NICE TA947 criteria", "Referral pathways", "Coverage confirmation"],
    status: "Ready",
  },
  {
    title: "3L Treatment Decision Aid",
    audience: "Patients and Caregivers",
    format: "Interactive Tool",
    pages: 8,
    keyMessages: ["Treatment options comparison", "Side effect profiles", "Lifestyle considerations"],
    status: "In Development",
  },
]

export function ContentBriefs() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Content Briefs & Materials</CardTitle>
        <p className="text-sm text-muted-foreground">Slide-ready exports and support materials</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {briefs.map((brief, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{brief.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {brief.format} • {brief.pages} pages • {brief.audience}
                    </p>
                  </div>
                </div>
                <Badge variant={brief.status === "Ready" ? "default" : "secondary"}>{brief.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {brief.keyMessages.map((message, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                    {message}
                  </span>
                ))}
              </div>
              {brief.status === "Ready" && (
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download {brief.format}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
