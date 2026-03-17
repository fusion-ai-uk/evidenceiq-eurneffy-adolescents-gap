import { Badge } from "@/components/ui/badge"
import type { ArticleRow } from "@/lib/evidence/types"
import { SCORE_THRESHOLDS } from "@/lib/evidence/constants"

export function RowQualityBadge({ row }: { row: ArticleRow }) {
  if (!row.keep) {
    return <Badge variant="destructive">Excluded</Badge>
  }
  if (row.textProbablyPartial || row.processingStatus.toLowerCase() === "partial") {
    return <Badge variant="outline">Partial extraction</Badge>
  }
  if ((row.eurRelevanceScore ?? 0) >= SCORE_THRESHOLDS.highEurRelevance) {
    return <Badge className="bg-emerald-600 text-white">High EURneffy relevance</Badge>
  }
  if (["high", "critical"].includes(row.gapPriority.toLowerCase())) {
    return <Badge className="bg-amber-600 text-white">High-priority gap</Badge>
  }
  return <Badge variant="secondary">Included</Badge>
}

