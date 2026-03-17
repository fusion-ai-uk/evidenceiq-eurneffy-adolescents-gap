"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, Globe, ShieldCheck, Stethoscope, Users } from "lucide-react"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { AnalysisSectionHeader } from "@/components/evidenceiq/analysis-components"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

type SourceBucket = "evidence" | "clinical" | "stakeholder"

type SourceRecord = {
  url: string
  host: string
  bucket: SourceBucket
}

const BUCKET_META: Record<SourceBucket, { label: string; subtitle: string; icon: React.ReactNode }> = {
  evidence: {
    label: "Evidence-Grade Sources",
    subtitle: "Guidelines, policy bodies, registries, NHS pathways, and peer-reviewed literature.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  clinical: {
    label: "Clinical Conversation & Interpretation",
    subtitle: "Clinician explainers, educational reviews, practical summaries, and interpretation resources.",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  stakeholder: {
    label: "Stakeholder Voice",
    subtitle: "Advocacy, media, public discourse, campaign material, and broader ecosystem context.",
    icon: <Users className="h-4 w-4" />,
  },
}

function parseHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return "unparsed-source"
  }
}

function inAny(host: string, allowList: string[]) {
  return allowList.some((item) => host === item || host.endsWith(`.${item}`))
}

function classifySource(url: string): SourceBucket {
  let host = ""
  let path = ""
  try {
    const parsed = new URL(url)
    host = parsed.hostname.replace(/^www\./, "").toLowerCase()
    path = parsed.pathname.toLowerCase()
  } catch {
    return "stakeholder"
  }

  if (
    inAny(host, [
      "nice.org.uk",
      "gov.uk",
      "gov.scot",
      "gov.wales",
      "nhs.uk",
      "hra.nhs.uk",
      "nhsbsa.nhs.uk",
      "resus.org.uk",
      "rcpch.ac.uk",
      "pharmaceuticalpress.com",
      "frontiersin.org",
      "link.springer.com",
      "all-imm.com",
      "journals.plos.org",
      "nature.com",
      "jkms.org",
      "riaponline.it",
      "ceemjournal.org",
      "dovepress.com",
      "publichealth.jmir.org",
      "canadianallergyandimmunologytoday.com",
      "termedia.pl",
      "ncbi.nlm.nih.gov",
      "allergy.org.au",
      "aaaai.org",
      "aafp.org",
      "aap.org",
      "cps.ca",
      "cpr.heart.org",
      "food.gov.uk",
      "science.food.gov.uk",
      "rightdecisions.scot.nhs.uk",
      "clinicalguidelines.scot.nhs.uk",
    ])
  ) {
    return "evidence"
  }

  if (host === "bsaci.org") {
    if (/(guidelines|resources|workforce|statement|registry|action)/.test(path)) return "evidence"
    return "stakeholder"
  }

  if (
    inAny(host, [
      "medscape.com",
      "reference.medscape.com",
      "emedicine.medscape.com",
      "bestpractice.bmj.com",
      "bjgp.org",
      "emra.org",
      "rcemlearning.co.uk",
      "dontforgetthebubbles.com",
      "app.pulsenotes.com",
      "patient.info",
      "news-medical.net",
      "hospitalhealthcare.com",
      "medicinetoday.com.au",
      "medizinonline.com",
      "emjreviews.com",
      "uspharmacist.com",
      "nutritionguide.pcrm.org",
      "learninghub.nhs.uk",
      "portal.e-lfh.org.uk",
      "protrainings.uk",
      "reactfirst.co.uk",
      "surreyfirstaid.com",
      "firstaidforlife.org.uk",
    ])
  ) {
    return "clinical"
  }

  return "stakeholder"
}

function buildDomainSummary(records: SourceRecord[]) {
  const counts = new Map<string, number>()
  for (const record of records) counts.set(record.host, (counts.get(record.host) ?? 0) + 1)
  return Array.from(counts.entries())
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
}

