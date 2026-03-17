'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Moon, Sun, LayoutDashboard, ShieldAlert, Search, Layers, Radar, FlaskConical, Calendar, CircleHelp, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type AppShellProps = {
  children: React.ReactNode
}

type SubNavItem = { id: string; label: string }
type NavItem = { name: string; href: string; icon: any; subNav?: SubNavItem[]; standout?: boolean }

const nav: NavItem[] = [
  {
    name: 'Messaging Recommendations',
    href: '/messaging-recommendations',
    icon: Sparkles,
    standout: true,
    subNav: [
      { id: 'messaging-hero', label: 'Strategic framing' },
      { id: 'messaging-hierarchy', label: 'Primary hierarchy' },
      { id: 'messaging-supporting', label: 'Supporting themes' },
      { id: 'messaging-watchouts', label: 'What not to overclaim' },
      { id: 'messaging-gaps', label: 'Evidence still needed' },
      { id: 'messaging-bottom-line', label: 'Bottom-line recommendation' },
    ],
  },
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    subNav: [
      { id: 'overview-kpis', label: 'Gap headline' },
      { id: 'overview-scores', label: 'Pillar and topic profile' },
      { id: 'overview-distributions', label: 'Evidence mix' },
      { id: 'overview-taxonomy', label: 'Top themes and gaps' },
    ],
  },
  {
    name: 'Pillars',
    href: '/pillars',
    icon: Layers,
    subNav: [
      { id: 'pillars-comparison', label: 'Pillar priorities' },
      { id: 'pillars-tags', label: 'Theme patterns' },
      { id: 'pillars-evidence', label: 'Key evidence' },
    ],
  },
  {
    name: 'Topic & Gap Explorer',
    href: '/topic-gap-explorer',
    icon: Search,
    subNav: [
      { id: 'topic-comparison', label: 'Topic priorities' },
      { id: 'topic-themes', label: 'What is missing' },
      { id: 'topic-questions', label: 'Questions to answer' },
      { id: 'topic-evidence', label: 'Evidence examples' },
    ],
  },
  {
    name: 'Barrier & Behaviour',
    href: '/barrier-behaviour-explorer',
    icon: Radar,
    subNav: [
      { id: 'barrier-overview', label: 'Barrier landscape' },
      { id: 'barrier-tags', label: 'Behavioural dynamics' },
      { id: 'barrier-cooccurrence', label: 'Where barriers combine' },
      { id: 'barrier-evidence', label: 'Evidence examples' },
    ],
  },
  {
    name: 'Dosing / Response / Risk',
    href: '/dosing-response-risk-settings',
    icon: ShieldAlert,
    subNav: [
      { id: 'dosing-kpis', label: 'Dosing transition gaps' },
      { id: 'response-kpis', label: 'Recognition-response gaps' },
      { id: 'settings-kpis', label: 'Settings of risk gaps' },
    ],
  },
  {
    name: 'EURneffy Opportunity',
    href: '/eurneffy-opportunity',
    icon: FlaskConical,
    subNav: [
      { id: 'opportunity-rankings', label: 'Opportunity themes' },
      { id: 'opportunity-families', label: 'Opportunity families' },
      { id: 'opportunity-questions', label: 'What needs validation' },
      { id: 'opportunity-evidence', label: 'Evidence examples' },
    ],
  },
  {
    name: 'Gap Prioritization',
    href: '/gap-prioritization',
    icon: ShieldAlert,
    subNav: [
      { id: 'gap-priority-table', label: 'Top gap priorities' },
      { id: 'gap-priority-clusters', label: 'Gap clusters' },
      { id: 'gap-priority-questions', label: 'Research questions' },
      { id: 'gap-priority-evidence', label: 'Supporting evidence' },
    ],
  },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const normalizedPath = React.useMemo(() => (pathname?.replace(/\/+$/, '') || '/'), [pathname])

  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      // If page is restored from bfcache, force fresh auth check via middleware.
      if (e.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const renderNavItem = React.useCallback((item: NavItem) => {
    const Icon = item.icon
    const active = normalizedPath === item.href || (item.href === '/overview' && normalizedPath === '/')

    return (
      <div key={item.name} className="space-y-1">
        <Link href={item.href} className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
          item.standout && !active
            ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 text-foreground ring-1 ring-indigo-400/30 hover:ring-indigo-300/45'
            : '',
          active
            ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground')}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate">{item.name}</span>
        </Link>
        {active && item.subNav && item.subNav.length > 0 ? (
          <div className="ml-4 flex flex-col gap-1 border-l border-border/50 pl-2">
            {item.subNav.map((sub) => (
              <Link
                key={sub.id}
                href={`${item.href}#${sub.id}`}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    )
  }, [normalizedPath])

  // Render bare content on public routes like /login
  if (pathname?.startsWith('/login')) {
    return (
      <div className="min-h-svh">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-gradient-to-r from-card/80 via-card/65 to-card/80 shadow-[0_1px_0_color-mix(in_oklch,var(--border)_75%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/45">
        <div className="h-16 flex items-center gap-4">
          {/* Brand anchored to top-left, above the sidebar */}
          <Link href="/" className="pl-4 md:pl-6 shrink-0 inline-flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring/50 outline-none">
            {!mounted ? (
              <img src="/new-evidenceiq-logo.png" alt="evidenceIQ" className="h-5 w-auto opacity-0" />
            ) : (
              <img
                key={resolvedTheme}
                src={resolvedTheme === 'dark' ? '/new-evidenceiq-logo.png' : '/new-evidenceiq-logo-grey.png'}
                alt="evidenceIQ"
                className="h-5 w-auto"
                suppressHydrationWarning
              />
            )}
            <span className="sr-only">evidenceIQ Home</span>
          </Link>
          <div className="hidden lg:block text-sm text-muted-foreground truncate">EURneffy Evidence Gap Analysis</div>
          <div className="ml-auto flex items-center gap-2 pr-4 md:pr-6">
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Last Updated: Today
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:inline-flex bg-background/40">
                  <CircleHelp className="mr-1.5 h-4 w-4" />
                  How to read
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[360px] text-sm leading-relaxed">
                This analysis is built from thousands of online anaphylaxis and wider allergy sources gathered globally,
                then narrowed to content potentially relevant to UK adolescent anaphylaxis. It shows what is already covered
                in that evidence base and what remains under-covered, so unresolved gaps can be identified quickly and reviewed
                in context.
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {!mounted ? (
                <Sun className="h-5 w-5 opacity-0" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/40"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'DELETE', cache: 'no-store' })
                } finally {
                  // replace() removes current protected page from immediate history slot.
                  window.location.replace('/login')
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Fixed sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-border/60 bg-gradient-to-b from-sidebar/95 via-sidebar/88 to-sidebar/82 shadow-[1px_0_0_color-mix(in_oklch,var(--border)_80%,transparent)] backdrop-blur">
        <nav className="h-full overflow-y-auto p-3 pb-24 relative">
          <div className="text-xs uppercase text-muted-foreground/80 px-2 py-2">Navigate</div>
          <div className="flex flex-col gap-1">
            {nav[0] ? renderNavItem(nav[0]) : null}
            <div className="mx-2 my-2 border-t border-border/60" />
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/65">Analysis Explorer</div>
            {nav.slice(1).map(renderNavItem)}
          </div>
          {/* Fusion logo pinned to bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
            <img src="/fusion%20logo.png" alt="Fusion" className="max-w-[42px] opacity-80 hover:opacity-100 transition" />
          </div>
        </nav>
      </aside>

      {/* Content area */}
      <main className="pt-16 pl-60">
        <Container size="lg" className="py-6">
          <div className="rounded-2xl border border-border/40 bg-card/20 p-3 shadow-[0_6px_24px_color-mix(in_oklch,var(--primary)_10%,transparent)] md:p-4">
            {children}
          </div>
        </Container>
      </main>

      {/* Copyright ribbon */}
      <footer className="fixed bottom-0 left-60 right-0 z-20 border-t border-border/60 bg-gradient-to-r from-card/80 via-card/65 to-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/50 text-[11px] text-muted-foreground px-4 md:px-6 py-1.5">
        <div className="flex items-center gap-3">
          <span>(c) {new Date().getFullYear()} evidenceIQ | All rights reserved</span>
          <span className="opacity-60">|</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  )
}



