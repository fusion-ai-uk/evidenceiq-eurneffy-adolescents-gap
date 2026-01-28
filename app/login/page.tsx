"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Login failed" }))
        throw new Error(data?.message || "Invalid credentials")
      }
      toast.success("Welcome back âœ¨")
      const from = searchParams.get('from') || '/dashboard'
      const isSafe = typeof from === 'string' && from.startsWith('/') && !from.startsWith('/login') && !/\.[a-zA-Z0-9]+$/.test(from)
      router.replace(isSafe ? from : '/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Suspense fallback={null}>
    <div className="relative min-h-svh w-full overflow-hidden flex items-center">
      {/* Theme toggle */}
      <div className="absolute right-3 top-3 md:right-6 md:top-6 z-10">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="bg-background/40"
        >
          {!mounted ? (
            <Sun className="h-5 w-5 opacity-0" />
          ) : resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -inset-[20%] bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(50%_40%_at_10%_100%,hsl(var(--muted-foreground)/0.15),transparent_60%),radial-gradient(50%_40%_at_90%_100%,hsl(var(--accent)/0.18),transparent_60%)] blur-2xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-10 md:flex-row md:gap-14 md:py-16">
        {/* Left: Brand + Headline */}
        <div className="flex max-w-xl flex-col items-center gap-6 text-center md:items-start md:text-left">
          <div className="flex items-center gap-3 opacity-90">
            {!mounted ? (
              <img src="/new-evidenceiq-logo.png" alt="evidenceIQ" className="h-8 w-auto opacity-0" />
            ) : (
              <img
                key={resolvedTheme}
                src={resolvedTheme === 'dark' ? '/new-evidenceiq-logo.png' : '/new-evidenceiq-logo-grey.png'}
                alt="evidenceIQ"
                className="h-8 w-auto"
                suppressHydrationWarning
              />
            )}
            <span className="text-sm text-muted-foreground">Alunbrig Intelligence</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Sign in to your intelligence workspace
          </h1>
          <p className="max-w-prose text-balance text-muted-foreground">
            Access executive insights, competitor signals, and audience narratives - all in one place.
          </p>
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground/90">
            <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
            Secure, cookie-based session. No third-party redirects.
          </div>
        </div>

        {/* Right: Login Card */}
        <Card className="mt-10 w-full max-w-md border-border/60 bg-card/60 p-6 shadow-xl backdrop-blur-xl md:mt-0">
          <div className="mb-6">
            <h2 className="text-xl font-medium">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your credentials to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@evidenceiq.io"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400">Caps Lock is on</div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={loading || !email || !password} className="group mt-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            
            <div className="sr-only" aria-live="polite">{capsLockOn ? 'Caps Lock is on' : ' '}</div>
          </form>
        </Card>
      </div>

      {/* Powered by Fusion badge */}
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex items-center justify-center">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <img src="/fusion%20logo.png" alt="Fusion" className="h-4 w-auto" />
          <span>Powered by Fusion</span>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
    </Suspense>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}



