import fs from "node:fs"
import path from "node:path"

export const runtime = "nodejs"

export async function GET() {
  const cwd = process.cwd()
  const targets = [
    path.join(cwd, "components", "alunbrig", "themes", "GeneralThemesExplorer.tsx"),
    path.join(cwd, "components", "alunbrig", "filters", "FilterPane.tsx"),
    path.join(cwd, "components", "alunbrig", "filters", "MultiSelect.tsx"),
    path.join(cwd, "components", "alunbrig", "filters", "ActiveFiltersBar.tsx"),
  ]

  const files = targets.map((p) => {
    try {
      const exists = fs.existsSync(p)
      if (!exists) return { path: p, exists: false }
      const stat = fs.statSync(p)
      const raw = fs.readFileSync(p, "utf8")
      const head = raw.split(/\r?\n/).slice(0, 12)
      return {
        path: p,
        exists: true,
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        hasFilterPane: raw.includes("FilterPane"),
        hasMultiSelect: raw.includes("MultiSelect"),
        hasActiveFiltersBar: raw.includes("ActiveFiltersBar"),
        head,
      }
    } catch (e) {
      return { path: p, error: String((e as any)?.message || e) }
    }
  })

  return Response.json({ cwd, ts: new Date().toISOString(), files })
}
