import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/audience/quotes?audience=hcp|patient|caregiver|payer&limit=5
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const audience = (searchParams.get("audience") || "hcp").toLowerCase()
  const limit = Math.max(1, Math.min(20, Number(searchParams.get("limit") || 5)))

  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const weightExpr =
    audience === "patient"
      ? "Patient_w"
      : audience === "caregiver"
        ? "Caregiver_w"
        : audience === "payer"
          ? "Payer_w"
          : "HCP_w"

  const sql = `
    WITH base AS (
      SELECT
        CAST(combined_text_translated AS STRING) AS quote,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_DIVIDE(` +
    "`HCP_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`))   AS HCP_w,\n" +
    "        SAFE_DIVIDE(`Patient_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Patient_w,\n" +
    "        SAFE_DIVIDE(`Caregiver_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Caregiver_w,\n" +
    "        SAFE_DIVIDE(`Payer _ NHS Trust_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Payer_w,\n" +
    "        SAFE_CAST(likeCount AS INT64) AS likeCount, SAFE_CAST(replyCount AS INT64) AS replyCount, SAFE_CAST(retweetCount AS INT64) AS retweetCount, SAFE_CAST(viewCount AS INT64) AS viewCount\n" +
    `      FROM \`${posts}\`
    )
    SELECT
      quote,
      sentiment,
      (${weightExpr}) * (1 + likeCount + replyCount + retweetCount + SAFE_DIVIDE(viewCount, 1000)) AS score
    FROM base
    WHERE quote IS NOT NULL AND LENGTH(quote) BETWEEN 60 AND 420
    ORDER BY score DESC
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


