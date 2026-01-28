import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters } from "@/lib/alunbrig/sequencingFilters"
import {
  destinationFromDirectionSql,
  directionNormSql,
  getSequencingBaseCteSql,
  getSequencingBaseParams,
  lotNormSql,
} from "@/lib/alunbrig/sequencingSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const lot = lotNormSql()
  const direction = directionNormSql()
  const dest = destinationFromDirectionSql(direction)

  const sql = `
    ${getSequencingBaseCteSql()},
    seq AS (
      SELECT
        ${lot} AS lot,
        ${direction} AS direction,
        ${dest} AS destination,
        *
      FROM base
      WHERE sequencing_is_sequencing_discussed = TRUE
        AND (NOT @ukAccessOnly OR (uk_access_is_uk_related = TRUE OR topics_brief_flags_uk_access_or_reimbursement = TRUE))
        AND (NOT @pfsOnly OR sequencing_pfs_or_pfs2_mentioned = TRUE)
    ),
    link_lot_dir AS (
      SELECT
        CONCAT('LoT:', lot) AS source,
        CONCAT('Dir:', direction) AS target,
        COUNT(*) AS value
      FROM seq
      GROUP BY source, target
    ),
    link_dir_dest AS (
      SELECT
        CONCAT('Dir:', direction) AS source,
        CONCAT('Dest:', COALESCE(NULLIF(TRIM(CAST(destination AS STRING)), ''), 'unknown')) AS target,
        COUNT(*) AS value
      FROM seq
      GROUP BY source, target
    ),
    all_links AS (
      SELECT * FROM link_lot_dir
      UNION ALL
      SELECT * FROM link_dir_dest
    ),
    top_links AS (
      SELECT * FROM all_links
      ORDER BY value DESC
      LIMIT 25
    ),
    nodes AS (
      SELECT source AS id FROM top_links
      UNION DISTINCT
      SELECT target AS id FROM top_links
    )
    SELECT
      (SELECT ARRAY_AGG(STRUCT(id, id AS label) ORDER BY id) FROM nodes) AS nodes,
      (SELECT ARRAY_AGG(STRUCT(source, target, value) ORDER BY value DESC) FROM top_links) AS links,
      (SELECT AS STRUCT
        COUNT(*) AS totalSequencingPosts,
        'Flow is sequencing-specific. Links show LoT -> direction and direction -> destination (top 25 by volume).' AS notes
      FROM seq) AS meta
  `

  try {
    const rows = await runQuery<any>(sql, getSequencingBaseParams(filters))
    return NextResponse.json(rows?.[0] || { nodes: [], links: [], meta: { totalSequencingPosts: 0, notes: "" } })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
