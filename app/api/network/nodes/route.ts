import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/network/nodes
// Returns entity nodes (mentions + sentiment + audience means)
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH entity_lexicon AS (
      SELECT 'Zynlonta' AS entity, 'Drug' AS type, r'(?i)\\bzynlonta\\b|\\bloncastuximab(?:\\s+tesirine)?\\b|\\blonca\\b' AS rx UNION ALL
      SELECT 'Epcoritamab','Drug', r'(?i)\\bepcoritamab\\b|\\bepkinly\\b|\\btepkinly\\b' UNION ALL
      SELECT 'Glofitamab','Drug', r'(?i)\\bglofitamab\\b|\\bcolumvi\\b' UNION ALL
      SELECT 'Polatuzumab','Drug', r'(?i)\\bpolatuzumab\\b|\\bpolivy\\b' UNION ALL
      SELECT 'CAR-T','Class', r'(?i)\\bcar[-\\s]?t\\b' UNION ALL
      SELECT 'Bispecifics','Class', r'(?i)\\bbispecifics?\\b|\\bcd20\\s*x\\s*cd3\\b|\\bt[- ]?cell engager(s)?\\b' UNION ALL
      SELECT 'ADC','Class', r'(?i)\\badc(s)?\\b|\\bantibody[-\\s]?drug conjugate(s)?\\b' UNION ALL
      SELECT 'DLBCL','Indication', r'(?i)\\bdlbcl\\b|\\bdiffuse large b-?cell lymphoma\\b|\\bhgbl\\b' UNION ALL
      SELECT 'NICE','Payer', r'(?i)\\bnice\\b' UNION ALL
      SELECT 'NHS','Payer', r'(?i)\\bnhs( england)?\\b' UNION ALL
      SELECT 'ASH','Event', r'(?i)\\bash\\b|\\bamerican society of hematology\\b' UNION ALL
      SELECT 'EHA','Event', r'(?i)\\beha\\b|\\beuropean hematology association\\b' UNION ALL
      SELECT 'LOTIS-2','Trial', r'(?i)\\blotis[-\\s]?2\\b' UNION ALL
      SELECT 'EPCORE NHL-1','Trial', r'(?i)\\bepcore nhl[-\\s]?1\\b' UNION ALL
      SELECT 'NP30179','Trial', r'(?i)\\bnp30179\\b' UNION ALL
      SELECT 'ZUMA-1','Trial', r'(?i)\\bzuma[-\\s]?1\\b' UNION ALL
      SELECT 'TRANSCEND NHL 001','Trial', r'(?i)\\btranscend nhl 001\\b'
    ),
    base AS (
      SELECT
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_CAST(HCP_score AS FLOAT64) AS HCP_score,
        SAFE_CAST(Patient_score AS FLOAT64) AS Patient_score,
        SAFE_CAST(Caregiver_score AS FLOAT64) AS Caregiver_score,
        SAFE_CAST(` + "`Payer _ NHS Trust_score`" + ` AS FLOAT64) AS Payer_score
      FROM \`` + posts + `\`
    ),
    hits AS (
      SELECT l.entity, l.type, b.*
      FROM base b
      JOIN entity_lexicon l ON REGEXP_CONTAINS(b.body, l.rx)
    )
    SELECT entity, ANY_VALUE(type) AS type,
      COUNT(1) AS mentions,
      AVG(sentiment) AS avg_sentiment,
      AVG(HCP_score) AS hcp_mean,
      AVG(Patient_score) AS patient_mean,
      AVG(Caregiver_score) AS caregiver_mean,
      AVG(Payer_score) AS payer_mean
    FROM hits
    GROUP BY entity
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


