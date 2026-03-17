import type { ReactNode } from "react"
import { AnalysisShell } from "@/components/evidenceiq/analysis-shell"

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return <AnalysisShell>{children}</AnalysisShell>
}

