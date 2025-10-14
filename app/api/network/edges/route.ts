import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/network/edges
// Returns top co-mention edges with sentiment and top topics/categories
export async function GET() {
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  const sql = `
    WITH entity_lexicon AS (
      SELECT 'Zynlonta' AS entity, 'Drug' AS type, r'(?i)\\bzynlonta\\b|\\bloncastuximab(?:\\s+tesirine)?\\b|\\blonca\\b' AS rx UNION ALL
      SELECT 'Epcoritamab','Drug', r'(?i)\\bepcoritamab\\b|\\bepkinly\\b|\\btepkinly\\b' UNION ALL
      SELECT 'Glofitamab','Drug', r'(?i)\\bglofitamab\\b|\\bcolumvi\\b' UNION ALL
      SELECT 'Polatuzumab','Drug', r'(?i)\\bpolatuzumab\\b|\\bpolivy\\b' UNION ALL
      SELECT 'CAR-T','Class', r'(?i)\\bcar[-\\s]?t\\b' UNION ALL
      SELECT 'Bispecifics','Class', r'(?i)\\bbispecifics?\\b|\\bcd20\\s*x\\s*cd3\\b|\\bt[- ]?cell engager(s)?\\b' UNION ALL
      SELECT 'ADC','Class', r'(?i)\\badc(s)?\\b|\\bantibody[-\\s]?drug conjugate(s)?\\b' UNION ALL
      SELECT 'DLBCL','Indication', r'(?i)\\bdlbcl\\b|\\bdiffuse large b-?cell lymphoma\\b|\\bhgbl\\b' UNION ALL
      SELECT 'NICE','Payer', r'(?i)\\bnice\\b' UNION ALL
      SELECT 'NHS','Payer', r'(?i)\\bnhs( england)?\\b' UNION ALL
      SELECT 'ASH','Event', r'(?i)\\bash\\b|\\bamerican society of hematology\\b' UNION ALL
      SELECT 'EHA','Event', r'(?i)\\beha\\b|\\beuropean hematology association\\b' UNION ALL
      SELECT 'LOTIS-2','Trial', r'(?i)\\blotis[-\\s]?2\\b' UNION ALL
      SELECT 'EPCORE NHL-1','Trial', r'(?i)\\bepcore nhl[-\\s]?1\\b' UNION ALL
      SELECT 'NP30179','Trial', r'(?i)\\bnp30179\\b' UNION ALL
      SELECT 'ZUMA-1','Trial', r'(?i)\\bzuma[-\\s]?1\\b' UNION ALL
      SELECT 'TRANSCEND NHL 001','Trial', r'(?i)\\btranscend nhl 001\\b'
    ),
    base AS (
      SELECT
        LOWER(COALESCE(CAST(combined_text_translated AS STRING), CAST(text AS STRING))) AS body,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        Category,
        ` + "`Topic Title`" + ` AS TopicTitle
      FROM \`` + posts + `\`
    ),
    row_ents AS (
      SELECT
        FORMAT('%t', STRUCT(b.Category AS Category, b.TopicTitle AS TopicTitle)) AS row_key,
        b.Category, b.TopicTitle, b.sentiment,
        ARRAY_AGG(DISTINCT l.entity ORDER BY l.entity) AS ents
      FROM base b
      JOIN entity_lexicon l ON REGEXP_CONTAINS(b.body, l.rx)
      GROUP BY row_key, Category, TopicTitle, sentiment
    ),
    pairs AS (
      SELECT e1 AS a, e2 AS b, Category, TopicTitle, sentiment
      FROM row_ents re,
        UNNEST(re.ents) AS e1 WITH OFFSET i,
        UNNEST(re.ents) AS e2 WITH OFFSET j
      WHERE i < j
    )
    SELECT a AS source, b AS target,
      COUNT(*) AS weight,
      AVG(sentiment) AS avg_sentiment,
      CASE WHEN AVG(sentiment) > 0.05 THEN 'positive' WHEN AVG(sentiment) < -0.05 THEN 'negative' ELSE 'neutral' END AS sentiment_bucket,
      ARRAY(SELECT t FROM UNNEST(ARRAY_AGG(TopicTitle)) t GROUP BY t ORDER BY COUNT(*) DESC LIMIT 3) AS top_topics,
      ARRAY(SELECT c FROM UNNEST(ARRAY_AGG(Category)) c GROUP BY c ORDER BY COUNT(*) DESC LIMIT 3) AS top_categories
    FROM pairs
    GROUP BY source, target
    ORDER BY weight DESC
  `

  try {
    const rows = await runQuery(sql)
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


