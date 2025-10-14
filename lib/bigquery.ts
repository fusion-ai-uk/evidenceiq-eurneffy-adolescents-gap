import { BigQuery } from "@google-cloud/bigquery"
import fs from "node:fs"

export function getBigQueryClient() {
  // Prefer inline JSON creds in Vercel env
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.BIGQUERY_PROJECT_ID
  const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_CREDENTIALS

  const options: ConstructorParameters<typeof BigQuery>[0] = {}
  if (projectId) options.projectId = projectId

  if (inlineJson) {
    const creds = JSON.parse(inlineJson)
    // Provide credentials via options
    options.credentials = {
      client_email: creds.client_email,
      private_key: (creds.private_key as string)?.replace(/\\n/g, "\n"),
    }
    // Also write a temp credentials file for any library path lookups (ADC)
    try {
      const tmpPath = "/tmp/gcp-key.json"
      fs.writeFileSync(tmpPath, inlineJson)
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath
    } catch {}
  }

  return new BigQuery(options)
}

export async function runQuery<T = unknown>(sql: string, params?: Record<string, unknown>) {
  const client = getBigQueryClient()
  const [job] = await client.createQueryJob({
    query: sql,
    params,
  })
  const [rows] = await job.getQueryResults()
  return rows as T[]
}


