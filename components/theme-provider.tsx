// Replace the entire file with a simpler theme provider that doesn't rely on next-themes

"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, defaultTheme = "dark", ...props }: ThemeProviderProps) {
  // Since we're always using dark theme for this app, we can simplify this component
  React.useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  return <>{children}</>
}
