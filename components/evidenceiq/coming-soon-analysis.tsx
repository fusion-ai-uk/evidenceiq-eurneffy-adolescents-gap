import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ComingSoonAnalysis({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

