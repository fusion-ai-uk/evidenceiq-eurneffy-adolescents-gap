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
    slice AS (SELECT * FROM base WHERE ${audWhere}),
    ctx AS (
      SELECT TRIM(CAST(competitive_positioning_comparative_context AS STRING)) AS context, COUNT(*) AS posts
      FROM slice
      WHERE TRIM(CAST(competitive_positioning_comparative_context AS STRING)) != ''
      GROUP BY context
    ),
    ctx_total AS (SELECT SUM(posts) AS total FROM ctx),
    stance AS (
      SELECT TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)) AS stance, COUNT(*) AS posts
      FROM slice
      WHERE TRIM(CAST(competitive_positioning_stance_toward_alunbrig AS STRING)) != ''
      GROUP BY stance
    ),
    stance_total AS (SELECT SUM(posts) AS total FROM stance),
    comp_tokens AS (
      SELECT TRIM(c) AS competitor
      FROM slice, UNNEST(SPLIT(IFNULL(entities_competitors,''), ';')) AS c
      WHERE TRIM(c) != ''
    ),
    brand_tokens AS (
      SELECT TRIM(b) AS brand
      FROM slice, UNNEST(SPLIT(IFNULL(entities_drugs_brands,''), ';')) AS b
      WHERE TRIM(b) != ''
    ),
    comp_counts AS (SELECT competitor, COUNT(*) AS mentions FROM comp_tokens GROUP BY competitor),
    brand_counts AS (SELECT brand, COUNT(*) AS mentions FROM brand_tokens GROUP BY brand)
    SELECT
      @audience AS audience,
      (SELECT ARRAY_AGG(STRUCT(c.context AS context, c.posts AS posts, SAFE_DIVIDE(c.posts, NULLIF(ct.total,0)) AS share) ORDER BY c.posts DESC)
       FROM ctx c, ctx_total ct) AS competitiveContextShare,
      (SELECT ARRAY_AGG(STRUCT(s.stance AS stance, s.posts AS posts, SAFE_DIVIDE(s.posts, NULLIF(st.total,0)) AS share) ORDER BY s.posts DESC)
       FROM stance s, stance_total st) AS stanceTowardAlunbrig,
      (SELECT ARRAY_AGG(STRUCT(competitor, mentions) ORDER BY mentions DESC LIMIT 25) FROM comp_counts) AS topCompetitorsMentioned,
      (SELECT ARRAY_AGG(STRUCT(brand, mentions) ORDER BY mentions DESC LIMIT 25) FROM brand_counts) AS topBrandsMentioned
  `

  try {
    const params = { ...getAudienceBaseParams(filters), audience }
    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}

    const normalizeLabel = (v: any) => {
      if (typeof v === "string") return v
      if (v && typeof v === "object") return String(v.stance ?? v.context ?? v.label ?? "")
      return ""
    }

    const normalizeShareRow = (x: any, key: "stance" | "context") => {
      // In some BigQuery result shapes, x[key] can come back as a nested STRUCT (e.g. { stance, posts }).
      const nested = x?.[key]
      const label = normalizeLabel(nested ?? x?.[key])
      const posts = Number(x?.posts ?? nested?.posts ?? 0)
      const share = Number(x?.share ?? 0)
      return key === "stance" ? { stance: label, posts, share } : { context: label, posts, share }
    }

    return NextResponse.json({
      audience,
      competitiveContextShare: (r.competitiveContextShare || []).map((x: any) => normalizeShareRow(x, "context")),
      stanceTowardAlunbrig: (r.stanceTowardAlunbrig || []).map((x: any) => normalizeShareRow(x, "stance")),
      topCompetitorsMentioned: r.topCompetitorsMentioned || [],
      topBrandsMentioned: r.topBrandsMentioned || [],
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
