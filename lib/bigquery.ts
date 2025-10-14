import { BigQuery } from "@google-cloud/bigquery"

export function getBigQueryClient() {
  // Prefer inline JSON creds in Vercel env
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.BIGQUERY_PROJECT_ID
  const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_CREDENTIALS

  const options: ConstructorParameters<typeof BigQuery>[0] = {}
  if (projectId) options.projectId = projectId

  if (inlineJson) {
    const creds = JSON.parse(inlineJson)
    options.credentials = {
      client_email: creds.client_email,
      private_key: creds.private_key?.replace(/\\n/g, '\n'),
    }
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


