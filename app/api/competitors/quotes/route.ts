import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/quotes?audience=hcp&limit=12
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const audience = (searchParams.get("audience") || "hcp").toLowerCase()
  const limit = Math.max(4, Math.min(24, Number(searchParams.get("limit") || 12)))
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const weight = audience === "patient" ? "Patient_score" : audience === "caregiver" ? "Caregiver_score" : audience === "payer" ? "`Payer _ NHS Trust_score`" : "HCP_score"

  const sql = `
    SELECT
      SUBSTR(REGEXP_REPLACE(LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))), r'\s+', ' '), 1, 240) || '…' AS snippet,
      SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
      SAFE_CAST(retweetCount AS INT64) + SAFE_CAST(replyCount AS INT64) + SAFE_CAST(likeCount AS INT64) + SAFE_CAST(viewCount AS INT64)/100 AS engagement,
      SAFE_CAST(${weight} AS FLOAT64) AS w
    FROM \`${posts}\`
    ORDER BY (engagement * w) DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery(sql, { limit })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


