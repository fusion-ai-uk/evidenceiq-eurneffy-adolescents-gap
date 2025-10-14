import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const patientLanguage = [
  { phrase: "manageable side effects", frequency: 89, sentiment: "Positive", useCase: "Patient materials" },
  { phrase: "convenient outpatient dosing", frequency: 76, sentiment: "Positive", useCase: "QoL messaging" },
  { phrase: "clear information needed", frequency: 64, sentiment: "Neutral", useCase: "Education gap" },
  { phrase: "sun protection routine", frequency: 52, sentiment: "Neutral", useCase: "Safety guidance" },
]

const hcpLanguage = [
  { phrase: "bridging to definitive therapy", frequency: 112, sentiment: "Positive", useCase: "HCP positioning" },
  { phrase: "favorable toxicity profile", frequency: 98, sentiment: "Positive", useCase: "Safety messaging" },
  { phrase: "capacity constraints", frequency: 87, sentiment: "Negative", useCase: "DGH pain point" },
  { phrase: "real-world evidence", frequency: 73, sentiment: "Neutral", useCase: "Data needs" },
]

export function LanguageMining() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Language Mining</CardTitle>
        <p className="text-sm text-muted-foreground">Patient and HCP-validated phrases for support materials</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Patient Language</h4>
            <div className="space-y-2">
              {patientLanguage.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">"{item.phrase}"</span>
                      <Badge
                        variant={
                          item.sentiment === "Positive"
                            ? "default"
                            : item.sentiment === "Negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{item.frequency} uses</span>
                      <span className="text-xs text-muted-foreground">• {item.useCase}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">HCP Language</h4>
            <div className="space-y-2">
              {hcpLanguage.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">"{item.phrase}"</span>
                      <Badge
                        variant={
                          item.sentiment === "Positive"
                            ? "default"
                            : item.sentiment === "Negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{item.frequency} uses</span>
                      <span className="text-xs text-muted-foreground">• {item.useCase}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
