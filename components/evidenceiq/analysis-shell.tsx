"use client"

import * as React from "react"
import { AnalysisProvider } from "@/components/evidenceiq/analysis-context"
import { AnalystWorkspaceProvider } from "@/components/evidenceiq/analyst-workspace"

function InnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  )
}

export function AnalysisShell({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={<div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading analysis...</div>}
    >
      <AnalysisProvider>
        <AnalystWorkspaceProvider>
          <InnerShell>{children}</InnerShell>
        </AnalystWorkspaceProvider>
      </AnalysisProvider>
    </React.Suspense>
  )
}

