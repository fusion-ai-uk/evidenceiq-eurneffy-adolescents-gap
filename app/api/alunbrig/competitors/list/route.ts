import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getCompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import { getCompetitorBaseCteSql, getCompetitorBaseParams } from "@/lib/alunbrig/competitorSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getCompetitorLensFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const sql = `
    ${getCompetitorBaseCteSql()},
    competitive AS (
      SELECT
        *,
        (
          TRIM(IFNULL(CAST(competitive_positioning_comparative_context AS STRING), '')) IN ('Alunbrig_vs_competitor','competitor_only','class_discussion')
          OR TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) != ''
          OR TRIM(IFNULL(CAST(entities_drugs_brands AS STRING), '')) != ''
        ) AS is_competitive
      FROM base
    ),
    meta AS (
      SELECT
        COUNT(*) AS totalPosts,
        COUNTIF(is_competitive) AS competitivePosts
      FROM competitive
    ),
    competitor_tokens AS (
      SELECT
        id,
        TRIM(tok) AS name
      FROM competitive, UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS tok
      WHERE is_competitive
        AND TRIM(tok) != ''
        AND LOWER(TRIM(tok)) NOT IN ('unknown')
    ),
    competitor_counts AS (
      SELECT name, COUNT(DISTINCT id) AS mentions
      FROM competitor_tokens
      GROUP BY name
    ),
    brand_tokens AS (
      SELECT
        id,
        TRIM(tok) AS name
      FROM competitive, UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS tok
      WHERE is_competitive
        AND TRIM(tok) != ''
        AND LOWER(TRIM(tok)) != LOWER(@targetBrand)
    ),
    brand_counts AS (
      SELECT name, COUNT(DISTINCT id) AS mentions
      FROM brand_tokens
      GROUP BY name
    )
    SELECT
      @targetBrand AS targetBrand,
      (SELECT ARRAY_AGG(STRUCT(name, mentions, SAFE_DIVIDE(mentions, NULLIF(m.competitivePosts, 0)) AS shareOfCompetitivePosts) ORDER BY mentions DESC LIMIT 50)
        FROM competitor_counts, meta m
      ) AS competitors,
      (SELECT ARRAY_AGG(STRUCT(name, mentions) ORDER BY mentions DESC LIMIT 50)
        FROM brand_counts
      ) AS brandsMentioned,
      (SELECT AS STRUCT totalPosts, competitivePosts FROM meta) AS meta
  `

  try {
    const params = { ...getCompetitorBaseParams(filters), targetBrand: filters.targetBrand }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}
    return NextResponse.json({
      targetBrand: filters.targetBrand,
      competitors: r.competitors || [],
      brandsMentioned: r.brandsMentioned || [],
      meta: {
        competitivePosts: Number(r?.meta?.competitivePosts || 0),
        totalPosts: Number(r?.meta?.totalPosts || 0),
      },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
