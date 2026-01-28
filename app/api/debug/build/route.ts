import fs from "node:fs"
import path from "node:path"

export const runtime = "nodejs"

export async function GET() {
  const cwd = process.cwd()
  const themePagePath = path.join(cwd, "app", "themes", "page.tsx")

  let themePageExists = false
  let themePageMtimeMs: number | null = null
  let themePageHasGradient = false
  let themePageFirstLines: string[] = []

  try {
    themePageExists = fs.existsSync(themePagePath)
    if (themePageExists) {
      const stat = fs.statSync(themePagePath)
      themePageMtimeMs = stat.mtimeMs
      const raw = fs.readFileSync(themePagePath, "utf8")
      themePageHasGradient = raw.includes("bg-gradient-to-r") || raw.includes("from-primary/50")
      themePageFirstLines = raw.split(/\r?\n/).slice(0, 8)
    }
  } catch {
    // ignore
  }

  return Response.json({
    cwd,
    node: process.version,
    themePagePath,
    themePageExists,
    themePageMtimeMs,
    themePageHasGradient,
    themePageFirstLines,
    ts: new Date().toISOString(),
  })
}
