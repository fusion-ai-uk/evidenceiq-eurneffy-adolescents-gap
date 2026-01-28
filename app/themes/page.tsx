import { GeneralThemesExplorer } from "@/components/alunbrig/themes/GeneralThemesExplorer"
import { Card, CardContent } from "@/components/ui/card"

export default function ThemesPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl supports-[backdrop-filter]:bg-card/40 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary/10 to-transparent" />
        <CardContent className="py-6 relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">General Themes</h1>
              <div className="text-xs text-muted-foreground">Click any tile/row/point to open example posts</div>
            </div>
            <p className="lead">Interactive exploration of themes across audiences, timeframes, and contexts.</p>
          </div>
        </CardContent>
      </Card>

      <GeneralThemesExplorer />
    </div>
  )
}
