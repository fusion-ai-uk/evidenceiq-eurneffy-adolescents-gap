import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/kpi
// Returns share of voice, aspect balance, and net stance per therapy
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
        SAFE_CAST(retweetCount AS INT64) + SAFE_CAST(replyCount AS INT64) + SAFE_CAST(likeCount AS INT64) + SAFE_CAST(viewCount AS INT64)/100 AS engagement
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
        engagement, sentiment
      FROM base
    )
    SELECT therapy,
      SUM(engagement) AS eng_sum,
      SAFE_DIVIDE(SUM(engagement * IF(aspect='Efficacy',1,0)), SUM(engagement)) AS eff_share,
      SAFE_DIVIDE(SUM(engagement * IF(aspect='Safety',1,0)), SUM(engagement)) AS saf_share,
      SAFE_DIVIDE(SUM(engagement * IF(aspect='Access',1,0)), SUM(engagement)) AS acc_share,
      SAFE_DIVIDE(SUM(engagement * IF(aspect='QoL',1,0)), SUM(engagement)) AS qol_share,
      AVG(sentiment) AS net_stance
    FROM tagged
    WHERE therapy IS NOT NULL AND aspect IS NOT NULL
    GROUP BY therapy
    ORDER BY eng_sum DESC
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


