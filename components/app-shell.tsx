'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Moon, Sun, LayoutDashboard, TrendingUp, Users, Calendar, MessageSquare, MessageCircle, Target, Shuffle } from 'lucide-react'
import { useTheme } from 'next-themes'

type AppShellProps = {
  children: React.ReactNode
}

const nav: { name: string; href: string; icon: any; comingSoon?: boolean }[] = [
  { name: 'Executive Summary', href: '/dashboard', icon: LayoutDashboard },
  { name: 'General Themes', href: '/themes', icon: MessageCircle },
  { name: 'Trends Explorer', href: '/trends', icon: TrendingUp },
  { name: 'Audience Insights', href: '/audience', icon: Users },
  { name: 'Competitor Lens', href: '/competitors', icon: Target },
  { name: 'Sequencing & Pathways', href: '/sequencing', icon: Shuffle },
  { name: 'Events Tracker', href: '/events', icon: Calendar, comingSoon: true },
  { name: 'Content Recommendations', href: '/messaging', icon: MessageSquare, comingSoon: true },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
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
          <div className="hidden lg:block text-sm text-muted-foreground truncate">
            Alunbrig Marketing Intelligence
          </div>
          <div className="ml-auto flex items-center gap-2 pr-4 md:pr-6">
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Last Updated: Today
            </div>
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
            {nav.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return item.comingSoon ? (
                <div key={item.name} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/70 bg-muted/10 ring-1 ring-border/50 cursor-not-allowed">
                  <Icon className={cn("h-4 w-4 opacity-60", item.comingSoon ? "animate-pulse" : "")} />
                  <span className="truncate">{item.name}</span>
                </div>
              ) : (
                <Link key={item.name} href={item.href} className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  active ? 'bg-primary/15 text-primary ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground')}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
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



