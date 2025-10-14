import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const hcpCartMessages = [
  {
    objection: "Bispecifics offer CAR-T-like durability",
    counterpoint: "Zynlonta provides valuable bridging option for CAR-T ineligible patients with manageable toxicity",
    dataFrame: "LOTIS-2: 48% ORR, median DOR 13.4 months in heavily pretreated population",
  },
  {
    objection: "Limited long-term data vs bispecifics",
    counterpoint: "Real-world evidence emerging shows durable responses in 3L setting with favorable safety profile",
    dataFrame: "UK registry data: 42% of patients maintained response >12 months",
  },
]

const hcpDghMessages = [
  {
    objection: "Photosensitivity management is complex",
    counterpoint: "Clear patient education protocols minimize risk; outpatient administration reduces hospital burden",
    dataFrame: "Manageable with sun protection; Grade 3+ rash in <10% of patients",
  },
  {
    objection: "Limited experience with ADCs at our site",
    counterpoint: "Simple dosing schedule (Q3W); comprehensive support program available including nurse training",
    dataFrame: "Standardized protocols available; medical affairs support for implementation",
  },
]

const patientMessages = [
  {
    concern: "Will I be included in treatment decisions?",
    response:
      "Your preferences matter. Discuss all available options with your healthcare team including benefits and risks.",
    supportMaterial: "Patient decision aid comparing 3L treatment options",
  },
  {
    concern: "Can I afford this treatment?",
    response:
      "Zynlonta is fully covered by the NHS for eligible patients. No out-of-pocket costs for approved indications.",
    supportMaterial: "NHS coverage FAQ and patient access program information",
  },
  {
    concern: "How will side effects impact my daily life?",
    response:
      "Photosensitivity is manageable with precautions. Outpatient dosing means less time in hospital vs other options.",
    supportMaterial: "Living with Zynlonta: practical tips for managing side effects",
  },
]

const caregiverMessages = [
  {
    concern: "How can I support my loved one?",
    response: "Help with sun protection reminders, appointment scheduling, and emotional support during treatment.",
    supportMaterial: "Caregiver guide: supporting someone on Zynlonta",
  },
  {
    concern: "What should I watch for at home?",
    response: "Monitor for skin changes, fever, or unusual symptoms. Contact healthcare team if concerns arise.",
    supportMaterial: "Home monitoring checklist and when to call the doctor",
  },
]

export function AudienceTailored() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Audience-Tailored Messaging</CardTitle>
        <p className="text-sm text-muted-foreground">Objection handling and support materials by audience segment</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hcp-cart" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hcp-cart">HCP: CAR-T</TabsTrigger>
            <TabsTrigger value="hcp-dgh">HCP: DGH</TabsTrigger>
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="caregiver">Caregiver</TabsTrigger>
          </TabsList>

          <TabsContent value="hcp-cart" className="mt-4 space-y-3">
            {hcpCartMessages.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
                <div className="mb-2">
                  <Badge variant="destructive" className="text-xs mb-2">
                    Objection
                  </Badge>
                  <p className="text-sm text-foreground italic">"{item.objection}"</p>
                </div>
                <div className="mb-2">
                  <Badge variant="default" className="text-xs mb-2">
                    Counterpoint
                  </Badge>
                  <p className="text-sm text-foreground">{item.counterpoint}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-2">
                    Data Frame
                  </Badge>
                  <p className="text-sm text-muted-foreground">{item.dataFrame}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="hcp-dgh" className="mt-4 space-y-3">
            {hcpDghMessages.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
                <div className="mb-2">
                  <Badge variant="destructive" className="text-xs mb-2">
                    Objection
                  </Badge>
                  <p className="text-sm text-foreground italic">"{item.objection}"</p>
                </div>
                <div className="mb-2">
                  <Badge variant="default" className="text-xs mb-2">
                    Counterpoint
                  </Badge>
                  <p className="text-sm text-foreground">{item.counterpoint}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-2">
                    Data Frame
                  </Badge>
                  <p className="text-sm text-muted-foreground">{item.dataFrame}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="patient" className="mt-4 space-y-3">
            {patientMessages.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs mb-2">
                    Patient Concern
                  </Badge>
                  <p className="text-sm text-foreground italic">"{item.concern}"</p>
                </div>
                <div className="mb-2">
                  <Badge variant="default" className="text-xs mb-2">
                    Response
                  </Badge>
                  <p className="text-sm text-foreground">{item.response}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-2">
                    Support Material
                  </Badge>
                  <p className="text-sm text-muted-foreground">{item.supportMaterial}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="caregiver" className="mt-4 space-y-3">
            {caregiverMessages.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs mb-2">
                    Caregiver Concern
                  </Badge>
                  <p className="text-sm text-foreground italic">"{item.concern}"</p>
                </div>
                <div className="mb-2">
                  <Badge variant="default" className="text-xs mb-2">
                    Response
                  </Badge>
                  <p className="text-sm text-foreground">{item.response}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-2">
                    Support Material
                  </Badge>
                  <p className="text-sm text-muted-foreground">{item.supportMaterial}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
