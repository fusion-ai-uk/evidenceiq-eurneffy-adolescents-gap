import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"

// GET /api/audience/overview
// Returns soft-weighted share of voice and audience-weighted sentiment by Category
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const site = (searchParams.get("site") || "").toLowerCase()
  const isCart = site === "cart"
  const isDgh = site === "dgh"
  const siteAll = !isCart && !isDgh
  const posts = process.env.LABELLED_TABLE || "fusion-424109.evidenceiq_zynlonta.topic_labelled_dataset"

  // NHS CAR-T centres canonical list (matching by name keywords). We match in text to approximate site attribution.
  const cartCentres = [
    // London
    "barts", "st barts", "st bart's", "st bartholomew", "st bartholomew's",
    "imperial", "hammersmith",
    "king's college hospital", "kings college hospital", "kch",
    "university college hospital", "uclh",
    "royal marsden", "rmh",
    "great ormond street", "gosh",
    // Cambridge / Oxford
    "addenbrooke", "addenbrookes",
    "churchill hospital", "oxford university hospitals", "ouh",
    // Leeds / Sheffield / Nottingham
    "st james", "bexley wing", "leeds teaching hospitals",
    "royal hallamshire", "sheffield teaching hospitals", "sth",
    "nottingham city hospital",
    // Manchester / Christie / MRI / RMCH
    "the christie", "christie", "manchester royal infirmary", "mri", "royal manchester children's", "rmch",
    // Newcastle
    "freeman hospital", "great north children",
    // Southampton
    "university hospital southampton", "uhs",
    // Birmingham
    "queen elizabeth hospital birmingham", "qe hb", "qehb", "queen elizabeth birmingham",
    // Bristol
    "bristol royal hospital for children",
    // Wales / Scotland / Aberdeen
    "university hospital of wales", "uhw", "cardiff",
    "queen elizabeth university hospital", "qeuh", "glasgow",
    "aberdeen royal infirmary", "ari",
  ]
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const cartRegex = cartCentres.map((s) => escapeRe(s.toLowerCase())).join("|")

  const sql = `
    WITH base AS (
      SELECT
        LOWER(TRIM(Category)) AS category,
        SAFE_CAST(sentiment_compound AS FLOAT64) AS sentiment,
        SAFE_DIVIDE(` +
    "`HCP_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS HCP_w,\n" +
    "        SAFE_DIVIDE(`Patient_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Patient_w,\n" +
    "        SAFE_DIVIDE(`Caregiver_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Caregiver_w,\n" +
    "        SAFE_DIVIDE(`Payer _ NHS Trust_score`, (`HCP_score`+`Patient_score`+`Caregiver_score`+`Payer _ NHS Trust_score`)) AS Payer_w\n" +
    `, CONCAT(IFNULL(text,''), ' ', IFNULL(combined_text_translated,'')) AS fulltext
      FROM \
        \`${posts}\`
      WHERE Category IS NOT NULL AND sentiment_compound IS NOT NULL
        AND (
          @siteAll OR (
            @isCart AND REGEXP_CONTAINS(LOWER(CONCAT(IFNULL(text,''), ' ', IFNULL(combined_text_translated,''))), @cartRegex)
          ) OR (
            @isDgh AND NOT REGEXP_CONTAINS(LOWER(CONCAT(IFNULL(text,''), ' ', IFNULL(combined_text_translated,''))), @cartRegex)
          )
        )
    )
    SELECT
      category,
      SUM(HCP_w)       AS hcp_volume,
      SUM(Patient_w)   AS patient_volume,
      SUM(Caregiver_w) AS caregiver_volume,
      SUM(Payer_w)     AS payer_volume,
      SAFE_DIVIDE(SUM(sentiment * HCP_w),       NULLIF(SUM(HCP_w),0))       AS hcp_sentiment,
      SAFE_DIVIDE(SUM(sentiment * Patient_w),   NULLIF(SUM(Patient_w),0))   AS patient_sentiment,
      SAFE_DIVIDE(SUM(sentiment * Caregiver_w), NULLIF(SUM(Caregiver_w),0)) AS caregiver_sentiment,
      SAFE_DIVIDE(SUM(sentiment * Payer_w),     NULLIF(SUM(Payer_w),0))     AS payer_sentiment
    FROM base
    GROUP BY category
    ORDER BY category
  `

  try {
    const rows = await runQuery(sql, { siteAll, isCart, isDgh, cartRegex })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


