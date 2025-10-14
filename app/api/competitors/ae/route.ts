import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/competitors/ae
// Returns AE theme split with PSI per therapy
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
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment
      FROM \`${posts}\`
    ),
    therapy_map AS (
      SELECT
        CASE
          WHEN REGEXP_CONTAINS(name, r'(epcor|epkinly)') OR REGEXP_CONTAINS(body, r'(epcoritamab|epkinly|tepkinly)') THEN "Epcoritamab"
          WHEN REGEXP_CONTAINS(name, r'(glofit|columvi)') OR REGEXP_CONTAINS(body, r'(glofitamab|columvi)') THEN "Glofitamab"
          WHEN REGEXP_CONTAINS(name, r'(zynlonta|loncastux|lonca)') OR REGEXP_CONTAINS(body, r'(zynlonta|loncastux)') THEN "Zynlonta"
          WHEN REGEXP_CONTAINS(body, r'\\bcar[- ]?t\\b|axi[- ]?cel|kymriah|lisocel|yescarta') THEN "CAR-T"
          ELSE NULL
        END AS therapy,
        body,
        (0.5*HCP_score + 0.3*Patient_score + 0.1*Caregiver_score + 0.1*Payer_score) AS w,
        sentiment
      FROM base
    ),
    ae AS (
      SELECT therapy,
        CASE
          WHEN REGEXP_CONTAINS(body, r'(photosensit|light[- ]sens|rash|dermatolog)') THEN 'Photosensitivity/Rash'
          WHEN REGEXP_CONTAINS(body, r'(edema|effusion|fluid retention|capillary leak)') THEN 'Edema/CLS'
          WHEN REGEXP_CONTAINS(body, r'(crs|cytokine release)') THEN 'CRS'
          WHEN REGEXP_CONTAINS(body, r'(icans|neurotox)') THEN 'ICANS'
          WHEN REGEXP_CONTAINS(body, r'(infection|sepsis)') THEN 'Infections'
          WHEN REGEXP_CONTAINS(body, r'(inpatient|step[- ]up|icu)') THEN 'Inpatient/Monitoring'
          ELSE NULL
        END AS ae_theme,
        w, sentiment
      FROM therapy_map
      WHERE therapy IS NOT NULL
    )
    SELECT therapy, ae_theme,
      SUM(w) AS mentions_w,
      ROUND(100*((SUM(CASE WHEN sentiment>0.05 THEN w ELSE 0 END) - SUM(CASE WHEN sentiment<-0.05 THEN w ELSE 0 END))/NULLIF(SUM(w),0) + 1)/2, 1) AS psi
    FROM ae
    WHERE ae_theme IS NOT NULL
    GROUP BY therapy, ae_theme
    ORDER BY therapy, mentions_w DESC
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


