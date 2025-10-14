import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { milestones } from "@/lib/milestones"

// GET /api/timeseries/alerts
// Computes latest month vs prior 6-month baseline by category, returns top deltas with enrichment
// Query params:
// - minBaseline: minimum baseline volume to include (default 10)
// - limit: max rows (default 10)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // Prefer labelled dataset for enrichment; fall back to timeseries table name if provided
  const labelledTable = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const minBaseline = Math.max(0, Number(searchParams.get("minBaseline") || 10))
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 10)))

  const sql = `
    DECLARE threshold FLOAT64 DEFAULT 0.5;
    WITH raw AS (
      SELECT
        DATE_TRUNC(DATE(
          COALESCE(
            SAFE_CAST(createdAt AS TIMESTAMP),
            SAFE.PARSE_TIMESTAMP('%Y-%m-%d %H:%M:%E*S', CAST(createdAt AS STRING)),
            SAFE.PARSE_TIMESTAMP('%Y-%m-%d', CAST(createdAt AS STRING)),
            SAFE.PARSE_TIMESTAMP('%d/%m/%Y', CAST(createdAt AS STRING)),
            SAFE.PARSE_TIMESTAMP('%m/%d/%Y', CAST(createdAt AS STRING))
          )
        ), MONTH) AS month,
        LOWER(TRIM(Category)) AS category,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_CAST(HCP_score AS FLOAT64) AS hcp,
        SAFE_CAST(Patient_score AS FLOAT64) AS patient,
        SAFE_CAST(Caregiver_score AS FLOAT64) AS caregiver,
        SAFE_CAST(\`Payer _ NHS Trust_score\` AS FLOAT64) AS payer,
        LOWER(CONCAT(IFNULL(text,''), ' ', IFNULL(combined_text_translated,''))) AS fulltext
      FROM \`${labelledTable}\`
      WHERE Category IS NOT NULL AND createdAt IS NOT NULL
    ),
    monthly AS (
      SELECT
        month,
        category,
        COUNT(1) AS volume,
        AVG(sentiment) AS sentiment_avg,
        SUM(CASE WHEN hcp >= threshold THEN 1 ELSE 0 END) AS hcp_count,
        SUM(CASE WHEN patient >= threshold THEN 1 ELSE 0 END) AS patient_count,
        SUM(CASE WHEN caregiver >= threshold THEN 1 ELSE 0 END) AS caregiver_count,
        SUM(CASE WHEN payer >= threshold THEN 1 ELSE 0 END) AS payer_count,
        -- keyword drivers (current month will surface these)
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'(rash|photosens)') THEN 1 ELSE 0 END) AS kw_rash,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'\\b(crs|cytokine release)\\b') THEN 1 ELSE 0 END) AS kw_crs,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'icans|neurotox') THEN 1 ELSE 0 END) AS kw_icans,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'\\b(nice|ta947)\\b') THEN 1 ELSE 0 END) AS kw_nice,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'car-?t') THEN 1 ELSE 0 END) AS kw_cart,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'epcoritamab|epco\\b') THEN 1 ELSE 0 END) AS kw_epco,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'glofitamab|glofit\\b') THEN 1 ELSE 0 END) AS kw_glofit,
        SUM(CASE WHEN REGEXP_CONTAINS(fulltext, r'durab|fixed[-\\s]?duration') THEN 1 ELSE 0 END) AS kw_durability
      FROM raw
      GROUP BY month, category
    ),
    latest AS (
      SELECT MAX(month) AS m_latest FROM monthly
    ),
    baseline AS (
      SELECT m.category,
             AVG(m.volume) AS baseline_volume,
             AVG(m.sentiment_avg) AS baseline_sentiment,
             AVG(m.hcp_count) AS hcp_baseline,
             AVG(m.patient_count) AS patient_baseline,
             AVG(m.caregiver_count) AS caregiver_baseline,
             AVG(m.payer_count) AS payer_baseline
      FROM monthly m, latest l
      WHERE m.month < l.m_latest AND m.month >= DATE_SUB(l.m_latest, INTERVAL 6 MONTH)
      GROUP BY m.category
    ),
    current_month AS (
      SELECT
        m.category,
        SUM(m.volume) AS current_volume,
        AVG(m.sentiment_avg) AS current_sentiment,
        SUM(m.hcp_count) AS hcp_current,
        SUM(m.patient_count) AS patient_current,
        SUM(m.caregiver_count) AS caregiver_current,
        SUM(m.payer_count) AS payer_current,
        SUM(m.kw_rash) AS kw_rash,
        SUM(m.kw_crs) AS kw_crs,
        SUM(m.kw_icans) AS kw_icans,
        SUM(m.kw_nice) AS kw_nice,
        SUM(m.kw_cart) AS kw_cart,
        SUM(m.kw_epco) AS kw_epco,
        SUM(m.kw_glofit) AS kw_glofit,
        SUM(m.kw_durability) AS kw_durability
      FROM monthly m, latest l
      WHERE m.month = l.m_latest
      GROUP BY m.category
    )
    SELECT
      c.category,
      c.current_volume,
      b.baseline_volume,
      SAFE_DIVIDE(c.current_volume - b.baseline_volume, b.baseline_volume) * 100 AS pct_change,
      c.current_sentiment,
      b.baseline_sentiment,
      c.hcp_current, c.patient_current, c.caregiver_current, c.payer_current,
      b.hcp_baseline, b.patient_baseline, b.caregiver_baseline, b.payer_baseline,
      c.kw_rash, c.kw_crs, c.kw_icans, c.kw_nice, c.kw_cart, c.kw_epco, c.kw_glofit, c.kw_durability
    FROM current_month c
    JOIN baseline b USING (category)
    WHERE b.baseline_volume >= @minBaseline
    ORDER BY pct_change DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery<any[]>(sql, {
      minBaseline,
      limit,
    })
    const enriched = rows.map((r) => {
      const hcpDelta = Number(r.hcp_current || 0) - Number(r.hcp_baseline || 0)
      const patientDelta = Number(r.patient_current || 0) - Number(r.patient_baseline || 0)
      const caregiverDelta = Number(r.caregiver_current || 0) - Number(r.caregiver_baseline || 0)
      const payerDelta = Number(r.payer_current || 0) - Number(r.payer_baseline || 0)
      const pairs = [
        { key: 'hcp', delta: hcpDelta },
        { key: 'patient', delta: patientDelta },
        { key: 'caregiver', delta: caregiverDelta },
        { key: 'payer', delta: payerDelta },
      ] as const
      pairs.sort((a, b) => b.delta - a.delta)
      const leader = pairs[0].delta > 0 ? pairs[0].key : 'mixed'
      const sentiment_delta = Number(r.current_sentiment || 0) - Number(r.baseline_sentiment || 0)
      const drivers: string[] = []
      if (Number(r.kw_durability || 0) > 0) drivers.push('durability')
      if (Number(r.kw_rash || 0) > 0) drivers.push('photosensitivity')
      if (Number(r.kw_crs || 0) > 0) drivers.push('CRS')
      if (Number(r.kw_icans || 0) > 0) drivers.push('ICANS/neurotox')
      if (Number(r.kw_nice || 0) > 0) drivers.push('NICE/TA947')
      if (Number(r.kw_cart || 0) > 0) drivers.push('CAR-T')
      if (Number(r.kw_epco || 0) > 0) drivers.push('Epcoritamab')
      if (Number(r.kw_glofit || 0) > 0) drivers.push('Glofitamab')

      // Priority: magnitude x scale x tone-risk
      const magnitude = Math.abs(Number(r.pct_change || 0)) / 100
      const scale = Math.log10(Math.max(10, Number(r.current_volume || 0))) / 3
      const toneRisk = sentiment_delta < -0.05 ? 1.2 : sentiment_delta > 0.05 ? 0.9 : 1.0
      const priority = Math.round(100 * magnitude * scale * toneRisk)

      return {
        category: r.category,
        current_volume: r.current_volume,
        baseline_volume: r.baseline_volume,
        pct_change: r.pct_change,
        sentiment_current: r.current_sentiment,
        sentiment_baseline: r.baseline_sentiment,
        sentiment_delta,
        leader_audience: leader,
        drivers,
        priority,
      }
    })

  
    let milestone: any = null
    try {
      const now = new Date()
      const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
      const m = milestones.find((x) => x.date.slice(0, 7) === key)
      if (m) milestone = { date: m.date, title: m.title, impact: m.impact }
    } catch {}

    return NextResponse.json({ rows: enriched, milestone })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


