import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/audience/topics
// Returns topic leaderboard joined to summary with audience-weighted volumes and sentiments
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"
  const summary = process.env.TOPIC_SUMMARY_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_summary"

  const sql = `
    WITH base AS (
      SELECT
        \`Topic Title\` AS topic_title,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_DIVIDE(\`HCP_score\`, (\`HCP_score\`+\`Patient_score\`+\`Caregiver_score\`+\`Payer _ NHS Trust_score\`))   AS HCP_w,
        SAFE_DIVIDE(\`Patient_score\`, (\`HCP_score\`+\`Patient_score\`+\`Caregiver_score\`+\`Payer _ NHS Trust_score\`)) AS Patient_w,
        SAFE_DIVIDE(\`Caregiver_score\`, (\`HCP_score\`+\`Patient_score\`+\`Caregiver_score\`+\`Payer _ NHS Trust_score\`)) AS Caregiver_w,
        SAFE_DIVIDE(\`Payer _ NHS Trust_score\`, (\`HCP_score\`+\`Patient_score\`+\`Caregiver_score\`+\`Payer _ NHS Trust_score\`)) AS Payer_w
      FROM \`${posts}\`
    ),
    topic AS (
      SELECT
        topic_title,
        COUNT(*) AS posts,
        SUM(HCP_w)       AS hcp_volume,
        SUM(Patient_w)   AS patient_volume,
        SUM(Caregiver_w) AS caregiver_volume,
        SUM(Payer_w)     AS payer_volume,
        SAFE_DIVIDE(SUM(sentiment * HCP_w),       NULLIF(SUM(HCP_w),0))       AS hcp_sentiment,
        SAFE_DIVIDE(SUM(sentiment * Patient_w),   NULLIF(SUM(Patient_w),0))   AS patient_sentiment,
        SAFE_DIVIDE(SUM(sentiment * Caregiver_w), NULLIF(SUM(Caregiver_w),0)) AS caregiver_sentiment,
        SAFE_DIVIDE(SUM(sentiment * Payer_w),     NULLIF(SUM(Payer_w),0))     AS payer_sentiment
      FROM base
      GROUP BY topic_title
    )
    SELECT
      t.*, s.\`Topic Summary\` AS topic_summary, s.Category, s.\`Group\` AS topic_group
    FROM topic t
    LEFT JOIN \`${summary}\` s
      ON t.topic_title = s.\`Topic Title\`
    ORDER BY posts DESC
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


