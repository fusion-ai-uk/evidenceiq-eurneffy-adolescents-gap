const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me"
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 3 // 3 days
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmacSha256Base64Url(value: string) {
  const key = await crypto.subtle.importKey("raw", textEncoder.encode(AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ])
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value))
  return toBase64Url(new Uint8Array(signature))
}

export async function signSession(payload: object) {
  const body = toBase64Url(textEncoder.encode(JSON.stringify(payload)))
  const sig = await hmacSha256Base64Url(body)
  return `${body}.${sig}`
}

export async function verifySession(session: string | undefined | null) {
  if (!session) return null
  const [body, sig] = session.split(".")
  if (!body || !sig) return null

  const expectedSig = await hmacSha256Base64Url(body)
  if (sig !== expectedSig) return null

  try {
    const payload = JSON.parse(textDecoder.decode(fromBase64Url(body))) as { email?: unknown; ts?: unknown }
    if (typeof payload.email !== "string") return null
    if (typeof payload.ts !== "number") return null

    const now = Date.now()
    if (payload.ts > now + 5 * 60 * 1000) return null
    if (now - payload.ts > SESSION_MAX_AGE_MS) return null

    return { email: payload.email, ts: payload.ts }
  } catch {
    return null
  }
}

