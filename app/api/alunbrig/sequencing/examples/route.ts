import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters, parseGranularity } from "@/lib/alunbrig/sequencingFilters"
import {
  destinationFromDirectionSql,
  directionNormSql,
  getSequencingBaseCteSql,
  getSequencingBaseParams,
  lotNormSql,
  stakeholderBucketSql,
  togglesWhereSql,
} from "@/lib/alunbrig/sequencingSql"

type Mode = "lot" | "direction" | "matrix" | "flow" | "rationale" | "uk_signal" | "period"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)
  const mode = (searchParams.get("mode") || "lot") as Mode
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)))
  const offset = Math.max(0, Number(searchParams.get("offset") || 0))

  const lotValue = (searchParams.get("lotValue") || "").trim()
  const directionValue = (searchParams.get("directionValue") || "").trim()
  const rationaleValue = (searchParams.get("rationaleValue") || "").trim()
  const signalValue = (searchParams.get("signalValue") || "").trim()

  const xDim = (searchParams.get("xDim") || "").trim()
  const yDim = (searchParams.get("yDim") || "").trim()
  const xValue = (searchParams.get("xValue") || "").trim()
  const yValue = (searchParams.get("yValue") || "").trim()

  const sourceNode = (searchParams.get("sourceNode") || "").trim()
  const targetNode = (searchParams.get("targetNode") || "").trim()

  const period = (searchParams.get("period") || "").trim()
  const granularity = parseGranularity(searchParams.get("granularity"))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const lot = lotNormSql()
  const direction = directionNormSql()
  const dest = destinationFromDirectionSql(direction)
  const stakeholderBucket = stakeholderBucketSql()

  const xExpr = `
    CASE @xDim
      WHEN 'stakeholder' THEN ${stakeholderBucket}
      WHEN 'line_of_therapy' THEN CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${lot} END
      WHEN 'biomarker' THEN COALESCE(NULLIF(TRIM(CAST(clinical_context_biomarker AS STRING)), ''), 'unknown')
      WHEN 'uk_nation' THEN COALESCE(NULLIF(TRIM(CAST(uk_access_nation_hint AS STRING)), ''), 'not_uk_or_unknown')
      ELSE 'unknown'
    END
  `

  const yExpr = `
    CASE @yDim
      WHEN 'sequence_direction' THEN CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${direction} END
      WHEN 'attrition' THEN CASE WHEN sequencing_attrition_or_discontinuation THEN 'attrition_mentioned' ELSE 'attrition_not_mentioned' END
      WHEN 'pfs' THEN CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 'pfs_or_pfs2_mentioned' ELSE 'not_mentioned' END
      WHEN 'cns_context' THEN COALESCE(NULLIF(TRIM(CAST(clinical_context_cns_context AS STRING)), ''), 'unknown')
      ELSE 'unknown'
    END
  `

  const periodWhere = `(@period = '' OR (@granularity = 'week' AND created_week = @period) OR (@granularity = 'month' AND created_month = @period))`

  const modeWhere = `
    CASE
      WHEN @mode = 'lot' THEN (CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${lot} END) = @lotValue
      WHEN @mode = 'direction' THEN (CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${direction} END) = @directionValue
      WHEN @mode = 'rationale' THEN TRIM(CAST(sequencing_rationale_short AS STRING)) = @rationaleValue
      WHEN @mode = 'uk_signal' THEN EXISTS (
        SELECT 1 FROM UNNEST(SPLIT(IFNULL(CAST(uk_access_signals AS STRING), ''), ';')) AS s WHERE TRIM(s) = @signalValue
      )
      WHEN @mode = 'matrix' THEN (${xExpr} = @xValue AND ${yExpr} = @yValue)
      WHEN @mode = 'flow' THEN (
        sequencing_is_sequencing_discussed = TRUE
        AND (
          (STARTS_WITH(@sourceNode, 'LoT:') AND STARTS_WITH(@targetNode, 'Dir:')
            AND ${lot} = SUBSTR(@sourceNode, 5)
            AND ${direction} = SUBSTR(@targetNode, 5)
          )
          OR
          (STARTS_WITH(@sourceNode, 'Dir:') AND STARTS_WITH(@targetNode, 'Dest:')
            AND ${direction} = SUBSTR(@sourceNode, 5)
            AND COALESCE(NULLIF(TRIM(CAST(${dest} AS STRING)), ''), 'unknown') = SUBSTR(@targetNode, 6)
          )
        )
      )
      WHEN @mode = 'period' THEN TRUE
      ELSE TRUE
    END
  `

  const sqlCount = `
    ${getSequencingBaseCteSql()}
    SELECT COUNT(*) AS total
    FROM base
    WHERE ${togglesWhereSql()}
      AND ${periodWhere}
      AND ${modeWhere}
  `

  const sqlItems = `
    ${getSequencingBaseCteSql()}
    SELECT
      id,
      url,
      text,
      CAST(created_ts AS STRING) AS created_ts,
      stakeholder_primary,
      sentiment_label,
      sentiment_polarity_minus1_to_1,
      sentiment_drivers,
      engagement,
      viewCount,

      sequencing_is_sequencing_discussed,
      TRIM(CAST(sequencing_line_of_therapy AS STRING)) AS sequencing_line_of_therapy,
      TRIM(CAST(sequencing_sequence_direction AS STRING)) AS sequencing_sequence_direction,
      sequencing_pfs_or_pfs2_mentioned,
      sequencing_attrition_or_discontinuation,
      TRIM(CAST(sequencing_rationale_short AS STRING)) AS sequencing_rationale_short,

      TRIM(CAST(clinical_context_biomarker AS STRING)) AS clinical_context_biomarker,
      TRIM(CAST(clinical_context_cns_context AS STRING)) AS clinical_context_cns_context,

      uk_access_is_uk_related,
      TRIM(CAST(uk_access_nation_hint AS STRING)) AS uk_access_nation_hint,
      TRIM(CAST(uk_access_signals AS STRING)) AS uk_access_signals,

      TRIM(CAST(entities_drugs_brands AS STRING)) AS entities_drugs_brands,
      TRIM(CAST(entities_drugs_generics AS STRING)) AS entities_drugs_generics,
      TRIM(CAST(entities_competitors AS STRING)) AS entities_competitors,

      TRIM(CAST(post_type_evidence_type AS STRING)) AS post_type_evidence_type,
      TRIM(CAST(topics_key_terms AS STRING)) AS topics_key_terms,
      TRIM(CAST(topics_top_topics AS STRING)) AS topics_top_topics
    FROM base
    WHERE ${togglesWhereSql()}
      AND ${periodWhere}
      AND ${modeWhere}
    ORDER BY created_ts DESC
    LIMIT @limit
    OFFSET @offset
  `

  try {
    const params = {
      ...getSequencingBaseParams(filters),
      mode,
      limit,
      offset,
      lotValue,
      directionValue,
      rationaleValue,
      signalValue,
      xDim,
      yDim,
      xValue,
      yValue,
      sourceNode,
      targetNode,
      period,
      granularity,
    }

    const [countRows, itemRows] = await Promise.all([runQuery<any>(sqlCount, params), runQuery<any>(sqlItems, params)])
    return NextResponse.json({ total: Number(countRows?.[0]?.total || 0), items: itemRows || [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
