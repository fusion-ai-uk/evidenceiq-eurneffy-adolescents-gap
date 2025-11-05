import { NextRequest } from 'next/server'
import { runQuery } from '@/lib/bigquery'

export const revalidate = 0
export const dynamic = 'force-dynamic'

type Granularity = 'day' | 'week' | 'month'

type SeriesPoint = {
  periodStart: string
  count: number
  sentimentAvg: number
  likeSum: number
  viewSum: number
  retweetSum: number
}

type Anomaly = {
  periodStart: string
  type: 'spike' | 'trough'
  count: number
  baseline: number
  pctChange: number
  z: number
}

function computeAnomalies(series: SeriesPoint[], window = 6): Anomaly[] {
  const anomalies: Anomaly[] = []
  for (let i = 0; i < series.length; i++) {
    const end = i - 2
    const start = end - window + 1
    if (start < 0) continue
    const windowPoints = series.slice(start, end + 1)
    const mean = windowPoints.reduce((s, p) => s + p.count, 0) / windowPoints.length
    const variance = windowPoints.reduce((s, p) => s + Math.pow(p.count - mean, 2), 0) / windowPoints.length
    const std = Math.sqrt(variance)
    const current = series[i].count
    const delta = current - mean
    const pctChange = mean === 0 ? 0 : delta / mean
    const z = std === 0 ? 0 : delta / std
    if (mean >= 10 && Math.abs(pctChange) >= 0.15 && Math.abs(z) >= 2) {
      anomalies.push({
        periodStart: series[i].periodStart,
        type: delta >= 0 ? 'spike' : 'trough',
        count: current,
        baseline: Math.round(mean),
        pctChange,
        z,
      })
    }
  }
  return anomalies
}

