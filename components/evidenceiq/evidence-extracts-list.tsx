import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EvidenceExtract } from "@/lib/evidence/types"

export function EvidenceExtractsList({ extracts }: { extracts: EvidenceExtract[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">Linked evidence extracts</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {extracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked extracts for this article row.</p>
        ) : (
          <div className="space-y-3">
            {extracts.map((entry) => (
              <div key={`${entry.rowId}-${entry.extractRank}-${entry.extractText.slice(0, 20)}`} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rank {entry.extractRank ?? "n/a"}</span>
                  {entry.isGapExtract ? <Badge className="bg-amber-600 text-white">Gap extract</Badge> : <Badge variant="secondary">Evidence extract</Badge>}
                </div>
                <p className="text-sm leading-relaxed">{entry.extractText}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

