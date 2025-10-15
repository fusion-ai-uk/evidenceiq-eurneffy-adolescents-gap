"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"

type Row = {
  therapy: string
  aspect: string
  tag: string
  volume: number
  stance: "Positive" | "Negative" | "Mixed"
  confidence: number
}

export function NarrativeAnalysis({ selected = [] as string[], frameless = false }: { selected?: string[]; frameless?: boolean }) {
  // Replace API-driven block with curated narrative cards
  const cards = useMemo(() => {
    const data = require("@/data/brandNarratives").brandNarratives as Array<{
      brand: string; keyThemes: string[]; narrativeSummary: string; sentiment: string; emotionalTone: string[];
    }>
    if (!selected.length) return data
    return data.filter(b => selected.includes(b.brand))
  }, [selected])

  if (frameless) {
    return (
      <div>
        <h2 className="mt-4 text-base font-semibold mb-2">Narrative analysis</h2>
        <div className={`grid gap-4 grid-cols-1 ${cards.length >= 2 ? 'md:grid-cols-2' : ''}`}>
          {cards.map((b, i) => {
            const isLastAndNeedsFull = cards.length === 3 && i === 2
            return (
              <div key={b.brand} className={`rounded-lg border border-border/40 bg-background/40 p-3 ${isLastAndNeedsFull ? 'md:col-span-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{b.brand}</div>
                  <Badge variant="secondary">{b.sentiment}</Badge>
                </div>
                <p className="text-sm italic text-muted-foreground mt-1">{b.narrativeSummary}</p>
                <ul className="mt-2 text-[13px] leading-6 list-disc list-inside text-muted-foreground">
                  {b.keyThemes.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-muted-foreground">Tone: {b.emotionalTone.join(" · ")}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Narrative analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 grid-cols-1 ${cards.length >= 2 ? 'md:grid-cols-2' : ''}`}>
          {cards.map((b, i) => {
            const isLastAndNeedsFull = cards.length === 3 && i === 2
            return (
              <div key={b.brand} className={`rounded-lg border border-border/40 bg-background/40 p-3 ${isLastAndNeedsFull ? 'md:col-span-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{b.brand}</div>
                  <Badge variant="secondary">{b.sentiment}</Badge>
                </div>
                <p className="text-sm italic text-muted-foreground mt-1">{b.narrativeSummary}</p>
                <ul className="mt-2 text-[13px] leading-6 list-disc list-inside text-muted-foreground">
                  {b.keyThemes.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-muted-foreground">Tone: {b.emotionalTone.join(" · ")}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
