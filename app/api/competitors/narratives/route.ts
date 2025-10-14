import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/narratives?limit=60
// Returns bigram tags per therapy/aspect with stance and confidence
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.max(20, Math.min(200, Number(searchParams.get("limit") || 60)))
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(COALESCE(Name,'')) AS name,
        LOWER(COALESCE(Topic, '')) AS topic,
        COALESCE(\`Topic Title\`, Topic) AS topic_title,
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment
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
        CASE
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(durabil|complete response|cr rate|pfs|os|long[- ]term|remission|survival|respon)') THEN "Efficacy"
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(crs|icans|infection|neutropenia|rash|photosensit|edema|capillary leak|toxicit)') THEN "Safety"
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(nice|eligibil|ifr|capacity|ward|bed|funding|inpatient|icu|step[- ]up|commission)') THEN "Access"
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(quality of life|qol|fatigue|daily|work|caregiver|burden|outpatient|convenien)') THEN "QoL"
          ELSE NULL
        END AS aspect,
        body, sentiment
      FROM base
      WHERE body IS NOT NULL
    ),
    tokens AS (
      SELECT therapy, aspect, REGEXP_EXTRACT_ALL(body, r'\\b[a-z]{3,}\\b') AS ws, sentiment
      FROM tagged
      WHERE therapy IS NOT NULL AND aspect IS NOT NULL
    ),
    bigrams AS (
      SELECT therapy, aspect,
        LOWER(CONCAT(ws[OFFSET(i)], ' ', ws[OFFSET(i+1)])) AS tag,
        AVG(sentiment) AS sbar,
        COUNT(*) AS n
      FROM tokens, UNNEST(GENERATE_ARRAY(0, ARRAY_LENGTH(ws)-2)) AS i
      GROUP BY therapy, aspect, tag
    ),
    scored AS (
      SELECT therapy, aspect, tag, n, sbar,
        (ABS(sbar) * LOG10(n+1)) AS confidence
      FROM bigrams
    )
    SELECT therapy, aspect, tag,
      n AS volume,
      CASE WHEN sbar > 0.05 THEN 'Positive' WHEN sbar < -0.05 THEN 'Negative' ELSE 'Mixed' END AS stance,
      ROUND(confidence, 3) AS confidence
    FROM scored
    WHERE n >= 8
    ORDER BY therapy, aspect, confidence DESC
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


