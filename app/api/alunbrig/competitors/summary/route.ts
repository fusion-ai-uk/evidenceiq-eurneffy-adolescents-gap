import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getCompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import { getCompetitorBaseCteSql, getCompetitorBaseParams } from "@/lib/alunbrig/competitorSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getCompetitorLensFilters(searchParams)
  const competitor = (searchParams.get("competitor") || "").trim()

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const sql = `
    ${getCompetitorBaseCteSql()},
    slice AS (
      SELECT *
      FROM base
      WHERE (NOT @competitorEnabled) OR (
        EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS t WHERE TRIM(t) = @competitor)
        OR EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b WHERE TRIM(b) = @competitor)
      )
    ),
    slice_meta AS (
      SELECT
        COUNT(*) AS posts,
        COUNTIF(
          TRIM(IFNULL(CAST(competitive_positioning_comparative_context AS STRING), '')) IN ('Alunbrig_vs_competitor','competitor_only','class_discussion')
          OR TRIM(IFNULL(CAST(entities_competitors AS STRING), '')) != ''
          OR TRIM(IFNULL(CAST(entities_drugs_brands AS STRING), '')) != ''
        ) AS competitivePosts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM slice
    ),
    ctx AS (
      SELECT TRIM(CAST(competitive_positioning_comparative_context AS STRING)) AS context, COUNT(*) AS posts
      FROM slice
      WHERE TRIM(CAST(competitive_positioning_comparative_context AS STRING)) != ''
      GROUP BY context
    ),
    ctx_total AS (SELECT SUM(posts) AS total FROM ctx),
    stance AS (
      SELECT
        IFNULL(NULLIF(TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)), ''), 'unclear') AS stance,
        COUNT(*) AS posts
      FROM slice
      GROUP BY stance
    ),
    stance_total AS (SELECT SUM(posts) AS total FROM stance),
    attrib_rows AS (
      SELECT
        id,
        sentiment_polarity_minus1_to_1,
        sentiment_drivers,
        attribute
      FROM slice,
      UNNEST(
        ARRAY_CONCAT(
          IF(topics_brief_flags_efficacy_outcomes, ['Efficacy'], []),
          IF(topics_brief_flags_safety_or_tolerability, ['Safety'], []),
          IF(topics_brief_flags_neuro_or_cognitive_toxicity, ['Neurotox'], []),
          IF(topics_brief_flags_quality_of_life, ['QoL'], []),
          IF(topics_brief_flags_cns_or_brain_mets, ['CNS'], []),
          IF(topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related, ['Access'], []),
          IF(sequencing_is_sequencing_discussed, ['Sequencing'], []),
          IF(
            NOT(
              topics_brief_flags_efficacy_outcomes
              OR topics_brief_flags_safety_or_tolerability
              OR topics_brief_flags_neuro_or_cognitive_toxicity
              OR topics_brief_flags_quality_of_life
              OR topics_brief_flags_cns_or_brain_mets
              OR topics_brief_flags_uk_access_or_reimbursement
              OR uk_access_is_uk_related
              OR sequencing_is_sequencing_discussed
            ),
            ['Other'],
            []
          )
        )
      ) AS attribute
    ),
    attrib_counts AS (
      SELECT
        attribute,
        COUNT(DISTINCT id) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex
      FROM attrib_rows
      GROUP BY attribute
    ),
    attrib_driver_tokens AS (
      SELECT
        a.attribute,
        TRIM(d) AS driver
      FROM attrib_rows a, UNNEST(SPLIT(IFNULL(a.sentiment_drivers,''), ';')) AS d
      WHERE TRIM(d) != ''
    ),
    attrib_drivers AS (
      SELECT
        attribute,
        ARRAY_AGG(STRUCT(driver, cnt AS count) ORDER BY cnt DESC LIMIT 5) AS topDrivers
      FROM (
        SELECT attribute, driver, COUNT(*) AS cnt
        FROM attrib_driver_tokens
        GROUP BY attribute, driver
      )
      GROUP BY attribute
    ),
    stakeholders AS (
      SELECT stakeholder_primary AS label, COUNT(*) AS count
      FROM slice
      WHERE TRIM(CAST(stakeholder_primary AS STRING)) != ''
      GROUP BY label
    ),
    key_terms AS (
      SELECT TRIM(t) AS term
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(topics_key_terms AS STRING), ''), ';')) AS t
      WHERE TRIM(t) != ''
    ),
    term_counts AS (
      SELECT term, COUNT(*) AS count
      FROM key_terms
      GROUP BY term
    ),
    opp_tokens AS (
      SELECT TRIM(o) AS opp
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(insight_tags_opportunities AS STRING), ''), ';')) AS o
      WHERE TRIM(o) != ''
    ),
    opp_counts AS (SELECT opp, COUNT(*) AS count FROM opp_tokens GROUP BY opp),
    hurdle_tokens AS (
      SELECT TRIM(h) AS hurdle
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(insight_tags_hurdles AS STRING), ''), ';')) AS h
      WHERE TRIM(h) != ''
    ),
    hurdle_counts AS (SELECT hurdle, COUNT(*) AS count FROM hurdle_tokens GROUP BY hurdle)
    SELECT
      @targetBrand AS targetBrand,
      IF(@competitorEnabled, @competitor, NULL) AS competitor,
      (SELECT AS STRUCT
        posts,
        competitivePosts,
        SAFE_DIVIDE(competitivePosts, NULLIF(posts,0)) AS shareCompetitive,
        sentimentIndex,
        pctSequencing,
        pctQoL,
        pctNeurotox,
        pctCNS,
        pctUKAccess
      FROM slice_meta) AS kpis,
      (SELECT ARRAY_AGG(STRUCT(c.context AS context, c.posts AS posts, SAFE_DIVIDE(c.posts, NULLIF(ct.total,0)) AS share) ORDER BY c.posts DESC)
        FROM ctx c, ctx_total ct
      ) AS contextBreakdown,
      (SELECT ARRAY_AGG(STRUCT(s.stance AS stance, s.posts AS posts, SAFE_DIVIDE(s.posts, NULLIF(st.total,0)) AS share) ORDER BY s.posts DESC)
        FROM stance s, stance_total st
      ) AS stanceTowardAlunbrig,
      (SELECT ARRAY_AGG(STRUCT(a.attribute AS attribute, a.posts AS posts, SAFE_DIVIDE(a.posts, NULLIF(sm.posts,0)) AS share, a.sentimentIndex AS sentimentIndex, IFNULL(d.topDrivers, []) AS topDrivers) ORDER BY a.posts DESC)
        FROM attrib_counts a
        CROSS JOIN slice_meta sm
        LEFT JOIN attrib_drivers d USING(attribute)
      ) AS attributeDrivers,
      (SELECT ARRAY_AGG(STRUCT(label, count) ORDER BY count DESC LIMIT 5) FROM stakeholders) AS topStakeholders,
      (SELECT ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 15) FROM term_counts) AS topKeyTerms,
      (SELECT ARRAY_AGG(STRUCT(opp, count) ORDER BY count DESC LIMIT 15) FROM opp_counts) AS topOpportunities,
      (SELECT ARRAY_AGG(STRUCT(hurdle, count) ORDER BY count DESC LIMIT 15) FROM hurdle_counts) AS topHurdles
  `

  try {
    const params = {
      ...getCompetitorBaseParams(filters),
      targetBrand: filters.targetBrand,
      competitor,
      competitorEnabled: competitor !== "",
    }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}
    return NextResponse.json({
      targetBrand: filters.targetBrand,
      competitor: competitor || null,
      kpis: {
        posts: Number(r?.kpis?.posts || 0),
        competitivePosts: Number(r?.kpis?.competitivePosts || 0),
        shareCompetitive: Number(r?.kpis?.shareCompetitive || 0),
        sentimentIndex: Number(r?.kpis?.sentimentIndex || 0),
        pctSequencing: Number(r?.kpis?.pctSequencing || 0),
        pctQoL: Number(r?.kpis?.pctQoL || 0),
        pctNeurotox: Number(r?.kpis?.pctNeurotox || 0),
        pctCNS: Number(r?.kpis?.pctCNS || 0),
        pctUKAccess: Number(r?.kpis?.pctUKAccess || 0),
      },
      contextBreakdown: r.contextBreakdown || [],
      stanceTowardAlunbrig: r.stanceTowardAlunbrig || [],
      attributeDrivers: r.attributeDrivers || [],
      topStakeholders: r.topStakeholders || [],
      topKeyTerms: r.topKeyTerms || [],
      topOpportunities: r.topOpportunities || [],
      topHurdles: r.topHurdles || [],
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
