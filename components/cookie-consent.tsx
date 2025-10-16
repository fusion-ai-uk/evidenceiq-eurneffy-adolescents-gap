"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export type CookieCategory = keyof CookiePreferences

export const COOKIE_CONSENT_STORAGE_KEY = "evidenceiq-cookie-consent"

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}

export const COOKIE_CATEGORIES: Array<{
  id: CookieCategory
  name: string
  description: string
  required: boolean
  examples: string[]
}> = [
  {
    id: "necessary",
    name: "Strictly Necessary",
    description: "Essential for core functionality and secure access.",
    required: true,
    examples: [
      "evidenceiq_session: Session management (3 days)",
      "csrf-token: Security protection (session)",
      "evidenceiq-cookie-consent: Cookie preferences (12 months)",
    ],
  },
  {
    id: "functional",
    name: "Functional",
    description: "Remember preferences and settings to enhance UX.",
    required: false,
    examples: ["theme: Theme preference (12 months)"]
  },
  {
    id: "analytics",
    name: "Analytics & Performance",
    description: "Help us understand usage to improve the product.",
    required: false,
    examples: ["_ga: GA user id (2 years)"]
  },
  {
    id: "marketing",
    name: "Marketing & Personalization",
    description: "Personalized content and campaign effectiveness.",
    required: false,
    examples: ["_fbp: Facebook pixel (3 months)"]
  },
]

export function readStoredConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed === "object" && parsed &&
      ["necessary", "analytics", "marketing", "functional"].every((k) => k in parsed)
    ) {
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        functional: Boolean(parsed.functional),
      }
    }
    return null
  } catch {
    return null
  }
}

export function writeStoredConsent(prefs: CookiePreferences): void {
  if (typeof window === "undefined") return
  const normalized: CookiePreferences = {
    necessary: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    functional: Boolean(prefs.functional),
  }
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new StorageEvent("storage", { key: COOKIE_CONSENT_STORAGE_KEY }))
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [hasStoredValue, setHasStoredValue] = useState(false)

  useEffect(() => {
    const stored = readStoredConsent()
    if (stored) {
      setPreferences(stored)
      setHasStoredValue(true)
    } else {
      setPreferences(DEFAULT_PREFERENCES)
      setHasStoredValue(false)
    }
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_STORAGE_KEY) {
        const stored = readStoredConsent()
        if (stored) {
          setPreferences(stored)
          setHasStoredValue(true)
        } else {
          setPreferences(DEFAULT_PREFERENCES)
          setHasStoredValue(false)
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setCategory = useCallback((category: CookieCategory, enabled: boolean) => {
    if (category === "necessary") return
    setPreferences((prev) => {
      const next = { ...prev, [category]: enabled, necessary: true }
      writeStoredConsent(next)
      return next
    })
  }, [])

  const acceptAll = useCallback(() => {
    const next: CookiePreferences = { necessary: true, analytics: true, marketing: true, functional: true }
    setPreferences(next)
    setHasStoredValue(true)
    writeStoredConsent(next)
  }, [])

  const acceptNecessaryOnly = useCallback(() => {
    const next: CookiePreferences = { necessary: true, analytics: false, marketing: false, functional: false }
    setPreferences(next)
    setHasStoredValue(true)
    writeStoredConsent(next)
  }, [])

  const save = useCallback(() => {
    setHasStoredValue(true)
    writeStoredConsent(preferences)
  }, [preferences])

  const isCategoryEnabled = useCallback((category: CookieCategory) => {
    return category === "necessary" ? true : Boolean(preferences[category])
  }, [preferences])

  return { preferences, hasStoredValue, setCategory, acceptAll, acceptNecessaryOnly, save, isCategoryEnabled }
}

export function ConsentGate(props: { category: CookieCategory; children: React.ReactNode }) {
  const { isCategoryEnabled } = useCookieConsent()
  if (!isCategoryEnabled(props.category)) return null
  return <>{props.children}</>
}

export function CookieBanner() {
  const { preferences, hasStoredValue, setCategory, acceptAll, acceptNecessaryOnly, save } = useCookieConsent()
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    if (!hasStoredValue) {
      const t = setTimeout(() => setShowBanner(true), 600)
      return () => clearTimeout(t)
    }
  }, [hasStoredValue])

  const onSave = () => { save(); setShowPreferences(false); setShowBanner(false) }
  const onAcceptAll = () => { acceptAll(); setShowPreferences(false); setShowBanner(false) }
  const onAcceptNecessary = () => { acceptNecessaryOnly(); setShowPreferences(false); setShowBanner(false) }

  if (!showBanner) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-5xl rounded-xl border border-border/60 bg-card/90 backdrop-blur shadow-xl">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5">
          <div className="text-sm md:text-base font-medium">Cookie Settings</div>
          <div className="text-xs md:text-sm text-muted-foreground md:flex-1">
            We use cookies to provide secure access, remember preferences, and analyze performance. Choose which types to accept.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-background/40" onClick={() => setShowPreferences(true)}>Customize</Button>
            <Button variant="outline" size="sm" className="bg-background/40" onClick={onAcceptNecessary}>Essential Only</Button>
            <Button size="sm" onClick={onAcceptAll}>Accept All</Button>
          </div>
        </div>
        {showPreferences && (
          <div className="border-t border-border/60 p-4 md:p-5">
            <div className="mb-3 text-sm text-muted-foreground">Necessary cookies are required and cannot be disabled.</div>
            <div className="grid gap-3">
              {COOKIE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/40 p-3">
                  <div>
                    <div className="text-sm font-medium">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={cat.id === 'necessary' ? true : Boolean(preferences[cat.id])} onCheckedChange={(v) => setCategory(cat.id, v)} disabled={cat.required} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={onSave}>Save Preferences</Button>
              <Button variant="outline" className="bg-background/40" onClick={onAcceptAll}>Accept All</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CookiePreferencesButton(props: { label?: string }) {
  const { preferences, setCategory, save, acceptAll, acceptNecessaryOnly } = useCookieConsent()
  const [open, setOpen] = useState(false)
  const label = props.label ?? "Cookie Preferences"

  const onSave = () => { save(); setOpen(false) }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(true)}>{label}</Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border/60 bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Cookie Preferences</div>
              <Button variant="outline" size="sm" className="bg-background/40" onClick={() => setOpen(false)}>Close</Button>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-3">
              {COOKIE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                  <div>
                    <div className="text-sm font-medium">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.description}</div>
                  </div>
                  <Switch checked={cat.id === 'necessary' ? true : Boolean(preferences[cat.id])} onCheckedChange={(v) => setCategory(cat.id, v)} disabled={cat.required} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={onSave}>Save Preferences</Button>
              <Button variant="outline" className="bg-background/40" onClick={acceptAll}>Accept All</Button>
              <Button variant="outline" className="bg-background/40" onClick={acceptNecessaryOnly}>Essential Only</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function AnalyticsScriptsExample() {
  const { isCategoryEnabled } = useCookieConsent()
  const showAnalytics = isCategoryEnabled("analytics")
  const showMarketing = isCategoryEnabled("marketing")

  return (
    <>
      {showAnalytics ? (
        <script dangerouslySetInnerHTML={{ __html: `/* GA init here, gated by consent */` }} />
      ) : null}
      {showMarketing ? (
        <script dangerouslySetInnerHTML={{ __html: `/* Marketing pixel here, gated by consent */` }} />
      ) : null}
    </>
  )
}


