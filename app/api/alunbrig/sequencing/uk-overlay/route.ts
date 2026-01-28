import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters } from "@/lib/alunbrig/sequencingFilters"
import { getSequencingBaseCteSql, getSequencingBaseParams, togglesWhereSql } from "@/lib/alunbrig/sequencingSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const sql = `
    ${getSequencingBaseCteSql()},
    slice AS (
      SELECT *
      FROM base
      WHERE ${togglesWhereSql()}
        AND (uk_access_is_uk_related = TRUE OR topics_brief_flags_uk_access_or_reimbursement = TRUE)
        AND TRIM(CAST(uk_access_nation_hint AS STRING)) != ''
    ),
    nation_stats AS (
      SELECT
        TRIM(CAST(uk_access_nation_hint AS STRING)) AS nation,
        COUNT(*) AS posts,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex
      FROM slice
      GROUP BY nation
    ),
    signal_tokens AS (
      SELECT
        TRIM(CAST(uk_access_nation_hint AS STRING)) AS nation,
        TRIM(sig) AS signal
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(uk_access_signals AS STRING), ''), ';')) AS sig
      WHERE TRIM(sig) != ''
    ),
    signal_counts AS (
      SELECT nation, signal, COUNT(*) AS count
      FROM signal_tokens
      GROUP BY nation, signal
    ),
    top_signals AS (
      SELECT
        nation,
        ARRAY_AGG(STRUCT(signal, count) ORDER BY count DESC LIMIT 8) AS topSignals
      FROM signal_counts
      GROUP BY nation
    ),
    rationale_counts AS (
      SELECT
        TRIM(CAST(uk_access_nation_hint AS STRING)) AS nation,
        TRIM(CAST(sequencing_rationale_short AS STRING)) AS rationale,
        COUNT(*) AS count
      FROM slice
      WHERE TRIM(CAST(sequencing_rationale_short AS STRING)) != ''
      GROUP BY nation, rationale
    ),
    top_rationales AS (
      SELECT
        nation,
        ARRAY_AGG(STRUCT(rationale, count) ORDER BY count DESC LIMIT 5) AS topRationales
      FROM rationale_counts
      GROUP BY nation
    )
    SELECT
      (SELECT ARRAY_AGG(STRUCT(
        n.nation AS nation,
        n.posts AS posts,
        n.pctSequencing AS pctSequencing,
        n.pctPFS AS pctPFS,
        n.pctAttrition AS pctAttrition,
        n.sentimentIndex AS sentimentIndex,
        IFNULL(s.topSignals, []) AS topSignals,
        IFNULL(r.topRationales, []) AS topRationales
      ) ORDER BY n.posts DESC)
      FROM nation_stats n
      LEFT JOIN top_signals s USING(nation)
      LEFT JOIN top_rationales r USING(nation)
      ) AS nations
  `

  try {
    const rows = await runQuery<any>(sql, getSequencingBaseParams(filters))
    return NextResponse.json(rows?.[0] || { nations: [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
