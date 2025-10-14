import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/sentiment
// Returns Positive Sentiment Index (0-100) by therapy x aspect
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH base AS (
      SELECT
        LOWER(COALESCE(Name,'')) AS name,
        LOWER(COALESCE(Topic, '')) AS topic,
        COALESCE(` +
    "`Topic Title`, Topic) AS topic_title,\n" +
    "        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,\n" +
    "        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment, HCP_score, Patient_score, Caregiver_score, \`Payer _ NHS Trust_score\` AS payer_score, createdAt\n" +
    `      FROM \`${posts}\`
    ),
    tagged AS (
      SELECT
        CASE
          WHEN REGEXP_CONTAINS(name, r'(epcor|epkinly)') OR REGEXP_CONTAINS(body, r'(epcoritamab|epkinly|tepkinly)') THEN 'Epcoritamab'
          WHEN REGEXP_CONTAINS(name, r'(glofit|columvi)') OR REGEXP_CONTAINS(body, r'(glofitamab|columvi)') THEN 'Glofitamab'
          WHEN REGEXP_CONTAINS(name, r'(zynlonta|loncastux|lonca)') OR REGEXP_CONTAINS(body, r'(zynlonta|loncastux)') THEN 'Zynlonta'
          WHEN REGEXP_CONTAINS(body, r'\bcar[- ]?t\b|axi[- ]?cel|kymriah|lisocel|yescarta') THEN 'CAR-T'
          ELSE NULL
        END AS therapy,
        CASE
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(durabil|complete response|cr rate|pfs|os|long[- ]term|remission|survival|respon)') THEN 'Efficacy'
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(crs|icans|infection|neutropenia|rash|photosensit|edema|capillary leak|toxicit)') THEN 'Safety'
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(nice|eligibil|ifr|capacity|ward|bed|funding|inpatient|icu|step[- ]up|commission)') THEN 'Access'
          WHEN REGEXP_CONTAINS(LOWER(COALESCE(topic_title,'')) || ' ' || body, r'(quality of life|qol|fatigue|daily|work|caregiver|burden|outpatient|convenien)') THEN 'QoL'
          ELSE NULL
        END AS aspect,
        sentiment, HCP_score, Patient_score, Caregiver_score, payer_score
      FROM base
    ),
    weighted AS (
      SELECT therapy, aspect,
        (0.5*HCP_score + 0.3*Patient_score + 0.1*Caregiver_score + 0.1*payer_score) AS weight_value,
        sentiment
      FROM tagged
      WHERE therapy IS NOT NULL AND aspect IS NOT NULL
    ),
    agg AS (
      SELECT therapy, aspect,
        SUM(CASE WHEN sentiment >  0.05 THEN weight_value ELSE 0.0 END) / NULLIF(SUM(weight_value),0) AS p_pos,
        SUM(CASE WHEN sentiment < -0.05 THEN weight_value ELSE 0.0 END) / NULLIF(SUM(weight_value),0) AS p_neg
      FROM weighted GROUP BY therapy, aspect
    )
    SELECT therapy, aspect, ROUND(100 * ((p_pos - p_neg + 1)/2), 1) AS psi_0_100
    FROM agg
    ORDER BY aspect, therapy
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


