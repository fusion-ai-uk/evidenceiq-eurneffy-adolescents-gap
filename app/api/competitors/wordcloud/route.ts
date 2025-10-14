import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/wordcloud?therapy=zynlonta|epcoritamab|glofitamab|car-t&limit=200
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const therapy = (searchParams.get("therapy") || "zynlonta").toLowerCase()
  const limit = Math.max(50, Math.min(300, Number(searchParams.get("limit") || 200)))
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(COALESCE(Name, '')) AS name,
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment
      FROM \`${posts}\`
    ),
    tagged AS (
      SELECT
        CASE
          WHEN REGEXP_CONTAINS(name, r'(epcor|epkinly)') OR REGEXP_CONTAINS(body, r'(epcoritamab|epkinly|tepkinly)') THEN 'epcoritamab'
          WHEN REGEXP_CONTAINS(name, r'(glofit|columvi)') OR REGEXP_CONTAINS(body, r'(glofitamab|columvi)') THEN 'glofitamab'
          WHEN REGEXP_CONTAINS(name, r'(zynlonta|loncastux|lonca)') OR REGEXP_CONTAINS(body, r'(zynlonta|loncastux)') THEN 'zynlonta'
          WHEN REGEXP_CONTAINS(body, r'\\bcar[- ]?t\\b|axi[- ]?cel|kymriah|lisocel|yescarta') THEN 'car-t'
          ELSE NULL
        END AS therapy,
        body, sentiment
      FROM base
    ),
    tokens AS (
      SELECT REGEXP_EXTRACT_ALL(body, r'\\b[a-z]{3,}\\b') AS toks, sentiment
      FROM tagged
      WHERE therapy = @therapy
    ),
    flat AS (
      SELECT tok AS term, COUNT(*) AS n, AVG(sentiment) AS mean_sent
      FROM tokens, UNNEST(toks) AS tok
      WHERE tok NOT IN UNNEST(['https','http','www','com','and','with','from','that','have','this','about','into','after','the','for','you','your','our','they','them','are','was','were','has','had','will'])
      GROUP BY term
    )
    SELECT term, n, mean_sent
    FROM flat
    ORDER BY n DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery<{ term: string; n: number; mean_sent: number }[]>(sql, { therapy, limit })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