function parseDate(s?: string, fallbackDays = 365): string {
  if (!s) {
    const d = new Date()
    d.setDate(d.getDate() - fallbackDays)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  return new Date(s).toISOString()
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const labelledTable = process.env.LABELLED_TABLE || 'fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset'
  const usingTimeSeries = /topic_data_time_series/i.test(labelledTable)
  const fulltextExpr = usingTimeSeries
    ? "CONCAT(IFNULL(\`Topic Title\`, ''), ' ', IFNULL(\`Topic Summary\`, ''))"
    : "CONCAT(IFNULL(text,''), ' ', IFNULL(combined_text_translated,''))"
  const startDate = parseDate(searchParams.get('startDate'))
  const endDate = parseDate(searchParams.get('endDate') || new Date().toISOString())
  const granularity = (searchParams.get('granularity') as Granularity) || 'week'
  const sentimentMin = Number(searchParams.get('sentimentMin') ?? -1)
  const sentimentMax = Number(searchParams.get('sentimentMax') ?? 1)
  const minLikes = Number(searchParams.get('minLikes') ?? 0)
  const minRetweets = Number(searchParams.get('minRetweets') ?? 0)
  const minViews = Number(searchParams.get('minViews') ?? 0)
  const q = (searchParams.get('q') || '').trim().toLowerCase()

  const includeHCP = searchParams.get('hcp') === 'true'
  const includePatient = searchParams.get('patient') === 'true'
  const includeCaregiver = searchParams.get('caregiver') === 'true'
  const includePayer = searchParams.get('payer') === 'true'
  const threshold = Number(searchParams.get('stakeholderThreshold') ?? 0.5)

  const categoriesRaw = (searchParams.get('categories') || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  // BigQuery requires array parameter types even for empty arrays; ensure non-empty with a harmless sentinel.
  const categories = categoriesRaw.length ? categoriesRaw : ['__all__']
  const sentimentBucketsRaw = (searchParams.get('sentimentBuckets') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  // Ensure non-empty array param to avoid BigQuery empty-array type errors
  const sentimentBuckets = sentimentBucketsRaw.length ? sentimentBucketsRaw : ['__any__']

  const sql = `
    DECLARE threshold FLOAT64 DEFAULT @threshold;
    WITH raw AS (
      SELECT
        COALESCE(
          SAFE_CAST(createdAt AS TIMESTAMP),
          SAFE.PARSE_TIMESTAMP('%Y-%m-%d %H:%M:%E*S', createdAt),
          SAFE.PARSE_TIMESTAMP('%Y-%m-%d', createdAt),
          SAFE.PARSE_TIMESTAMP('%d/%m/%Y', createdAt),
          SAFE.PARSE_TIMESTAMP('%m/%d/%Y', createdAt)
        ) AS ts,
        sentiment_compound AS sentiment,
        retweetCount, replyCount, likeCount, viewCount,
        LOWER(TRIM(Category)) AS category,
        HCP_score, Patient_score, Caregiver_score, \`Payer _ NHS Trust_score\` AS payerScore,
        ${fulltextExpr} AS fulltext
      FROM \`${labelledTable}\`
      WHERE COALESCE(
          SAFE_CAST(createdAt AS TIMESTAMP),
          SAFE.PARSE_TIMESTAMP('%Y-%m-%d %H:%M:%E*S', createdAt),
          SAFE.PARSE_TIMESTAMP('%Y-%m-%d', createdAt),
          SAFE.PARSE_TIMESTAMP('%d/%m/%Y', createdAt),
          SAFE.PARSE_TIMESTAMP('%m/%d/%Y', createdAt)
        ) BETWEEN TIMESTAMP(@startDate) AND TIMESTAMP_ADD(TIMESTAMP(@endDate), INTERVAL 1 DAY)
        AND likeCount >= @minLikes
        AND retweetCount >= @minRetweets
        AND viewCount >= @minViews
        AND (sentiment_compound BETWEEN @sentimentMin AND @sentimentMax)
        AND (@catsEmpty OR LOWER(TRIM(Category)) IN UNNEST(@categories))
    ),
    src AS (
      SELECT
        CASE @granularity
          WHEN 'day' THEN TIMESTAMP_TRUNC(ts, DAY)
          WHEN 'week' THEN TIMESTAMP_TRUNC(ts, WEEK(MONDAY))
          ELSE TIMESTAMP_TRUNC(ts, MONTH)
        END AS period,
        sentiment,
        retweetCount, replyCount, likeCount, viewCount,
        category, HCP_score, Patient_score, Caregiver_score, payerScore,
        fulltext
      FROM raw
      WHERE (
        @stakeholdersAll OR (
          (@includeHCP AND HCP_score >= threshold) OR
          (@includePatient AND Patient_score >= threshold) OR
          (@includeCaregiver AND Caregiver_score >= threshold) OR
          (@includePayer AND payerScore >= threshold)
        )
      )
      AND (
        @sentimentEmpty OR CASE
          WHEN sentiment <= -0.6 THEN 'strong_neg'
          WHEN sentiment > -0.6 AND sentiment < -0.2 THEN 'neg'
          WHEN sentiment >= -0.2 AND sentiment <= 0.2 THEN 'neu'
          WHEN sentiment > 0.2 AND sentiment < 0.6 THEN 'pos'
          ELSE 'strong_pos'
        END IN UNNEST(@sentimentBuckets)
      )
    ),
    base AS (
      SELECT * FROM src WHERE (@qEmpty OR LOWER(fulltext) LIKE CONCAT('%', @qQuery, '%'))
    ),
    agg AS (
      SELECT
        period,
        COUNT(*) AS count,
        AVG(sentiment) AS sentimentAvg,
        SUM(retweetCount) AS retweetSum,
        SUM(likeCount) AS likeSum,
        SUM(viewCount) AS viewSum
      FROM base
      GROUP BY period
      ORDER BY period
    )
    SELECT * FROM agg
  `

  const params: any = {
    granularity,
    startDate,
    endDate,
    minLikes,
    minRetweets,
    minViews,
    sentimentMin,
    sentimentMax,
    categories,
    catsEmpty: categoriesRaw.length === 0,
    sentimentBuckets,
    sentimentEmpty: sentimentBucketsRaw.length === 0,
    includeHCP,
    includePatient,
    includeCaregiver,
    includePayer,
    stakeholdersAll: !includeHCP && !includePatient && !includeCaregiver && !includePayer,
    threshold,
    qEmpty: q.length === 0,
    qQuery: q.length ? q.replace(/[^a-z0-9\s]/g, '') : '',
  }

  let rows: any[] = []
  try {
    rows = await runQuery<any>(sql, params)
  } catch (err: any) {
    console.error('[timeseries] query failed', err)
    return new Response(JSON.stringify({ error: 'query_failed', message: String(err?.message || err) }), { status: 500 })
  }

  const series: SeriesPoint[] = rows.map((r: any) => ({
    periodStart: new Date((r.period?.value ?? r.period ?? r.period_start ?? r.periodStart)).toISOString(),
    count: Number(r.count || 0),
    sentimentAvg: Number(r.sentimentAvg || 0),
    likeSum: Number(r.likeSum || 0),
    viewSum: Number(r.viewSum || 0),
    retweetSum: Number(r.retweetSum || 0),
  }))

  // Compute anomalies using views so spike/trough markers align with the chart metric
  const anomalies = computeAnomalies(series.map((p) => ({ ...p, count: p.viewSum } as any)))
  const spikes = anomalies.filter((a) => a.type === 'spike')
  const troughs = anomalies.filter((a) => a.type === 'trough')

  return new Response(
    JSON.stringify({ series, spikes, troughs, meta: { granularity, startDate, endDate } }),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  )
}


