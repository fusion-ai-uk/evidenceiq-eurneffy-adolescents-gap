"use client"

import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ArticleRow, EvidenceExtract } from "@/lib/evidence/types"
import { EvidenceExtractsList } from "@/components/evidenceiq/evidence-extracts-list"

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={`${title}-${tag}`} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function TextBlock({ title, value }: { title: string; value: string }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export function ArticleDetailDrawer({
  row,
  extracts,
  open,
  onOpenChange,
}: {
  row: ArticleRow | null
  extracts: EvidenceExtract[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
        {row ? (
          <>
            <SheetHeader>
              <SheetTitle>{row.title || "Untitled source row"}</SheetTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  Source URL <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a href={`/evidence-explorer?search=${encodeURIComponent(row.title || row.rowId)}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                  Back to filtered evidence
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-4">
                <Badge variant="outline">{row.sourceType || "Unknown source type"}</Badge>
                <Badge variant="outline">{row.gapPriority || "No gap priority"}</Badge>
              </div>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-6">
              <TextBlock title="One-line takeaway" value={row.oneLineTakeaway} />
              <TextBlock title="Evidence summary" value={row.evidenceSummary} />
              <TextBlock title="Why it matters for brief" value={row.fitWhyItMatters} />
              <TextBlock title="What it is not" value={row.fitWhatItIsNot} />

              <div className="grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2">
                <p>Usefulness: <span className="font-medium">{row.usefulnessScore ?? "n/a"}</span></p>
                <p>Message usefulness: <span className="font-medium">{row.messageUsefulnessScore ?? "n/a"}</span></p>
                <p>Gap usefulness: <span className="font-medium">{row.gapUsefulnessScore ?? "n/a"}</span></p>
                <p>Confidence: <span className="font-medium">{row.confidenceScore ?? "n/a"}</span></p>
                <p>UK relevance: <span className="font-medium">{row.ukRelevanceScore ?? "n/a"}</span></p>
                <p>EURneffy relevance: <span className="font-medium">{row.eurRelevanceScore ?? "n/a"}</span></p>
              </div>

              <div className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-2">
                <p>Article kind: <span className="text-muted-foreground">{row.articleKind || "n/a"}</span></p>
                <p>Evidence type: <span className="text-muted-foreground">{row.evidenceType || "n/a"}</span></p>
                <p>Study design: <span className="text-muted-foreground">{row.studyDesign || "n/a"}</span></p>
                <p>Age focus: <span className="text-muted-foreground">{row.ageFocus || "n/a"}</span></p>
                <p>Population directness: <span className="text-muted-foreground">{row.populationDirectness || "n/a"}</span></p>
                <p>Geography primary: <span className="text-muted-foreground">{row.geographyPrimary || "n/a"}</span></p>
              </div>

              <TagGroup title="Audience secondary" tags={row.audienceSecondary} />
              <TagGroup title="Barrier tags" tags={row.barrierTags} />
              <TagGroup title="Setting tags" tags={row.settingTags} />
              <TagGroup title="Dosing tags" tags={row.dosingTransitionTags} />
              <TagGroup title="Recognition/response tags" tags={row.recognitionResponseTags} />
              <TagGroup title="Equity/access tags" tags={row.equityAccessTags} />
              <TagGroup title="Data gap tags" tags={row.dataGapTags} />
              <TagGroup title="EURneffy opportunity tags" tags={row.eurOpportunityTags} />
              <TagGroup title="Message cautions" tags={row.eurMessageCautions} />
              <TagGroup title="Med/legal review flags" tags={row.medLegalReviewFlags} />
              <TagGroup title="Gap reasons" tags={row.gapReasonStructured} />
              <TagGroup title="Key statistics" tags={row.keyStatistics} />
              <TagGroup title="Key quotes" tags={row.keyQuotes} />
              <TagGroup title="Evidence extracts (curated)" tags={row.evidenceExtracts} />
              <TagGroup title="Gap extracts (curated)" tags={row.gapExtracts} />
              <TagGroup title="Cited bodies/sources" tags={row.citedBodiesOrSources} />

              <TextBlock title="Gap summary" value={row.gapSummary} />
              <TextBlock title="KOL question" value={row.kolQuestion} />
              <TextBlock title="Follow-up research question" value={row.followupResearchQuestion} />
              <TextBlock title="Missing stat we wish we had" value={row.missingStatWishWeHad} />
              <TextBlock title="EURneffy support level" value={row.eurSupportLevel} />

              <EvidenceExtractsList extracts={extracts} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

