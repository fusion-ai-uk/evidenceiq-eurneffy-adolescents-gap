import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getCompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import { competitorAssetKeySql, getCompetitorBaseCteSql, getCompetitorBaseParams } from "@/lib/alunbrig/competitorSql"

type Granularity = "week" | "month"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getCompetitorLensFilters(searchParams)
  const competitor = (searchParams.get("competitor") || "").trim()
  const granularity = ((searchParams.get("granularity") || "week") as Granularity) === "month" ? "month" : "week"

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const periodExpr = granularity === "month" ? "created_month" : "created_week"

  const common = `
    ${getCompetitorBaseCteSql()},
    period_rows AS (
      SELECT ${periodExpr} AS period, * FROM base
    ),
    competitive_rows AS (
      SELECT
        *,
        (
          TRIM(IFNULL(CAST(competitive_positioning_comparative_context AS STRING), '')) IN ('Alunbrig_vs_competitor','competitor_only','class_discussion')
          OR TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) != ''
          OR TRIM(IFNULL(CAST(entities_drugs_brands AS STRING), '')) != ''
        ) AS is_competitive
      FROM period_rows
    )
  `

  const sqlOverall = `
    ${common},
    comp_source AS (
      -- Prefer entities_competitors tokens when present
      SELECT
        id,
        period,
        TRIM(tok) AS name
      FROM competitive_rows,
      UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS tok
      WHERE is_competitive
        AND TRIM(tok) != ''
        AND LOWER(TRIM(tok)) NOT IN ('unknown')
        AND TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) != ''

      UNION ALL

      -- Fallback to brands only when entities_competitors is empty
      SELECT
        id,
        period,
        TRIM(b) AS name
      FROM competitive_rows,
      UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b
      WHERE is_competitive
        AND TRIM(b) != ''
        AND LOWER(TRIM(b)) != LOWER(@targetBrand)
        AND TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) = ''
    ),
    competitive_by_period AS (
      SELECT period, COUNT(DISTINCT id) AS totalCompetitivePosts
      FROM competitive_rows
      WHERE is_competitive
      GROUP BY period
    ),
    comp_counts AS (
      SELECT period, name, COUNT(DISTINCT id) AS mentions
      FROM comp_source
      GROUP BY period, name
    ),
    comp_ranked AS (
      SELECT
        c.period,
        p.totalCompetitivePosts,
        c.name,
        c.mentions,
        SAFE_DIVIDE(c.mentions, NULLIF(p.totalCompetitivePosts,0)) AS share
      FROM comp_counts c
      JOIN competitive_by_period p USING(period)
    ),
    series_rows AS (
      SELECT
        period,
        totalCompetitivePosts,
        ARRAY_AGG(STRUCT(name, mentions, share) ORDER BY mentions DESC LIMIT 5) AS topCompetitors
      FROM comp_ranked
      GROUP BY period, totalCompetitivePosts
    ),
    top_comp_overall AS (
      SELECT name, COUNT(DISTINCT id) AS mentions
      FROM comp_source
      GROUP BY name
    )
    SELECT
      @granularity AS granularity,
      (SELECT ARRAY_AGG(STRUCT(period, totalCompetitivePosts, topCompetitors) ORDER BY period) FROM series_rows) AS series,
      (SELECT ARRAY_AGG(STRUCT(name, mentions) ORDER BY mentions DESC LIMIT 10) FROM top_comp_overall) AS topCompetitorsOverall
  `

  const sqlCompetitor = `
    ${common},
    param AS (
      SELECT COALESCE(m.generic_key, ${competitorAssetKeySql("@competitor")}) AS competitor_key
      FROM (SELECT 1) _
      LEFT JOIN brand_to_generic_map m
        ON m.brand_key = ${competitorAssetKeySql("@competitor")}
    ),
    slice AS (
      SELECT *
      FROM competitive_rows
      WHERE (NOT @competitorEnabled) OR (
        EXISTS (
          SELECT 1
          FROM UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS t
          LEFT JOIN brand_to_generic_map m
            ON m.brand_key = ${competitorAssetKeySql("t")}
          WHERE COALESCE(m.generic_key, ${competitorAssetKeySql("t")}) = (SELECT competitor_key FROM param)
        )
        OR EXISTS (
          SELECT 1
          FROM UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b
          LEFT JOIN brand_to_generic_map m
            ON m.brand_key = ${competitorAssetKeySql("b")}
          WHERE COALESCE(m.generic_key, ${competitorAssetKeySql("b")}) = (SELECT competitor_key FROM param)
        )
        OR EXISTS (
          SELECT 1
          FROM UNNEST(SPLIT(IFNULL(CAST(entities_drugs_generics AS STRING), ''), ';')) AS g
          LEFT JOIN brand_to_generic_map m
            ON m.brand_key = ${competitorAssetKeySql("g")}
          WHERE COALESCE(m.generic_key, ${competitorAssetKeySql("g")}) = (SELECT competitor_key FROM param)
        )
      )
    ),
    by_period AS (
      SELECT
        period,
        COUNT(DISTINCT id) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing
      FROM slice
      GROUP BY period
    ),
    stance_rows AS (
      SELECT
        period,
        IFNULL(NULLIF(TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)), ''), 'unclear') AS stance,
        COUNT(DISTINCT id) AS posts
      FROM slice
      GROUP BY period, stance
    ),
    stance_by_period AS (
      SELECT
        s.period,
        ARRAY_AGG(STRUCT(s.stance AS stance, s.posts AS posts, SAFE_DIVIDE(s.posts, NULLIF(p.posts,0)) AS share) ORDER BY s.posts DESC) AS stance
      FROM stance_rows s
      JOIN by_period p
        ON p.period = s.period
      GROUP BY s.period, p.posts
    )
    SELECT
      @granularity AS granularity,
      @competitor AS competitor,
      (SELECT ARRAY_AGG(STRUCT(
        p.period AS period,
        p.posts AS posts,
        IFNULL(sb.stance, []) AS stance,
        p.sentimentIndex AS sentimentIndex,
        p.pctNeurotox AS pctNeurotox,
        p.pctQoL AS pctQoL,
        p.pctCNS AS pctCNS,
        p.pctUKAccess AS pctUKAccess,
        p.pctSequencing AS pctSequencing
      ) ORDER BY p.period)
      FROM by_period p
      LEFT JOIN stance_by_period sb
        ON sb.period = p.period
      ) AS series
  `

  try {
    const params = {
      ...getCompetitorBaseParams(filters),
      targetBrand: filters.targetBrand,
      granularity,
      competitor,
      competitorEnabled: competitor !== "",
    }
    const rows = await runQuery<any>(competitor ? sqlCompetitor : sqlOverall, params)
    return NextResponse.json(rows?.[0] || { granularity })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
