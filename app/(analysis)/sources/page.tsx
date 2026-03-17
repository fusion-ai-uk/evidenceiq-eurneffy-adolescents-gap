"use client"

import * as React from "react"
import { Globe, ShieldCheck, Stethoscope, Users } from "lucide-react"
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
  return Array.from(new Set(records.map((record) => record.host))).sort((a, b) => a.localeCompare(b))
}

function buildSourceGroups(records: SourceRecord[]) {
  const grouped = new Map<string, string[]>()
  for (const record of records) {
    const existing = grouped.get(record.host) ?? []
    existing.push(record.url)
    grouped.set(record.host, existing)
  }
  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([host, urls]) => ({
      host,
      samples: urls.sort((a, b) => a.localeCompare(b)).slice(0, 3),
    }))
}

function shortPath(url: string) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === "/" ? "" : parsed.pathname
    const raw = `${parsed.hostname.replace(/^www\./, "")}${path}`
    return raw.length > 95 ? `${raw.slice(0, 95)}...` : raw
  } catch {
    return url.length > 95 ? `${url.slice(0, 95)}...` : url
  }
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
              context, and stakeholder voice sources. It is designed to show the breadth and diversity of the evidence ecosystem used for this analysis.
            </p>
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              The domains and URLs shown here are a curated handful of key source examples for orientation. The analysis is not limited to only these examples.
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
            const domains = buildDomainSummary(entries).slice(0, 24)
            const sourceGroups = buildSourceGroups(entries)

            return (
              <TabsContent key={bucketKey} value={bucketKey} className="space-y-3">
                <Card className="py-4">
                  <CardHeader className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{BUCKET_META[bucketKey].icon}</span>
                      <CardTitle className="text-sm">{BUCKET_META[bucketKey].label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 px-4 xl:grid-cols-[1fr_2fr]">
                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed text-muted-foreground">{BUCKET_META[bucketKey].subtitle}</p>
                      <div className="rounded-md border p-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Example domains in this bucket</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {domains.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No sources matched current filter.</p>
                          ) : (
                            domains.map((domain) => (
                              <Badge key={domain} variant="secondary">{domain}</Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <Card className="border-border/70 py-0">
                      <CardContent className="p-0">
                        <ScrollArea className="h-[460px]">
                          <div className="space-y-1.5 p-2.5">
                            {sourceGroups.length === 0 ? (
                              <p className="p-2 text-sm text-muted-foreground">No sources in this bucket for current filter.</p>
                            ) : (
                              sourceGroups.map((group) => (
                                <div key={group.host} className="rounded-md border border-border/70 bg-background/70 p-2">
                                  <div className="mb-2 flex items-center gap-2">
                                    <Badge variant="secondary" className="max-w-[220px] truncate">
                                      {group.host}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    {group.samples.map((sample) => (
                                      <p key={sample} className="text-xs text-muted-foreground truncate">
                                        {shortPath(sample)}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
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

