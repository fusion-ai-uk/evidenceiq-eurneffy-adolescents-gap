"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Command, Moon, Sun } from "lucide-react"
import { CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"

export function TopBar() {
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-20 border-b border-border/60 bg-card/60 backdrop-blur-xl supports-[backdrop-filter]:bg-card/40">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-6">
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
          <div className="hidden md:block text-sm text-muted-foreground">Zynlonta Marketing Intelligence</div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/40"
            onClick={() => setOpen(true)}
            title="Search (Ctrl/Cmd K)"
          >
            <Command className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {/* Render a deterministic placeholder on server to avoid hydration mismatch */}
            {!mounted ? (
              <Sun className="h-5 w-5 opacity-0" />
            ) : resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex bg-background/40">
            <Calendar className="mr-2 h-4 w-4" />
            Last Updated: Today
          </Button>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages and actions..." />
        <CommandList>
          <CommandGroup heading="Navigate">
            <CommandItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/themes">General Themes</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/trends">Trends Explorer</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/audience">Audience Insights</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/competitors">Competitor Lens</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/network">Entity Network</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/events">Events Tracker</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/messaging">Content Recommendations</Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href="/settings">Settings</Link>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Appearance">
            <CommandItem onSelect={() => setTheme('light')}>Light mode</CommandItem>
            <CommandItem onSelect={() => setTheme('dark')}>Dark mode</CommandItem>
            <CommandItem onSelect={() => setTheme('system')}>System</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
