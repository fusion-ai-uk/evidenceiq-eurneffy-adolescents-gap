import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/payer
// Returns monthly policy/capacity hits per therapy with stance
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(COALESCE(Name,'')) AS name,
        LOWER(COALESCE(Topic, '')) AS topic,
        COALESCE(\`Topic Title\`, Topic) AS topic_title,
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        DATE_TRUNC(DATE(createdAt), MONTH) AS ym
      FROM \`${posts}\`
    ),
    therapy AS (
      SELECT
        CASE
          WHEN REGEXP_CONTAINS(name, r'(epcor|epkinly)') OR REGEXP_CONTAINS(body, r'(epcoritamab|epkinly|tepkinly)') THEN "Epcoritamab"
          WHEN REGEXP_CONTAINS(name, r'(glofit|columvi)') OR REGEXP_CONTAINS(body, r'(glofitamab|columvi)') THEN "Glofitamab"
          WHEN REGEXP_CONTAINS(name, r'(zynlonta|loncastux|lonca)') OR REGEXP_CONTAINS(body, r'(zynlonta|loncastux)') THEN "Zynlonta"
          WHEN REGEXP_CONTAINS(body, r'\\bcar[- ]?t\\b|axi[- ]?cel|kymriah|lisocel|yescarta') THEN "CAR-T"
          ELSE NULL
        END AS therapy,
        ym, body, sentiment
      FROM base
    )
    SELECT ym, therapy,
      SUM(CASE WHEN REGEXP_CONTAINS(body, r'(nice|ta947|eligibil|ifr|commission|prior authori[sz]ation)') THEN 1 ELSE 0 END) AS policy_hits,
      SUM(CASE WHEN REGEXP_CONTAINS(body, r'(capacity|bed|ward|nurse|staff|slot|ic[u]|inpatient)') THEN 1 ELSE 0 END) AS capacity_hits,
      AVG(sentiment) AS avg_sent
    FROM therapy
    WHERE therapy IS NOT NULL AND REGEXP_CONTAINS(body, r'(nhs|nice|trust|uk)')
    GROUP BY ym, therapy
    ORDER BY ym, therapy
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


