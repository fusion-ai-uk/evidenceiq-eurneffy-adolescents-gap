(async () => {
  const { runQuery } = require("./lib/bigquery")
  const table = process.env.BQ_MAIN_TABLE
  const sql = `
    WITH raw AS (
      SELECT
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS d,
        LOWER(TRIM(CAST(data_quality_keep_for_analysis AS STRING))) AS keep_raw,
        relevance_label
      FROM \`${table}\`
      WHERE SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) IS NOT NULL
    )
    SELECT
      COUNT(*) AS c,
      COUNTIF(keep_raw IN ('true','1','yes')) AS keep,
      COUNTIF(keep_raw IN ('true','1','yes') AND d BETWEEN @startDate AND @endDate) AS keepInRange,
      COUNTIF(keep_raw IN ('true','1','yes') AND d BETWEEN @startDate AND @endDate AND relevance_label IN ('high','medium')) AS keepInRangeHighMed
    FROM raw
  `

  const rows = await runQuery(sql, { startDate: '2024-06-14', endDate: '2026-01-19' })
  console.log(rows[0])
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
