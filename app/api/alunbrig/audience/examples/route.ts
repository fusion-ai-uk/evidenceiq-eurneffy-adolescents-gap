import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAudienceGlobalFilters, parseAudience } from "@/lib/alunbrig/audienceFilters"
import { getAudienceBaseCteSql, getAudienceBaseParams, audienceWhereSql } from "@/lib/alunbrig/audienceSql"

type Mode = "topic" | "bucket" | "competitive_context" | "stance" | "uk_signal"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAudienceGlobalFilters(searchParams)
  const audience = parseAudience(searchParams.get("audience"))
  const mode = (searchParams.get("mode") || "topic") as Mode
  const value = (searchParams.get("value") || "").trim()
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)))
  const offset = Math.max(0, Number(searchParams.get("offset") || 0))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const audWhere = audienceWhereSql(audience)

  const norm = (expr: string) => `LOWER(REGEXP_REPLACE(REPLACE(TRIM(CAST(${expr} AS STRING)), '_', ' '), r'\\s+', ' '))`

  const modeWhere =
    mode === "bucket"
      ? "card_bucket = @value"
      : mode === "competitive_context"
        ? "competitive_positioning_comparative_context = @value"
        : mode === "stance"
          ? "competitive_positioning_stance_toward_alunbrig = @value"
          : mode === "uk_signal"
            ? "EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(uk_access_signals,''), ';')) AS s WHERE TRIM(s) = @value)"
            : `EXISTS (
                SELECT 1
                FROM UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS t
                WHERE ${norm("t")} = ${norm("@value")}
              )`

  const sqlCount = `
    ${getAudienceBaseCteSql()}
    SELECT COUNT(*) AS total
    FROM base
    WHERE ${audWhere}
      AND ${modeWhere}
  `

  const sqlItems = `
    ${getAudienceBaseCteSql()}
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
      card_bucket,
      topics_top_topics,
      topics_key_terms,
      sentiment_drivers,
      entities_competitors,
      entities_drugs_brands,
      post_type_evidence_type,
      uk_access_is_uk_related,
      uk_access_nation_hint,
      uk_access_signals
    FROM base
    WHERE ${audWhere}
      AND ${modeWhere}
    ORDER BY created_ts DESC
    LIMIT @limit
    OFFSET @offset
  `

  try {
    const params = { ...getAudienceBaseParams(filters), audience, value, limit, offset }
    const [countRows, itemRows] = await Promise.all([runQuery<any>(sqlCount, params), runQuery<any>(sqlItems, params)])
    return NextResponse.json({ total: Number(countRows?.[0]?.total || 0), items: itemRows || [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
