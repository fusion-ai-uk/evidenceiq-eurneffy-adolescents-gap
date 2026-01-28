import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAlunbrigThemeFilters } from "@/lib/alunbrig/themeFilters"
import type { AlunbrigThemeGroupBy } from "@/lib/alunbrig/themeFilters"
import { getBaseCteSql, getBaseParams } from "@/lib/alunbrig/themeSql"

function isGroupBy(v: string): v is AlunbrigThemeGroupBy {
  return v === "card_bucket" || v === "topics_top_topics" || v === "clinical_context_biomarker" || v === "competitive_context"
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAlunbrigThemeFilters(searchParams)

  const groupByRaw = searchParams.get("groupBy") || ""
  const groupValue = (searchParams.get("groupValue") || "").trim()
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)))
  const offset = Math.max(0, Number(searchParams.get("offset") || 0))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }
  if (!isGroupBy(groupByRaw)) return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  if (!groupValue) return NextResponse.json({ error: "Missing groupValue" }, { status: 400 })

  const groupBy = groupByRaw

  const groupPredicate =
    groupBy === "card_bucket"
      ? "card_bucket = @groupValue"
      : groupBy === "clinical_context_biomarker"
        ? "clinical_context_biomarker = @groupValue"
        : groupBy === "competitive_context"
          ? "competitive_positioning_comparative_context = @groupValue"
          : `EXISTS(
              SELECT 1
              FROM UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) t
              WHERE TRIM(t) = @groupValue
            )`

  const itemsSql = `
    ${getBaseCteSql()}
    SELECT
      id,
      url,
      text,
      CAST(created_ts AS STRING) AS created_ts,
      stakeholder_primary,
      sentiment_label,
      sentiment_polarity_minus1_to_1,
      engagement,
      viewCount,
      post_type_evidence_type,
      card_bucket,
      topics_top_topics,
      topics_key_terms,
      uk_access_is_uk_related,
      uk_access_nation_hint
    FROM base
    WHERE ${groupPredicate}
    ORDER BY created_ts DESC
    LIMIT @limit
    OFFSET @offset
  `

  const totalSql = `
    ${getBaseCteSql()}
    SELECT COUNT(*) AS total
    FROM base
    WHERE ${groupPredicate}
  `

  try {
    const params = { ...getBaseParams(filters), groupValue, limit, offset }
    const [items, totalRows] = await Promise.all([
      runQuery<any>(itemsSql, params),
      runQuery<any>(totalSql, { ...getBaseParams(filters), groupValue }),
    ])
    const total = Number(totalRows?.[0]?.total || 0)
    return NextResponse.json({ total, items })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
