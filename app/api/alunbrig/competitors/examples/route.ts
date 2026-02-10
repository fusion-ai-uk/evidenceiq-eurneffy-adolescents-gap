import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getCompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import { getCompetitorBaseCteSql, getCompetitorBaseParams } from "@/lib/alunbrig/competitorSql"

type Mode = "competitor" | "stance" | "attribute" | "context" | "driver" | "key_term"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getCompetitorLensFilters(searchParams)
  const competitor = (searchParams.get("competitor") || "").trim()
  const mode = (searchParams.get("mode") || "competitor") as Mode
  const value = (searchParams.get("value") || "").trim()
  const period = (searchParams.get("period") || "").trim()
  const granularity = ((searchParams.get("granularity") || "") as "week" | "month" | "") || ""
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)))
  const offset = Math.max(0, Number(searchParams.get("offset") || 0))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  // IMPORTANT: wrap the OR condition so it composes correctly with additional AND filters.
  // Without these parentheses, when competitorEnabled=false the WHERE clause becomes true
  // and mode/period filters are effectively ignored due to SQL operator precedence.
  const competitorWhere = `
    (
      (NOT @competitorEnabled)
      OR (
        EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS t WHERE TRIM(t) = @competitor)
        OR EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b WHERE TRIM(b) = @competitor)
      )
    )
  `

  const attrWhere = `
    CASE
      WHEN @value = 'Efficacy' THEN topics_brief_flags_efficacy_outcomes
      WHEN @value = 'Safety' THEN topics_brief_flags_safety_or_tolerability
      WHEN @value = 'Neurotox' THEN topics_brief_flags_neuro_or_cognitive_toxicity
      WHEN @value = 'QoL' THEN topics_brief_flags_quality_of_life
      WHEN @value = 'CNS' THEN topics_brief_flags_cns_or_brain_mets
      WHEN @value = 'Access' THEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related)
      WHEN @value = 'Sequencing' THEN sequencing_is_sequencing_discussed
      WHEN @value = 'Other' THEN NOT(
        topics_brief_flags_efficacy_outcomes
        OR topics_brief_flags_safety_or_tolerability
        OR topics_brief_flags_neuro_or_cognitive_toxicity
        OR topics_brief_flags_quality_of_life
        OR topics_brief_flags_cns_or_brain_mets
        OR topics_brief_flags_uk_access_or_reimbursement
        OR uk_access_is_uk_related
        OR sequencing_is_sequencing_discussed
      )
      ELSE FALSE
    END
  `

  const modeWhere =
    mode === "stance"
      ? "IFNULL(NULLIF(TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)), ''), 'unclear') = @value"
      : mode === "context"
        ? "TRIM(CAST(competitive_positioning_comparative_context AS STRING)) = @value"
        : mode === "driver"
          ? "EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(sentiment_drivers AS STRING), ''), ';')) AS d WHERE TRIM(d) = @value)"
          : mode === "key_term"
            ? "EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(topics_key_terms AS STRING), ''), ';')) AS t WHERE TRIM(t) = @value)"
            : mode === "attribute"
              ? attrWhere
              : `(
                  EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_competitors AS STRING), ''), ';')) AS t WHERE TRIM(t) = @value)
                  OR EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b WHERE TRIM(b) = @value)
                )`

  const periodWhere = "(@period = '' OR (@granularity = 'week' AND created_week = @period) OR (@granularity = 'month' AND created_month = @period))"

  const sqlCount = `
    ${getCompetitorBaseCteSql()}
    SELECT COUNT(*) AS total
    FROM base
    WHERE ${competitorWhere}
      AND ${modeWhere}
      AND ${periodWhere}
  `

  const sqlItems = `
    ${getCompetitorBaseCteSql()}
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
      competitive_positioning_comparative_context,
      competitive_positioning_stance_toward_alunbrig,
      sentiment_drivers,
      topics_key_terms,
      topics_top_topics,
      entities_competitors,
      entities_drugs_brands,
      card_bucket,
      post_type_evidence_type,
      uk_access_is_uk_related,
      uk_access_nation_hint
    FROM base
    WHERE ${competitorWhere}
      AND ${modeWhere}
      AND ${periodWhere}
    ORDER BY created_ts DESC
    LIMIT @limit
    OFFSET @offset
  `

  try {
    const params = {
      ...getCompetitorBaseParams(filters),
      competitor,
      competitorEnabled: competitor !== "",
      value,
      period,
      granularity,
      limit,
      offset,
    }
    const [countRows, itemRows] = await Promise.all([runQuery<any>(sqlCount, params), runQuery<any>(sqlItems, params)])
    return NextResponse.json({ total: Number(countRows?.[0]?.total || 0), items: itemRows || [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
