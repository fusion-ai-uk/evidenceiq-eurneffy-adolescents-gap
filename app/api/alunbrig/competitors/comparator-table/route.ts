import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getCompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import {
  competitorAssetKeySql,
  competitorAssetLabelSql,
  getCompetitorBaseCteSql,
  getCompetitorBaseParams,
} from "@/lib/alunbrig/competitorSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getCompetitorLensFilters(searchParams)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  // NOTE: competitor list is derived from entities_competitors tokens (per requirements).
  // Per-competitor slice includes matches in entities_competitors OR entities_drugs_brands.
  const sql = `
    ${getCompetitorBaseCteSql()},
    comp_tokens AS (
      SELECT
        id,
        TRIM(tok) AS competitor_raw,
        ${competitorAssetKeySql("tok")} AS competitor_key
      FROM base,
      UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS tok
      WHERE TRIM(tok) != ''
        AND LOWER(TRIM(tok)) NOT IN ('unknown')
    ),
    comp_key_mentions AS (
      SELECT competitor_key, COUNT(DISTINCT id) AS mentions
      FROM comp_tokens
      GROUP BY competitor_key
      ORDER BY mentions DESC
      LIMIT @limit
    ),
    label_variants AS (
      SELECT competitor_key, competitor_raw, COUNT(DISTINCT id) AS mentions
      FROM comp_tokens
      GROUP BY competitor_key, competitor_raw
    ),
    label_pick AS (
      SELECT
        competitor_key,
        ARRAY_AGG(STRUCT(competitor_raw, mentions) ORDER BY mentions DESC, competitor_raw LIMIT 1)[OFFSET(0)].competitor_raw AS competitor_label_raw
      FROM label_variants
      GROUP BY competitor_key
    ),
    top_comps AS (
      SELECT
        c.competitor_key,
        ${competitorAssetLabelSql("c.competitor_key", "IFNULL(lp.competitor_label_raw, c.competitor_key)")} AS competitor,
        c.mentions AS mentions
      FROM comp_key_mentions c
      LEFT JOIN label_pick lp USING(competitor_key)
      ORDER BY mentions DESC
    ),
    match_tokens AS (
      SELECT
        b.id,
        ${competitorAssetKeySql("tok")} AS competitor_key
      FROM base b,
      UNNEST(
        ARRAY(
          SELECT DISTINCT t
          FROM UNNEST(
            ARRAY_CONCAT(
              ARRAY(SELECT TRIM(x) FROM UNNEST(SPLIT(IFNULL(CAST(b.entities_competitors AS STRING), ''), ';')) AS x WHERE TRIM(x) != ''),
              ARRAY(SELECT TRIM(y) FROM UNNEST(SPLIT(IFNULL(CAST(b.entities_drugs_brands AS STRING), ''), ';')) AS y WHERE TRIM(y) != ''),
              ARRAY(SELECT TRIM(z) FROM UNNEST(SPLIT(IFNULL(CAST(b.entities_drugs_generics AS STRING), ''), ';')) AS z WHERE TRIM(z) != '')
            )
          ) AS t
          WHERE TRIM(t) != ''
        )
      ) AS tok
      WHERE LOWER(TRIM(tok)) NOT IN ('unknown')
    ),
    slice AS (
      SELECT
        c.competitor_key,
        c.competitor,
        b.*
      FROM top_comps c
      JOIN match_tokens m
        ON m.competitor_key = c.competitor_key
      JOIN base b
        ON b.id = m.id
    ),
    stats AS (
      SELECT
        competitor_key,
        ANY_VALUE(competitor) AS competitor,
        COUNT(DISTINCT id) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing
      FROM slice
      GROUP BY competitor_key
    ),
    competitive_total AS (
      SELECT COUNT(DISTINCT id) AS competitivePosts
      FROM base
      WHERE (
        TRIM(IFNULL(CAST(competitive_positioning_comparative_context AS STRING), '')) IN ('Alunbrig_vs_competitor','competitor_only','class_discussion')
        OR TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) != ''
        OR TRIM(IFNULL(CAST(entities_drugs_brands AS STRING), '')) != ''
      )
    ),
    stance_counts AS (
      SELECT
        competitor_key,
        IFNULL(NULLIF(TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)), ''), 'unclear') AS stance,
        COUNT(DISTINCT id) AS posts
      FROM slice
      GROUP BY competitor_key, stance
    ),
    stance_totals AS (
      SELECT competitor_key, SUM(posts) AS total_posts
      FROM stance_counts
      GROUP BY competitor_key
    ),
    stance_pivot AS (
      SELECT
        sc.competitor_key,
        SAFE_DIVIDE(SUM(IF(sc.stance = 'favor_alunbrig', sc.posts, 0)), NULLIF(st.total_posts,0)) AS stanceFavorAlunbrig,
        SAFE_DIVIDE(SUM(IF(sc.stance = 'favor_competitor', sc.posts, 0)), NULLIF(st.total_posts,0)) AS stanceFavorCompetitor,
        SAFE_DIVIDE(SUM(IF(sc.stance = 'balanced', sc.posts, 0)), NULLIF(st.total_posts,0)) AS stanceBalanced
      FROM stance_counts sc
      JOIN stance_totals st USING(competitor_key)
      GROUP BY sc.competitor_key, st.total_posts
    ),
    stance_breakdown AS (
      SELECT
        sc.competitor_key,
        ARRAY_AGG(STRUCT(sc.stance AS stance, sc.posts AS posts, SAFE_DIVIDE(sc.posts, NULLIF(st.total_posts,0)) AS share) ORDER BY sc.posts DESC LIMIT 4) AS stanceBreakdown
      FROM stance_counts sc
      JOIN stance_totals st USING(competitor_key)
      GROUP BY sc.competitor_key, st.total_posts
    ),
    driver_counts AS (
      SELECT
        competitor_key,
        TRIM(d) AS driver,
        COUNT(*) AS count
      FROM slice,
      UNNEST(SPLIT(IFNULL(CAST(sentiment_drivers AS STRING), ''), ';')) AS d
      WHERE TRIM(d) != ''
      GROUP BY competitor_key, driver
    ),
    top_drivers AS (
      SELECT
        competitor_key,
        ARRAY_AGG(STRUCT(driver, count) ORDER BY count DESC LIMIT 3) AS topDrivers
      FROM driver_counts
      GROUP BY competitor_key
    ),
    term_counts AS (
      SELECT
        competitor_key,
        TRIM(t) AS term,
        COUNT(*) AS count
      FROM slice,
      UNNEST(SPLIT(IFNULL(CAST(topics_key_terms AS STRING), ''), ';')) AS t
      WHERE TRIM(t) != ''
      GROUP BY competitor_key, term
    ),
    top_terms AS (
      SELECT
        competitor_key,
        ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 5) AS topKeyTerms
      FROM term_counts
      GROUP BY competitor_key
    )
    SELECT
      ARRAY_AGG(STRUCT(
        c.competitor AS competitor,
        c.mentions AS mentions,
        SAFE_DIVIDE(c.mentions, NULLIF(ct.competitivePosts,0)) AS shareCompetitive,
        IFNULL(sp.stanceFavorAlunbrig, 0) AS stanceFavorAlunbrig,
        IFNULL(sp.stanceFavorCompetitor, 0) AS stanceFavorCompetitor,
        IFNULL(sp.stanceBalanced, 0) AS stanceBalanced,
        s.sentimentIndex AS sentimentIndex,
        s.pctNeurotox AS pctNeurotox,
        s.pctQoL AS pctQoL,
        s.pctCNS AS pctCNS,
        s.pctUKAccess AS pctUKAccess,
        s.pctSequencing AS pctSequencing,
        IFNULL(td.topDrivers, []) AS topDrivers,
        IFNULL(tt.topKeyTerms, []) AS topKeyTerms,
        IFNULL(sb.stanceBreakdown, []) AS stanceBreakdown
      ) ORDER BY c.mentions DESC) AS competitorRows
    FROM top_comps c
    CROSS JOIN competitive_total ct
    LEFT JOIN stats s USING(competitor_key)
    LEFT JOIN stance_pivot sp USING(competitor_key)
    LEFT JOIN top_drivers td USING(competitor_key)
    LEFT JOIN top_terms tt USING(competitor_key)
    LEFT JOIN stance_breakdown sb USING(competitor_key)
  `

  try {
    const params = { ...getCompetitorBaseParams(filters), limit }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}
    return NextResponse.json({ rows: r.competitorRows || [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
