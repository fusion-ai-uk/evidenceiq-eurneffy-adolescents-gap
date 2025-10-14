import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/network/variants
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body
      FROM \`${posts}\`
    ),
    variants AS (
      SELECT 'Zynlonta' AS variant, r'(?i)\\bzynlonta\\b' AS rx, 'Correct' AS status UNION ALL
      SELECT 'loncastuximab tesirine', r'(?i)\\bloncastuximab\\s+tesirine\\b', 'Correct' UNION ALL
      SELECT 'loncastuximab', r'(?i)\\bloncastuximab\\b', 'Correct' UNION ALL
      SELECT 'lonca', r'(?i)\\blonca\\b', 'Correct' UNION ALL
      SELECT 'long car', r'(?i)\\blong\\s*car\\b', 'Misspelling' UNION ALL
      SELECT 'long tux', r'(?i)\\blong\\s*tux\\b', 'Misspelling' UNION ALL
      SELECT 'long colour/color', r'(?i)\\blong\\s*colou?r\\b', 'Misspelling'
    )
    SELECT v.variant, COUNTIF(REGEXP_CONTAINS(b.body, v.rx)) AS count, v.status
    FROM variants v CROSS JOIN base b
    GROUP BY variant, status
    ORDER BY count DESC
  `

  try {
    const rows = await runQuery(sql)
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


