'use client'

import { Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Milestone } from '@/lib/milestones'

export function EventDrawer({ open, onClose, milestone }: { open: boolean; onClose: () => void; milestone?: Milestone }) {
  if (!open || !milestone) return null
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl overflow-y-auto">
        <Card className="rounded-none border-0">
          <CardHeader>
            <CardTitle className="text-base">{milestone.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{milestone.date} | Impact: {milestone.impact}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{milestone.narrative}</div>
            {milestone.supportingMetrics && (
              <div className="text-xs grid grid-cols-3 gap-3">
                {milestone.supportingMetrics.count !== undefined && <div><span className="text-muted-foreground">Count</span><div className="font-medium">{milestone.supportingMetrics.count}</div></div>}
                {milestone.supportingMetrics.pctChange !== undefined && <div><span className="text-muted-foreground">Δ%</span><div className="font-medium">{Math.round((milestone.supportingMetrics.pctChange || 0) * 100)}</div></div>}
                {milestone.supportingMetrics.z !== undefined && <div><span className="text-muted-foreground">z-score</span><div className="font-medium">{milestone.supportingMetrics.z}</div></div>}
              </div>
            )}
            {milestone.tags && milestone.tags.length > 0 && (
              <div className="text-xs flex flex-wrap gap-2">
                {milestone.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-accent/40 border border-border/60">{t}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


