import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieBanner, AnalyticsScriptsExample } from "@/components/cookie-consent"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const geistSans = GeistSans

const geistMono = GeistMono

export const metadata = {
  title: "evidenceIQ - Zynlonta Intelligence Platform",
  description: "Pharmaceutical intelligence dashboard for Zynlonta treatment discourse analysis",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppShell>
            {children}
          </AppShell>
          <AnalyticsScriptsExample />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
