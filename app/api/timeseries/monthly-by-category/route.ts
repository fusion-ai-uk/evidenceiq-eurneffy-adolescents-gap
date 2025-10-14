import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/timeseries/monthly-by-category
// Query params:
// - categories: comma-separated list (e.g., zynlonta,epcoritamab,glofitamab,car-t)
// - months: number of months to include (default 24)
// - metric: one of volume|interactions|views (default volume)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const table = process.env.TIMESERIES_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_data_time_series"

  const categoriesParam = (searchParams.get("categories") || "").trim()
  const categories = categoriesParam
    ? categoriesParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : ["zynlonta", "epcoritamab", "glofitamab", "car-t"]

  const months = Math.max(1, Math.min(120, Number(searchParams.get("months") || 24)))
  const metric = (searchParams.get("metric") || "volume").toLowerCase()

  const metricFields: Record<string, string> = {
    volume: "COUNT(1)",
    interactions:
      "SUM(SAFE_CAST(replyCount AS INT64) + SAFE_CAST(retweetCount AS INT64) + SAFE_CAST(likeCount AS INT64))",
    views: "SUM(SAFE_CAST(viewCount AS INT64))",
  }
  const metricExpr = metricFields[metric] || metricFields["volume"]

  const sql = `
    WITH base AS (
      SELECT
        DATE_TRUNC(createdAt, MONTH) AS month,
        LOWER(TRIM(Category)) AS category,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_CAST(replyCount AS INT64) AS replyCount,
        SAFE_CAST(retweetCount AS INT64) AS retweetCount,
        SAFE_CAST(likeCount AS INT64) AS likeCount,
        SAFE_CAST(viewCount AS INT64) AS viewCount
      FROM \`${table}\`
      WHERE Category IS NOT NULL AND createdAt IS NOT NULL
    ),
    filtered AS (
      SELECT * FROM base WHERE category IN UNNEST(@categories)
    ),
    monthly AS (
      SELECT
        month,
        category,
        ${metricExpr} AS value,
        AVG(sentiment) AS avg_sentiment
      FROM filtered
      GROUP BY month, category
    )
    SELECT FORMAT_DATE('%Y-%m-01', month) AS month, category, value, avg_sentiment
    FROM monthly
    WHERE DATE_DIFF(CURRENT_DATE(), month, MONTH) < @months
    ORDER BY month ASC, category ASC
  `

  try {
    const rows = await runQuery<{ month: string; category: string; value: number; avg_sentiment: number }[]>(sql, {
      categories,
      months,
    })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


