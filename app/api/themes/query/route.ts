import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// Expects env THEME_TABLE like `project.dataset.table`
// Query returns aggregated metrics by topic
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const table = process.env.THEME_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_summary"

  const limit = Number(searchParams.get("limit") || 100)
  const group = searchParams.get("group") || ""
  const category = searchParams.get("category") || ""
  const search = searchParams.get("search") || ""
  const minSent = Number(searchParams.get("minSent") || "-1")

  const sql = `
    SELECT
      CAST(Category AS STRING) AS category,
      CAST(\`Topic Title\` AS STRING) AS topicTitle,
      CAST(\`Topic Summary\` AS STRING) AS topicSummary,
      CAST(\`Group\` AS STRING) AS groupName,
      SAFE_CAST(retweetCount AS INT64) AS retweetCount,
      SAFE_CAST(replyCount AS INT64) AS replyCount,
      SAFE_CAST(likeCount AS INT64) AS likeCount,
      SAFE_CAST(viewCount AS INT64) AS viewCount,
      SAFE_CAST(sentiment_compound AS FLOAT64) AS sentimentCompound,
      SAFE_CAST(HCP_score AS FLOAT64) AS hcpScore,
      SAFE_CAST(Patient_score AS FLOAT64) AS patientScore,
      SAFE_CAST(Caregiver_score AS FLOAT64) AS caregiverScore,
      SAFE_CAST(\`Payer _ NHS Trust_score\` AS FLOAT64) AS payerScore
    FROM \
      \`${table}\`
    WHERE TRUE
      AND (@group = '' OR LOWER(\`Group\`) = LOWER(@group))
      AND (@category = '' OR LOWER(Category) = LOWER(@category))
      AND (@search = '' OR REGEXP_CONTAINS(LOWER(\`Topic Title\`), LOWER(@search)))
      AND SAFE_CAST(sentiment_compound AS FLOAT64) >= @minSent
    ORDER BY viewCount DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery(sql, { limit, group, category, search, minSent })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "BigQuery error" }, { status: 500 })
  }
}


