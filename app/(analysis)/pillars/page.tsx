"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { PILLARS } from "@/lib/evidence/taxonomy"
import {
  getAverageScore,
  getRowsForPillar,
  getTagFrequency,
  getTopEvidenceRows,
  getTopGapRows,
} from "@/lib/evidence/selectors"
import {
  AnalysisSectionHeader,
  EvidenceRowList,
  MetricStrip,
  PillarDetailPanel,
  RankedTaxonomyBars,
} from "@/components/evidenceiq/analysis-components"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import type { ArticleRow } from "@/lib/evidence/types"
import { formatShare } from "@/lib/evidence/display"

export default function PillarsPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedPillar, setSelectedPillar] = React.useState(PILLARS[0].key)
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  React.useEffect(() => {
    const pillar = searchParams.get("pillar")
    if (pillar && PILLARS.some((entry) => entry.key === pillar)) setSelectedPillar(pillar as typeof selectedPillar)
  }, [searchParams])

  React.useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    params.set("pillar", selectedPillar)
    params.delete("scope")
    params.delete("tag")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [selectedPillar, pathname, router])

  const pillarRows = React.useMemo(() => {
    return getRowsForPillar(filteredRows, selectedPillar)
  }, [filteredRows, selectedPillar])
  const totalPillarRows = pillarRows.length

  const pillarCards = React.useMemo(() => {
    return PILLARS.map((pillar) => {
      const rows = getRowsForPillar(filteredRows, pillar.key)
      const highPriority = rows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length
      const noAdolescent = rows.filter((row) => row.reportsNoAdolescentBreakout).length
      const noUk = rows.filter((row) => row.reportsNoUkBreakout).length
      const noRealWorld = rows.filter((row) => row.reportsNoRealWorldErrorData).length
      const noSetting = rows.filter((row) => row.reportsNoSettingSpecificData).length
      const noEquity = rows.filter((row) => row.reportsNoEquitySubgroupData).length
      const missingBreakoutBurden = getAverageScore(rows, (row) => {
        let missing = 0
        if (row.reportsNoAdolescentBreakout) missing += 1
        if (row.reportsNoUkBreakout) missing += 1
        if (row.reportsNoRealWorldErrorData) missing += 1
        if (row.reportsNoSettingSpecificData) missing += 1
        if (row.reportsNoEquitySubgroupData) missing += 1
        return (missing / 5) * 100
      })
      return {
        key: pillar.key,
        label: pillar.label,
        gapPressure: getAverageScore(rows, (row) => row.gapUsefulnessScore),
        rows: rows.length,
        highPriority,
        noRealWorld,
        noSetting,
        noEquity,
        missingBreakoutBurden,
        noAdolescent,
        noUk,
      }
    })
  }, [filteredRows])

  const summaryItems = React.useMemo(
    () => [
      { label: "Average gap signal", value: getAverageScore(pillarRows, (row) => row.gapUsefulnessScore).toFixed(1) },
      { label: "High-priority gap share", value: formatShare(pillarRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalPillarRows) },
      {
        label: "Missing-breakout burden",
        value: `${getAverageScore(pillarRows, (row) => {
          let missing = 0
          if (row.reportsNoAdolescentBreakout) missing += 1
          if (row.reportsNoUkBreakout) missing += 1
          if (row.reportsNoRealWorldErrorData) missing += 1
          if (row.reportsNoSettingSpecificData) missing += 1
          if (row.reportsNoEquitySubgroupData) missing += 1
          return (missing / 5) * 100
        }).toFixed(0)}%`,
      },
      { label: "No adolescent breakout share", value: formatShare(pillarRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalPillarRows) },
      { label: "No UK breakout share", value: formatShare(pillarRows.filter((row) => row.reportsNoUkBreakout).length, totalPillarRows) },
      { label: "No real-world error data share", value: formatShare(pillarRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalPillarRows) },
      { label: "No setting-specific data share", value: formatShare(pillarRows.filter((row) => row.reportsNoSettingSpecificData).length, totalPillarRows) },
      { label: "No equity subgroup data share", value: formatShare(pillarRows.filter((row) => row.reportsNoEquitySubgroupData).length, totalPillarRows) },
    ],
    [pillarRows, totalPillarRows],
  )

  const rankedSupportRows = React.useMemo(
    () => getTopEvidenceRows(pillarRows, "evidence", selectedPillar, 10),
    [pillarRows, selectedPillar],
  )
  const rankedGapRows = React.useMemo(() => getTopGapRows(pillarRows, 10), [pillarRows])

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading pillar analysis...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="Pillars" description="Compare where gap pressure is strongest across the five narrative pillars." />

      <section id="pillars-comparison" className="scroll-mt-24">
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            This section ranks pillars by unresolved UK adolescent evidence gaps so priorities are immediately clear.
            It emphasizes where high-priority gaps and repeated missing breakouts are concentrated.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[...pillarCards]
              .sort((a, b) => b.highPriority - a.highPriority || b.missingBreakoutBurden - a.missingBreakoutBurden || b.gapPressure - a.gapPressure)
              .map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedPillar(item.key as typeof selectedPillar)}
                  className={[
                    "rounded-xl border bg-card/60 p-3 text-left transition hover:border-primary/40",
                    selectedPillar === item.key ? "border-primary bg-primary/5" : "",
                  ].join(" ")}
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">High-priority gap share: {formatShare(item.highPriority, item.rows)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Missing-breakout burden: {item.missingBreakoutBurden.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">No adolescent breakout share: {formatShare(item.noAdolescent, item.rows)}</p>
                  <p className="text-xs text-muted-foreground">No UK breakout share: {formatShare(item.noUk, item.rows)}</p>
                </button>
              ))}
          </div>
        </div>
      </section>

      <section id="pillars-kpis" className="scroll-mt-24">
        <MetricStrip items={summaryItems} />
      </section>

      <PillarDetailPanel>
        <div id="pillars-tags" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
          <RankedTaxonomyBars title="Barrier tags" items={getTagFrequency(pillarRows, (row) => row.barrierTags)} />
          <RankedTaxonomyBars title="Setting tags" items={getTagFrequency(pillarRows, (row) => row.settingTags)} />
          <RankedTaxonomyBars title="Behavioural drivers" items={getTagFrequency(pillarRows, (row) => row.behaviouralDriverTags)} />
          <RankedTaxonomyBars title="Data gap tags" items={getTagFrequency(pillarRows, (row) => row.dataGapTags)} />
          <RankedTaxonomyBars title="EURneffy opportunity tags" items={getTagFrequency(pillarRows, (row) => row.eurOpportunityTags)} />
        </div>

        <div id="pillars-evidence" className="scroll-mt-24 space-y-3">
          <EvidenceRowList title="Best supporting evidence" rows={rankedSupportRows} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
          <EvidenceRowList title="Most important gaps inside this pillar" rows={rankedGapRows} onOpen={setSelectedRow} rightCol="gapSummary" />
        </div>

        <EvidenceRowList title="Pillar evidence ledger" rows={pillarRows.slice(0, 40)} onOpen={setSelectedRow} rightCol="kolQuestion" />
      </PillarDetailPanel>

      <ArticleDetailDrawer
        row={selectedRow}
        extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </div>
  )
}

