"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export type WorkingMode = "evidence" | "gap" | "opportunity"

type SavedQuestion = {
  id: string
  kind: "kol" | "followup" | "missing_stat" | "gap_cluster"
  text: string
  relatedKey?: string
}

type SavedCohort = { id: string; name: string; config: string }

type WorkspaceState = {
  workingMode: WorkingMode
  reviewMode: boolean
  savedRows: string[]
  savedExtracts: Array<{ rowId: string; extractText: string; isGapExtract: boolean }>
  savedQuestions: SavedQuestion[]
  savedStatsQuotes: Array<{ rowId: string; text: string; kind: "stat" | "quote" }>
  savedGapPriorities: string[]
  savedCohorts: SavedCohort[]
  recentlyViewedRows: string[]
  recentlyVisitedPages: string[]
}

const STORAGE_KEY = "evidenceiq-analyst-workspace-v1"

const defaultState: WorkspaceState = {
  workingMode: "evidence",
  reviewMode: false,
  savedRows: [],
  savedExtracts: [],
  savedQuestions: [],
  savedStatsQuotes: [],
  savedGapPriorities: [],
  savedCohorts: [],
  recentlyViewedRows: [],
  recentlyVisitedPages: [],
}

type AnalystWorkspaceValue = {
  state: WorkspaceState
  setWorkingMode: (mode: WorkingMode) => void
  setReviewMode: (enabled: boolean) => void
  toggleRow: (rowId: string) => void
  isRowSaved: (rowId: string) => boolean
  addExtract: (extract: { rowId: string; extractText: string; isGapExtract: boolean }) => void
  removeExtract: (rowId: string, extractText: string) => void
  addQuestion: (question: SavedQuestion) => void
  removeQuestion: (id: string) => void
  addStatQuote: (entry: { rowId: string; text: string; kind: "stat" | "quote" }) => void
  removeStatQuote: (rowId: string, text: string) => void
  toggleGapPriority: (key: string) => void
  saveCohort: (cohort: SavedCohort) => void
  removeCohort: (id: string) => void
  registerRecentlyViewed: (rowId: string) => void
  registerVisitedPage: (path: string) => void
  clearAll: () => void
}

const AnalystWorkspaceContext = React.createContext<AnalystWorkspaceValue | null>(null)

