import { BigQuery } from "@google-cloud/bigquery"

export function getBigQueryClient() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
  const keyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  const options: ConstructorParameters<typeof BigQuery>[0] = {}
  if (projectId) options.projectId = projectId

  if (keyJson) {
    const creds = JSON.parse(keyJson)
    options.credentials = {
      client_email: creds.client_email,
      private_key: creds.private_key,
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


