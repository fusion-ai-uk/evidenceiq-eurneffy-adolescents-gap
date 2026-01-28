import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

export async function GET(_req: Request) {
  if (!process.env.BQ_MAIN_TABLE) {
    return NextResponse.json({ error: "Missing env var BQ_MAIN_TABLE" }, { status: 500 })
  }

  const sql = `
    WITH parsed AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,
        relevance_label,
        COALESCE(SAFE_CAST(data_quality_keep_for_analysis AS BOOL), FALSE) AS keep_bool
      FROM \`${process.env.BQ_MAIN_TABLE}\`
      WHERE SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) IS NOT NULL
    )
    SELECT
      FORMAT_DATE('%Y-%m-%d', MIN(created_date)) AS minDateAll,
      FORMAT_DATE('%Y-%m-%d', MAX(created_date)) AS maxDateAll,
      COUNT(*) AS parsedPosts,
      COUNTIF(keep_bool) AS keepPosts,
      COUNTIF(keep_bool AND relevance_label IN ('high','medium')) AS keepHighMedium,
      COUNTIF(keep_bool AND relevance_label IN ('high','medium','low')) AS keepHighMediumLow
    FROM parsed
  `

  try {
    const rows = await runQuery<any>(sql, {})
    const r = rows?.[0] || {}
    return NextResponse.json({
      minDateAll: r.minDateAll || null,
      maxDateAll: r.maxDateAll || null,
      parsedPosts: Number(r.parsedPosts || 0),
      keepPosts: Number(r.keepPosts || 0),
      keepHighMedium: Number(r.keepHighMedium || 0),
      keepHighMediumLow: Number(r.keepHighMediumLow || 0),
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