function loadState(): WorkspaceState {
  if (typeof window === "undefined") return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as WorkspaceState
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

export function AnalystWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<WorkspaceState>(defaultState)

  React.useEffect(() => setState(loadState()), [])
  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setWorkingMode = React.useCallback((mode: WorkingMode) => {
    setState((prev) => (prev.workingMode === mode ? prev : { ...prev, workingMode: mode }))
  }, [])

  const setReviewMode = React.useCallback((enabled: boolean) => {
    setState((prev) => (prev.reviewMode === enabled ? prev : { ...prev, reviewMode: enabled }))
  }, [])

  const registerRecentlyViewed = React.useCallback((rowId: string) => {
    setState((prev) => {
      if (!rowId) return prev
      if (prev.recentlyViewedRows[0] === rowId) return prev
      return {
        ...prev,
        recentlyViewedRows: [rowId, ...prev.recentlyViewedRows.filter((entry) => entry !== rowId)].slice(0, 30),
      }
    })
  }, [])

  const registerVisitedPage = React.useCallback((path: string) => {
    setState((prev) => {
      if (!path) return prev
      if (prev.recentlyVisitedPages[0] === path) return prev
      return {
        ...prev,
        recentlyVisitedPages: [path, ...prev.recentlyVisitedPages.filter((entry) => entry !== path)].slice(0, 15),
      }
    })
  }, [])

  const value = React.useMemo<AnalystWorkspaceValue>(
    () => ({
      state,
      setWorkingMode,
      setReviewMode,
      toggleRow: (rowId) =>
        setState((prev) => ({
          ...prev,
          savedRows: prev.savedRows.includes(rowId) ? prev.savedRows.filter((entry) => entry !== rowId) : [...prev.savedRows, rowId],
        })),
      isRowSaved: (rowId) => state.savedRows.includes(rowId),
      addExtract: (extract) =>
        setState((prev) => {
          if (prev.savedExtracts.some((entry) => entry.rowId === extract.rowId && entry.extractText === extract.extractText)) return prev
          return { ...prev, savedExtracts: [...prev.savedExtracts, extract] }
        }),
      removeExtract: (rowId, extractText) =>
        setState((prev) => ({ ...prev, savedExtracts: prev.savedExtracts.filter((entry) => !(entry.rowId === rowId && entry.extractText === extractText)) })),
      addQuestion: (question) =>
        setState((prev) => {
          if (prev.savedQuestions.some((entry) => entry.id === question.id)) return prev
          return { ...prev, savedQuestions: [...prev.savedQuestions, question] }
        }),
      removeQuestion: (id) => setState((prev) => ({ ...prev, savedQuestions: prev.savedQuestions.filter((entry) => entry.id !== id) })),
      addStatQuote: (entry) =>
        setState((prev) => {
          if (prev.savedStatsQuotes.some((item) => item.rowId === entry.rowId && item.text === entry.text)) return prev
          return { ...prev, savedStatsQuotes: [...prev.savedStatsQuotes, entry] }
        }),
      removeStatQuote: (rowId, text) =>
        setState((prev) => ({ ...prev, savedStatsQuotes: prev.savedStatsQuotes.filter((item) => !(item.rowId === rowId && item.text === text)) })),
      toggleGapPriority: (key) =>
        setState((prev) => ({
          ...prev,
          savedGapPriorities: prev.savedGapPriorities.includes(key)
            ? prev.savedGapPriorities.filter((entry) => entry !== key)
            : [...prev.savedGapPriorities, key],
        })),
      saveCohort: (cohort) =>
        setState((prev) => ({
          ...prev,
          savedCohorts: prev.savedCohorts.some((entry) => entry.id === cohort.id)
            ? prev.savedCohorts.map((entry) => (entry.id === cohort.id ? cohort : entry))
            : [...prev.savedCohorts, cohort],
        })),
      removeCohort: (id) => setState((prev) => ({ ...prev, savedCohorts: prev.savedCohorts.filter((entry) => entry.id !== id) })),
      registerRecentlyViewed,
      registerVisitedPage,
      clearAll: () => setState(defaultState),
    }),
    [state, setWorkingMode, setReviewMode, registerRecentlyViewed, registerVisitedPage],
  )

  return (
    <AnalystWorkspaceContext.Provider value={value}>
      {children}
    </AnalystWorkspaceContext.Provider>
  )
}

export function useAnalystWorkspace() {
  const context = React.useContext(AnalystWorkspaceContext)
  if (!context) throw new Error("useAnalystWorkspace must be used inside AnalystWorkspaceProvider")
  return context
}

export function WorkingModeToggle() {
  const { state, setWorkingMode, setReviewMode } = useAnalystWorkspace()
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
      <Button size="sm" variant={state.workingMode === "evidence" ? "default" : "ghost"} onClick={() => setWorkingMode("evidence")}>Evidence mode</Button>
      <Button size="sm" variant={state.workingMode === "gap" ? "default" : "ghost"} onClick={() => setWorkingMode("gap")}>Gap mode</Button>
      <Button size="sm" variant={state.workingMode === "opportunity" ? "default" : "ghost"} onClick={() => setWorkingMode("opportunity")}>Opportunity mode</Button>
      <Button size="sm" variant={state.reviewMode ? "default" : "outline"} onClick={() => setReviewMode(!state.reviewMode)}>
        {state.reviewMode ? "Review Mode" : "Analyst Mode"}
      </Button>
    </div>
  )
}

