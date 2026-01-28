import { NextResponse } from "next/server"

import { runQuery } from "@/lib/bigquery"
import { getExecutiveFilters, parseIntClamped } from "@/lib/alunbrig/executiveFilters"
import { clusterTitleSql, getExecutiveBaseCteSql, getExecutiveBaseParams } from "@/lib/alunbrig/executiveSql"
import { getCardIndex } from "@/lib/alunbrig/executiveCache"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getExecutiveFilters(searchParams)

  const cardId = (searchParams.get("cardId") || "").trim()
  if (!cardId) return NextResponse.json({ error: "Missing cardId" }, { status: 400 })

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const limit = parseIntClamped(searchParams.get("limit"), 50, 1, 200)
  const offset = parseIntClamped(searchParams.get("offset"), 0, 0, 5000)

  const bucketParam = (searchParams.get("bucket") || "").trim()
  const clusterKeyParam = (searchParams.get("clusterKey") || "").trim()
  const periodStartParam = (searchParams.get("periodStartDate") || "").trim()
  const periodEndParam = (searchParams.get("periodEndDate") || "").trim()

  const fromIndex = getCardIndex(cardId)

  const clusterKey = clusterKeyParam || fromIndex?.clusterKey || ""
  const bucket = bucketParam || fromIndex?.bucket || ""
  const normalizedTitle = clusterKey.includes("::") ? clusterKey.split("::").slice(1).join("::") : fromIndex?.normalizedTitle || ""

  const periodStartDate = periodStartParam || fromIndex?.periodStartDate || ""
  const periodEndDate = periodEndParam || fromIndex?.periodEndDate || ""

  if (!bucket || !normalizedTitle || !periodStartDate || !periodEndDate) {
    return NextResponse.json(
      { error: "Missing cluster definition. Provide bucket, clusterKey, periodStartDate, periodEndDate." },
      { status: 400 },
    )
  }

  const whereCluster = `
    card_bucket = @bucket
    AND ${clusterTitleSql()} = @normalizedTitle
  `

  const sqlTotal = `
    ${getExecutiveBaseCteSql()},
    slice AS (
      SELECT * FROM base
      WHERE created_date BETWEEN DATE(@periodStartDate) AND DATE(@periodEndDate)
    )
    SELECT COUNT(*) AS total
    FROM slice
    WHERE ${whereCluster}
  `

  const sqlItems = `
    ${getExecutiveBaseCteSql()},
    slice AS (
      SELECT * FROM base
      WHERE created_date BETWEEN DATE(@periodStartDate) AND DATE(@periodEndDate)
    )
    SELECT
      CAST(created_ts AS STRING) AS created_ts,
      id,
      url,
      text,
      stakeholder_primary,
      sentiment_label,
      sentiment_polarity_minus1_to_1,
      engagement,
      viewCount,
      card_bucket,
      card_title,
      card_takeaway,
      card_signal_strength_0_100,
      topics_key_terms,
      sentiment_drivers,
      insight_tags_hurdles,
      insight_tags_opportunities,
      card_content_angle_suggestions,
      sequencing_is_sequencing_discussed,
      sequencing_line_of_therapy,
      sequencing_sequence_direction,
      sequencing_pfs_or_pfs2_mentioned,
      sequencing_attrition_or_discontinuation,
      uk_access_is_uk_related,
      uk_access_nation_hint,
      entities_competitors,
      entities_drugs_brands,
      post_type_evidence_type
    FROM slice
    WHERE ${whereCluster}
    ORDER BY engagement DESC, created_ts DESC
    LIMIT @limit OFFSET @offset
  `

  try {
    const params = {
      ...getExecutiveBaseParams(filters),
      bucket,
      normalizedTitle,
      periodStartDate,
      periodEndDate,
      limit,
      offset,
    }

    const totalRows = await runQuery<any>(sqlTotal, params)
    const total = Number(totalRows?.[0]?.total || 0)

    const items = await runQuery<any>(sqlItems, params)
    return NextResponse.json({ total, items })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
