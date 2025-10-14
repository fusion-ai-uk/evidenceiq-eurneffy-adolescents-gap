import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/durability
// Returns monthly HCP-weighted durability mentions per therapy
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(COALESCE(Name,'')) AS name,
        LOWER(COALESCE(Topic, '')) AS topic,
        COALESCE(\`Topic Title\`, Topic) AS topic_title,
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(HCP_score AS FLOAT64) AS HCP_score,
        SAFE_CAST(Patient_score AS FLOAT64) AS Patient_score,
        SAFE_CAST(Caregiver_score AS FLOAT64) AS Caregiver_score,
        SAFE_CAST(\`Payer _ NHS Trust_score\` AS FLOAT64) AS Payer_score,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        COALESCE(
          SAFE.PARSE_DATE('%Y-%m-%d', SUBSTR(CAST(createdAt AS STRING), 1, 10)),
          SAFE.PARSE_DATE('%d/%m/%Y', CAST(createdAt AS STRING))
        ) AS created_date
      FROM \`${posts}\`
    ),
    tagged AS (
      SELECT
        CASE
          WHEN REGEXP_CONTAINS(name, r'(epcor|epkinly)') OR REGEXP_CONTAINS(body, r'(epcoritamab|epkinly|tepkinly)') THEN "Epcoritamab"
          WHEN REGEXP_CONTAINS(name, r'(glofit|columvi)') OR REGEXP_CONTAINS(body, r'(glofitamab|columvi)') THEN "Glofitamab"
          WHEN REGEXP_CONTAINS(name, r'(zynlonta|loncastux|lonca)') OR REGEXP_CONTAINS(body, r'(zynlonta|loncastux)') THEN "Zynlonta"
          WHEN REGEXP_CONTAINS(body, r'\\bcar[- ]?t\\b|axi[- ]?cel|kymriah|lisocel|yescarta') THEN "CAR-T"
          ELSE NULL
        END AS therapy,
        DATE_TRUNC(created_date, MONTH) AS ym,
        (0.5*HCP_score + 0.3*Patient_score + 0.1*Caregiver_score + 0.1*Payer_score) AS w,
        sentiment,
        REGEXP_CONTAINS(body, r'(durabil|long[- ]term|cr rate|complete response|pfs|os|remission)') AS is_durability
      FROM base
    )
    SELECT FORMAT_DATE('%Y-%m-01', ym) AS ym, therapy,
      SUM(CASE WHEN is_durability THEN w ELSE 0 END) AS durability_weighted_mentions,
      AVG(CASE WHEN is_durability THEN sentiment END) AS avg_sent
    FROM tagged
    WHERE therapy IS NOT NULL
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


