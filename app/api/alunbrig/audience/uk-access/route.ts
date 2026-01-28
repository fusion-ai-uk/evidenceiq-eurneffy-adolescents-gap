import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAudienceGlobalFilters, parseAudience } from "@/lib/alunbrig/audienceFilters"
import { getAudienceBaseCteSql, getAudienceBaseParams, audienceWhereSql } from "@/lib/alunbrig/audienceSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAudienceGlobalFilters(searchParams)
  const audience = parseAudience(searchParams.get("audience"))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const audWhere = audienceWhereSql(audience)

  const sql = `
    ${getAudienceBaseCteSql()},
    slice AS (
      SELECT * FROM base
      WHERE ${audWhere}
        AND (uk_access_is_uk_related = TRUE OR topics_brief_flags_uk_access_or_reimbursement = TRUE)
    ),
    nations AS (
      SELECT TRIM(CAST(uk_access_nation_hint AS STRING)) AS nation,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex
      FROM slice
      WHERE TRIM(CAST(uk_access_nation_hint AS STRING)) != ''
      GROUP BY nation
    ),
    signal_tokens AS (
      SELECT TRIM(s) AS signal
      FROM slice, UNNEST(SPLIT(IFNULL(uk_access_signals,''), ';')) AS s
      WHERE TRIM(s) != ''
    ),
    hurdle_tokens AS (
      SELECT TRIM(h) AS hurdle
      FROM slice, UNNEST(SPLIT(IFNULL(insight_tags_hurdles,''), ';')) AS h
      WHERE TRIM(h) != ''
    ),
    opp_tokens AS (
      SELECT TRIM(o) AS opp
      FROM slice, UNNEST(SPLIT(IFNULL(insight_tags_opportunities,''), ';')) AS o
      WHERE TRIM(o) != ''
    ),
    topic_tokens AS (
      SELECT TRIM(t) AS topic
      FROM slice, UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS t
      WHERE TRIM(t) != ''
    ),
    evidence AS (
      SELECT TRIM(CAST(post_type_evidence_type AS STRING)) AS type, COUNT(*) AS count
      FROM slice
      WHERE TRIM(CAST(post_type_evidence_type AS STRING)) != ''
      GROUP BY type
    )
    SELECT
      @audience AS audience,
      (SELECT COUNT(*) FROM slice) AS totalUKAccessPosts,
      (SELECT ARRAY_AGG(STRUCT(nation, posts, sentimentIndex) ORDER BY posts DESC) FROM nations) AS nationBreakdown,
      (SELECT ARRAY_AGG(STRUCT(signal, cnt AS count) ORDER BY cnt DESC LIMIT 25)
        FROM (SELECT signal, COUNT(*) AS cnt FROM signal_tokens GROUP BY signal)
      ) AS topAccessSignals,
      (SELECT ARRAY_AGG(STRUCT(hurdle, cnt AS count) ORDER BY cnt DESC LIMIT 25)
        FROM (SELECT hurdle, COUNT(*) AS cnt FROM hurdle_tokens GROUP BY hurdle)
      ) AS topHurdles,
      (SELECT ARRAY_AGG(STRUCT(opp, cnt AS count) ORDER BY cnt DESC LIMIT 25)
        FROM (SELECT opp, COUNT(*) AS cnt FROM opp_tokens GROUP BY opp)
      ) AS topOpportunities,
      (SELECT ARRAY_AGG(STRUCT(topic, cnt AS count) ORDER BY cnt DESC LIMIT 25)
        FROM (SELECT topic, COUNT(*) AS cnt FROM topic_tokens GROUP BY topic)
      ) AS topTopics,
      (SELECT ARRAY_AGG(STRUCT(type, count) ORDER BY count DESC LIMIT 25) FROM evidence) AS topEvidenceTypes
  `

  try {
    const params = { ...getAudienceBaseParams(filters), audience }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}
    return NextResponse.json({
      audience,
      totalUKAccessPosts: Number(r.totalUKAccessPosts || 0),
      nationBreakdown: r.nationBreakdown || [],
      topAccessSignals: r.topAccessSignals || [],
      topHurdles: r.topHurdles || [],
      topOpportunities: r.topOpportunities || [],
      topTopics: r.topTopics || [],
      topEvidenceTypes: r.topEvidenceTypes || [],
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