export default function SourcesPage() {
  const { dataset, isLoading, error } = useAnalysisContext()
  const [query, setQuery] = React.useState("")

  const allSources = React.useMemo<SourceRecord[]>(() => {
    const rows = dataset?.allRows ?? []
    const unique = new Set<string>()
    for (const row of rows) {
      if (!row.sourceUrl) continue
      unique.add(row.sourceUrl)
    }
    return Array.from(unique).map((url) => ({
      url,
      host: parseHost(url),
      bucket: classifySource(url),
    }))
  }, [dataset])

  const filteredSources = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSources
    return allSources.filter((source) => source.url.toLowerCase().includes(q) || source.host.includes(q))
  }, [allSources, query])

  const byBucket = React.useMemo(() => {
    const grouped: Record<SourceBucket, SourceRecord[]> = { evidence: [], clinical: [], stakeholder: [] }
    for (const source of filteredSources) grouped[source.bucket].push(source)
    for (const key of Object.keys(grouped) as SourceBucket[]) {
      grouped[key] = grouped[key].sort((a, b) => a.host.localeCompare(b.host) || a.url.localeCompare(b.url))
    }
    return grouped
  }, [filteredSources])

  const totals = React.useMemo(() => {
    const total = filteredSources.length
    return {
      total,
      evidence: byBucket.evidence.length,
      clinical: byBucket.clinical.length,
      stakeholder: byBucket.stakeholder.length,
    }
  }, [filteredSources, byBucket])

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading source index...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader
        title="Sources"
        description="Complete source registry for the EURneffy UK adolescent analysis, bucketed by evidence strength and usage context."
      />

      <section id="sources-overview" className="scroll-mt-24">
        <Card className="border-primary/20 bg-gradient-to-br from-indigo-500/10 via-background to-cyan-500/10 py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-base">Source Intelligence Registry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 text-sm text-muted-foreground">
            <p>
              This page consolidates extracted `_source_url` entries and groups them into evidence-grade material, clinical interpretation
              context, and stakeholder voice sources. It is designed for transparent auditability and fast source-level navigation.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border border-border/70 bg-background/70 p-2">
                <p className="text-[11px] uppercase tracking-wide">Total unique sources</p>
                <p className="text-lg font-semibold tabular-nums">{totals.total}</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/70 p-2">
                <p className="text-[11px] uppercase tracking-wide">Evidence-grade</p>
                <p className="text-lg font-semibold tabular-nums">{totals.evidence}</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/70 p-2">
                <p className="text-[11px] uppercase tracking-wide">Clinical interpretation</p>
                <p className="text-lg font-semibold tabular-nums">{totals.clinical}</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/70 p-2">
                <p className="text-[11px] uppercase tracking-wide">Stakeholder voice</p>
                <p className="text-lg font-semibold tabular-nums">{totals.stakeholder}</p>
              </div>
            </div>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by domain or URL..."
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="sources-buckets" className="scroll-mt-24">
        <Tabs defaultValue="evidence" className="space-y-3">
          <TabsList>
            <TabsTrigger value="evidence">Evidence-grade</TabsTrigger>
            <TabsTrigger value="clinical">Clinical interpretation</TabsTrigger>
            <TabsTrigger value="stakeholder">Stakeholder voice</TabsTrigger>
          </TabsList>

          {(Object.keys(BUCKET_META) as SourceBucket[]).map((bucketKey) => {
            const entries = byBucket[bucketKey]
            const topDomains = buildDomainSummary(entries).slice(0, 12)

            return (
              <TabsContent key={bucketKey} value={bucketKey} className="space-y-3">
                <Card className="py-4">
                  <CardHeader className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{BUCKET_META[bucketKey].icon}</span>
                      <CardTitle className="text-sm">{BUCKET_META[bucketKey].label}</CardTitle>
                      <Badge variant="secondary" className="ml-auto tabular-nums">
                        {entries.length} sources
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 px-4 xl:grid-cols-[1fr_2fr]">
                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed text-muted-foreground">{BUCKET_META[bucketKey].subtitle}</p>
                      <div className="rounded-md border p-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Top source domains</p>
                        <div className="mt-2 space-y-1.5">
                          {topDomains.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No sources matched current filter.</p>
                          ) : (
                            topDomains.map((domain) => (
                              <div key={domain.host} className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate">{domain.host}</span>
                                <Badge variant="outline" className="tabular-nums">{domain.count}</Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <Card className="border-border/70 py-0">
                      <CardContent className="p-0">
                        <ScrollArea className="h-[460px]">
                          <div className="space-y-1.5 p-2.5">
                            {entries.length === 0 ? (
                              <p className="p-2 text-sm text-muted-foreground">No sources in this bucket for current filter.</p>
                            ) : (
                              entries.slice(0, 280).map((entry) => (
                                <div key={entry.url} className="rounded-md border border-border/70 bg-background/70 p-2">
                                  <div className="mb-1 flex items-center gap-2">
                                    <Badge variant="secondary" className="max-w-[220px] truncate">
                                      {entry.host}
                                    </Badge>
                                  </div>
                                  <Link
                                    href={entry.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex max-w-full items-start gap-1 text-xs text-primary hover:underline"
                                  >
                                    <span className="truncate">{entry.url}</span>
                                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                  </Link>
                                </div>
                              ))
                            )}
                            {entries.length > 280 ? (
                              <p className="px-1 pt-1 text-[11px] text-muted-foreground">
                                Showing first 280 sources in this bucket. Use the filter field to narrow further.
                              </p>
                            ) : null}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </section>
    </div>
  )
}

