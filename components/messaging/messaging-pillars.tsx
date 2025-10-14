import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Shield, Key, Heart } from "lucide-react"

const pillars = [
  {
    title: "Efficacy",
    icon: Target,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/10",
    insight: "Zynlonta demonstrates durable responses in 3L+ DLBCL with 48% ORR in LOTIS-2",
    recommendation: "Emphasize bridging to transplant and real-world durability data",
    audience: "HCPs at CAR-T centres",
    priority: "High",
  },
  {
    title: "Safety",
    icon: Shield,
    color: "text-[#10b981]",
    bgColor: "bg-[#10b981]/10",
    insight: "Photosensitivity is manageable with proper patient education and precautions",
    recommendation: "Develop clear patient guidance materials and HCP training on AE management",
    audience: "DGHs and Patients",
    priority: "High",
  },
  {
    title: "Access",
    icon: Key,
    color: "text-[#f59e0b]",
    bgColor: "bg-[#f59e0b]/10",
    insight: "NICE-approved for 3L+ but confusion remains about eligibility criteria",
    recommendation: "Clarify patient selection criteria and NHS pathway navigation",
    audience: "All HCPs and Patients",
    priority: "Medium",
  },
  {
    title: "Quality of Life",
    icon: Heart,
    color: "text-[#ec4899]",
    bgColor: "bg-[#ec4899]/10",
    insight: "Outpatient administration offers lifestyle advantages vs inpatient bispecifics",
    recommendation: "Highlight convenience, reduced hospital burden, and caregiver benefits",
    audience: "Patients and Caregivers",
    priority: "Medium",
  },
]

export function MessagingPillars() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pillars.map((pillar, index) => {
        const Icon = pillar.icon
        return (
          <Card key={index} className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${pillar.bgColor}`}>
                  <Icon className={`h-5 w-5 ${pillar.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-medium">{pillar.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={pillar.priority === "High" ? "default" : "secondary"} className="text-xs">
                      {pillar.priority} Priority
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Key Insight</h4>
                <p className="text-sm text-foreground">{pillar.insight}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Recommendation</h4>
                <p className="text-sm text-foreground">{pillar.recommendation}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Target Audience</h4>
                <Badge variant="outline" className="text-xs">
                  {pillar.audience}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
