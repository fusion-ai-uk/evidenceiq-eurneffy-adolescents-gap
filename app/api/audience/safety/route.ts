import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/audience/safety
// Returns keyword-level counts and audience-weighted sentiment within safety category
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(TRIM(Category)) AS category,
        LOWER(CAST(combined_text_translated AS STRING)) AS text,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_DIVIDE(` +
    "`HCP_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`))   AS HCP_w,\n" +
    "        SAFE_DIVIDE(`Patient_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Patient_w,\n" +
    "        SAFE_DIVIDE(`Caregiver_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Caregiver_w,\n" +
    "        SAFE_DIVIDE(`Payer _ NHS Trust_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Payer_w\n" +
    `      FROM \`${posts}\`
      WHERE Category = 'treatmentthemes_safety'
    )
    SELECT
      k AS keyword,
      COUNTIF(REGEXP_CONTAINS(text, k)) AS mentions,
      SAFE_DIVIDE(SUM(IF(REGEXP_CONTAINS(text, k), sentiment * HCP_w, 0.0)), NULLIF(SUM(IF(REGEXP_CONTAINS(text, k), HCP_w, 0.0)),0)) AS hcp_sentiment,
      SAFE_DIVIDE(SUM(IF(REGEXP_CONTAINS(text, k), sentiment * Patient_w, 0.0)), NULLIF(SUM(IF(REGEXP_CONTAINS(text, k), Patient_w, 0.0)),0)) AS patient_sentiment,
      SAFE_DIVIDE(SUM(IF(REGEXP_CONTAINS(text, k), sentiment * Caregiver_w, 0.0)), NULLIF(SUM(IF(REGEXP_CONTAINS(text, k), Caregiver_w, 0.0)),0)) AS caregiver_sentiment,
      SAFE_DIVIDE(SUM(IF(REGEXP_CONTAINS(text, k), sentiment * Payer_w, 0.0)), NULLIF(SUM(IF(REGEXP_CONTAINS(text, k), Payer_w, 0.0)),0)) AS payer_sentiment
    FROM base, UNNEST([r"crs", r"icans", r"infection", r"rash", r"photosens"]) AS k
    GROUP BY keyword
    ORDER BY mentions DESC
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


