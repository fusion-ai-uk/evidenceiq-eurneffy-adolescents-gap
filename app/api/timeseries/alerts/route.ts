import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/timeseries/alerts
// Computes latest month vs prior 6-month baseline by category, returns top deltas
// Query params:
// - minBaseline: minimum baseline volume to include (default 10)
// - limit: max rows (default 10)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const table = process.env.TIMESERIES_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_data_time_series"

  const minBaseline = Math.max(0, Number(searchParams.get("minBaseline") || 10))
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 10)))

  const sql = `
    WITH base AS (
      SELECT
        DATE_TRUNC(createdAt, MONTH) AS month,
        LOWER(TRIM(Category)) AS category
      FROM \`${table}\`
      WHERE Category IS NOT NULL AND createdAt IS NOT NULL
    ),
    monthly AS (
      SELECT month, category, COUNT(1) AS volume
      FROM base
      GROUP BY month, category
    ),
    latest AS (
      SELECT MAX(month) AS m_latest FROM monthly
    ),
    baseline AS (
      SELECT m.category, AVG(m.volume) AS baseline_volume
      FROM monthly m, latest l
      WHERE m.month < l.m_latest
        AND m.month >= DATE_SUB(l.m_latest, INTERVAL 6 MONTH)
      GROUP BY m.category
    ),
    current_month AS (
      SELECT m.category, SUM(m.volume) AS current_volume
      FROM monthly m, latest l
      WHERE m.month = l.m_latest
      GROUP BY m.category
    )
    SELECT
      c.category,
      c.current_volume,
      b.baseline_volume,
      SAFE_DIVIDE(c.current_volume - b.baseline_volume, b.baseline_volume) * 100 AS pct_change
    FROM current_month c
    JOIN baseline b USING (category)
    WHERE b.baseline_volume >= @minBaseline
    ORDER BY pct_change DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery<{ category: string; current_volume: number; baseline_volume: number; pct_change: number }[]>(sql, {
      minBaseline,
      limit,
    })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


