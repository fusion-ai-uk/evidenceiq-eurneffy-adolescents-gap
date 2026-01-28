import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAudienceGlobalFilters } from "@/lib/alunbrig/audienceFilters"
import { getAudienceBaseCteSql, getAudienceBaseParams, hardGroupSql } from "@/lib/alunbrig/audienceSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAudienceGlobalFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const sql = `
    ${getAudienceBaseCteSql()}
    , soft AS (
      SELECT
        SUM(COALESCE(l_hcp,0)) AS s_hcp,
        SUM(COALESCE(l_patient,0)) AS s_patient,
        SUM(COALESCE(l_caregiver,0)) AS s_caregiver,
        SUM(COALESCE(l_payer,0)) AS s_payer,
        SUM(COALESCE(l_other,0)) AS s_other,
        SUM(COALESCE(l_hcp,0)+COALESCE(l_patient,0)+COALESCE(l_caregiver,0)+COALESCE(l_payer,0)+COALESCE(l_other,0)) AS s_total
      FROM base
    ),
    hard AS (
      SELECT
        ${hardGroupSql()} AS audience,
        COUNT(*) AS posts
      FROM base
      GROUP BY audience
    ),
    hard_total AS (SELECT SUM(posts) AS total_posts FROM hard),
    hard_with_share AS (
      SELECT
        h.audience,
        h.posts,
        SAFE_DIVIDE(h.posts, ht.total_posts) AS share
      FROM hard h
      CROSS JOIN hard_total ht
    ),
    flag_rates AS (
      SELECT
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_caregiver_burden THEN 1 ELSE 0 END) AS pctCaregiverBurden,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM base
    )
    SELECT
      (SELECT AS STRUCT
        SAFE_DIVIDE(s_hcp, NULLIF(s_total,0)) AS HCP,
        SAFE_DIVIDE(s_patient, NULLIF(s_total,0)) AS Patient,
        SAFE_DIVIDE(s_caregiver, NULLIF(s_total,0)) AS Caregiver,
        SAFE_DIVIDE(s_payer, NULLIF(s_total,0)) AS Payer,
        SAFE_DIVIDE(s_other, NULLIF(s_total,0)) AS Other
      FROM soft) AS softShares,
      (SELECT AS STRUCT
        IFNULL((SELECT AS STRUCT posts, share FROM hard_with_share WHERE audience='HCP'), STRUCT(0 AS posts, 0.0 AS share)) AS HCP,
        IFNULL((SELECT AS STRUCT posts, share FROM hard_with_share WHERE audience='Patient'), STRUCT(0 AS posts, 0.0 AS share)) AS Patient,
        IFNULL((SELECT AS STRUCT posts, share FROM hard_with_share WHERE audience='Caregiver'), STRUCT(0 AS posts, 0.0 AS share)) AS Caregiver,
        IFNULL((SELECT AS STRUCT posts, share FROM hard_with_share WHERE audience='Payer'), STRUCT(0 AS posts, 0.0 AS share)) AS Payer,
        IFNULL((SELECT AS STRUCT posts, share FROM hard_with_share WHERE audience='Other'), STRUCT(0 AS posts, 0.0 AS share)) AS Other
      ) AS hardShares,
      (SELECT AS STRUCT * FROM flag_rates) AS flagRatesOverall
  `

  try {
    const rows = await runQuery<any>(sql, getAudienceBaseParams(filters))
    const r = rows?.[0] || {}

    return NextResponse.json({
      dateRange: { startDate: filters.startDate, endDate: filters.endDate },
      softShares: {
        HCP: Number(r?.softShares?.HCP || 0),
        Patient: Number(r?.softShares?.Patient || 0),
        Caregiver: Number(r?.softShares?.Caregiver || 0),
        Payer: Number(r?.softShares?.Payer || 0),
        Other: Number(r?.softShares?.Other || 0),
      },
      hardShares: {
        HCP: { posts: Number(r?.hardShares?.HCP?.posts || 0), share: Number(r?.hardShares?.HCP?.share || 0) },
        Patient: { posts: Number(r?.hardShares?.Patient?.posts || 0), share: Number(r?.hardShares?.Patient?.share || 0) },
        Caregiver: { posts: Number(r?.hardShares?.Caregiver?.posts || 0), share: Number(r?.hardShares?.Caregiver?.share || 0) },
        Payer: { posts: Number(r?.hardShares?.Payer?.posts || 0), share: Number(r?.hardShares?.Payer?.share || 0) },
        Other: { posts: Number(r?.hardShares?.Other?.posts || 0), share: Number(r?.hardShares?.Other?.share || 0) },
      },
      flagRatesOverall: {
        pctSequencing: Number(r?.flagRatesOverall?.pctSequencing || 0),
        pctQoL: Number(r?.flagRatesOverall?.pctQoL || 0),
        pctNeurotox: Number(r?.flagRatesOverall?.pctNeurotox || 0),
        pctCaregiverBurden: Number(r?.flagRatesOverall?.pctCaregiverBurden || 0),
        pctCNS: Number(r?.flagRatesOverall?.pctCNS || 0),
        pctUKAccess: Number(r?.flagRatesOverall?.pctUKAccess || 0),
      },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
