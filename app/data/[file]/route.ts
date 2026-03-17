import fs from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

const ALLOWED = new Set(["enriched_rows.csv", "evidence_extracts.csv"])

export async function GET(_req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file: fileName } = await params
  if (!ALLOWED.has(fileName)) {
    return new Response("Not found", { status: 404 })
  }

  const filePath = path.join(process.cwd(), "data", fileName)
  try {
    const content = await fs.readFile(filePath, "utf8")
    return new Response(content, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "cache-control": "no-store",
      },
    })
  } catch {
    return new Response("Dataset file missing", { status: 404 })
  }
}

