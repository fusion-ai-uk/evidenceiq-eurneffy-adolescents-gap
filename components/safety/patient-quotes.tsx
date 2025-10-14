import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const quotes = [
  {
    quote:
      "The photosensitivity is really challenging. I have to avoid sunlight completely and even indoor lighting can trigger reactions.",
    ae: "Photosensitivity",
    drug: "Zynlonta",
    source: "Patient Forum, UK",
    severity: "Moderate",
  },
  {
    quote: "I experienced severe CRS after my second dose. The hospital team managed it well but it was frightening.",
    ae: "CRS",
    drug: "Epcoritamab",
    source: "Patient Support Group, UK",
    severity: "High",
  },
  {
    quote: "The confusion and neurological symptoms from ICANS were terrifying for both me and my family.",
    ae: "ICANS",
    drug: "Glofitamab",
    source: "Caregiver Forum, UK",
    severity: "High",
  },
  {
    quote: "I've had multiple infections since starting treatment. My immune system seems very compromised.",
    ae: "Infections",
    drug: "Bispecifics",
    source: "Patient Community, UK",
    severity: "Moderate",
  },
]

export function PatientQuotes() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Patient-Reported AE Experiences</CardTitle>
        <p className="text-sm text-muted-foreground">Anonymized patient and caregiver quotes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quotes.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg bg-accent/30 border-l-4 ${item.severity === "High" ? "border-destructive" : "border-chart-2"}`}
            >
              <p className="text-sm text-foreground italic">"{item.quote}"</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={item.severity === "High" ? "destructive" : "secondary"} className="text-xs">
                  {item.ae}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.drug}</span>
                <span className="text-xs text-muted-foreground">• {item.source}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
