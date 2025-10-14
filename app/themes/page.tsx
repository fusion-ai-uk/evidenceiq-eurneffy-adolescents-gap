import { ThemeExplorerViz } from "@/components/trends/theme-explorer-viz"

export default function ThemesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>General Themes</h1>
        <p className="lead">
          Interactive exploration of themes across audiences, timeframes, and geographies.
        </p>
      </div>

      <ThemeExplorerViz />
    </div>
  )
}


