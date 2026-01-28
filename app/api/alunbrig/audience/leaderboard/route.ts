import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAudienceGlobalFilters, parseAudience } from "@/lib/alunbrig/audienceFilters"
import { getAudienceBaseCteSql, getAudienceBaseParams, audienceWhereSql } from "@/lib/alunbrig/audienceSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAudienceGlobalFilters(searchParams)
  const audience = parseAudience(searchParams.get("audience"))
  const limitTopics = Math.min(200, Math.max(0, Number(searchParams.get("limitTopics") || 25)))
  const limitBuckets = Math.min(200, Math.max(0, Number(searchParams.get("limitBuckets") || 10)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const audWhere = audienceWhereSql(audience)

  const sql = `
    ${getAudienceBaseCteSql()},
    slice AS (
      SELECT * FROM base WHERE ${audWhere}
    ),
    flag_rates AS (
      SELECT
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess,
        AVG(CASE WHEN topics_brief_flags_caregiver_burden THEN 1 ELSE 0 END) AS pctCaregiverBurden
      FROM slice
    ),
    topic_rows AS (
      SELECT
        LOWER(REGEXP_REPLACE(REPLACE(TRIM(t), '_', ' '), r'\\s+', ' ')) AS topic_key,
        REGEXP_REPLACE(REPLACE(TRIM(t), '_', ' '), r'\\s+', ' ') AS topic_display,
        sentiment_polarity_minus1_to_1,
        sequencing_is_sequencing_discussed,
        topics_brief_flags_quality_of_life,
        topics_brief_flags_neuro_or_cognitive_toxicity,
        topics_brief_flags_cns_or_brain_mets,
        topics_brief_flags_uk_access_or_reimbursement,
        uk_access_is_uk_related,
        topics_key_terms
      FROM slice, UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS t
      WHERE TRIM(t) != ''
    ),
    topic_display_counts AS (
      SELECT topic_key, topic_display, COUNT(*) AS cnt
      FROM topic_rows
      GROUP BY topic_key, topic_display
    ),
    topic_display_top AS (
      SELECT
        topic_key,
        ARRAY_AGG(topic_display ORDER BY cnt DESC LIMIT 1)[OFFSET(0)] AS topic
      FROM topic_display_counts
      GROUP BY topic_key
    ),
    topics AS (
      SELECT
        topic_key,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM topic_rows
      GROUP BY topic_key
      ORDER BY posts DESC
      LIMIT ${limitTopics}
    ),
    topic_key_terms AS (
      SELECT
        tr.topic_key,
        TRIM(term) AS term
      FROM topic_rows tr, UNNEST(SPLIT(IFNULL(tr.topics_key_terms,''), ';')) AS term
      WHERE TRIM(term) != ''
    ),
    topic_key_term_counts AS (
      SELECT topic_key, term, COUNT(*) AS count
      FROM topic_key_terms
      GROUP BY topic_key, term
    ),
    topic_key_term_top AS (
      SELECT
        topic_key,
        ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 8) AS topKeyTerms
      FROM topic_key_term_counts
      GROUP BY topic_key
    ),
    bucket_base AS (
      SELECT
        CAST(card_bucket AS STRING) AS bucket,
        sentiment_polarity_minus1_to_1,
        sequencing_is_sequencing_discussed,
        topics_brief_flags_quality_of_life,
        topics_brief_flags_neuro_or_cognitive_toxicity,
        topics_brief_flags_cns_or_brain_mets,
        topics_brief_flags_uk_access_or_reimbursement,
        uk_access_is_uk_related,
        sentiment_drivers,
        insight_tags_hurdles,
        insight_tags_opportunities
      FROM slice
      WHERE card_bucket IS NOT NULL AND TRIM(CAST(card_bucket AS STRING)) != ''
    ),
    buckets AS (
      SELECT
        bucket,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM bucket_base
      GROUP BY bucket
      ORDER BY posts DESC
      LIMIT ${limitBuckets}
    ),
    driver_rows AS (
      SELECT bucket, TRIM(driver) AS driver
      FROM bucket_base, UNNEST(SPLIT(IFNULL(sentiment_drivers,''), ';')) AS driver
      WHERE TRIM(driver) != ''
    ),
    hurdle_rows AS (
      SELECT bucket, TRIM(h) AS hurdle
      FROM bucket_base, UNNEST(SPLIT(IFNULL(insight_tags_hurdles,''), ';')) AS h
      WHERE TRIM(h) != ''
    ),
    opp_rows AS (
      SELECT bucket, TRIM(o) AS opp
      FROM bucket_base, UNNEST(SPLIT(IFNULL(insight_tags_opportunities,''), ';')) AS o
      WHERE TRIM(o) != ''
    ),
    driver_counts AS (SELECT bucket, driver, COUNT(*) AS count FROM driver_rows GROUP BY bucket, driver),
    hurdle_counts AS (SELECT bucket, hurdle, COUNT(*) AS count FROM hurdle_rows GROUP BY bucket, hurdle),
    opp_counts AS (SELECT bucket, opp, COUNT(*) AS count FROM opp_rows GROUP BY bucket, opp),
    driver_top AS (SELECT bucket, ARRAY_AGG(STRUCT(driver, count) ORDER BY count DESC LIMIT 8) AS topDrivers FROM driver_counts GROUP BY bucket),
    hurdle_top AS (SELECT bucket, ARRAY_AGG(STRUCT(hurdle, count) ORDER BY count DESC LIMIT 8) AS topHurdles FROM hurdle_counts GROUP BY bucket),
    opp_top AS (SELECT bucket, ARRAY_AGG(STRUCT(opp, count) ORDER BY count DESC LIMIT 8) AS topOpportunities FROM opp_counts GROUP BY bucket)
    SELECT
      @audience AS audience,
      (SELECT ARRAY_AGG(STRUCT(dt.topic AS topic, t.posts, t.sentimentIndex, t.pctSequencing, t.pctQoL, t.pctNeurotox, t.pctCNS, t.pctUKAccess,
        IFNULL(k.topKeyTerms, []) AS topKeyTerms)
        ORDER BY t.posts DESC)
       FROM topics t
       LEFT JOIN topic_key_term_top k USING(topic_key)
       LEFT JOIN topic_display_top dt USING(topic_key)
      ) AS topics,
      (SELECT ARRAY_AGG(STRUCT(b.bucket, b.posts, b.sentimentIndex, b.pctSequencing, b.pctQoL, b.pctNeurotox, b.pctCNS, b.pctUKAccess,
        IFNULL(dt.topDrivers, []) AS topDrivers,
        IFNULL(ht.topHurdles, []) AS topHurdles,
        IFNULL(ot.topOpportunities, []) AS topOpportunities)
        ORDER BY b.posts DESC)
       FROM buckets b
       LEFT JOIN driver_top dt USING(bucket)
       LEFT JOIN hurdle_top ht USING(bucket)
       LEFT JOIN opp_top ot USING(bucket)
      ) AS buckets,
      (SELECT AS STRUCT * FROM flag_rates) AS flagRates
  `

  try {
    const params = { ...getAudienceBaseParams(filters), audience }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}
    return NextResponse.json({
      audience,
      topics: r.topics || [],
      buckets: r.buckets || [],
      flagRates: r.flagRates || {
        pctSequencing: 0,
        pctQoL: 0,
        pctNeurotox: 0,
        pctCaregiverBurden: 0,
        pctCNS: 0,
        pctUKAccess: 0,
      },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
