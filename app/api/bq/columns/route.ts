import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/bq/columns?project=fusion-424109&dataset=evidenceiq_zynlonta&table=topic_data_time_series
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const project = searchParams.get("project") || "fusion-424109"
  const dataset = searchParams.get("dataset") || "evidenceiq_zynlonta"
  const table = searchParams.get("table") || "topic_data_time_series"

  const sql = `
    SELECT column_name, data_type, ordinal_position
    FROM \`${project}.${dataset}.INFORMATION_SCHEMA.COLUMNS\`
    WHERE table_name = @table
    ORDER BY ordinal_position
  `
  try {
    const rows = await runQuery<{ column_name: string; data_type: string; ordinal_position: number }[]>(sql, { table })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "BigQuery error" }, { status: 500 })
  }
}


