import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { config } from '../config.js'

/**
 * Derives the Clerk Frontend API domain from the publishable key.
 * e.g. "pk_test_Y3J1Y2lhbC1taW5r...JA" -> "crucial-mink-6665.clerk.accounts.dev"
 */
function clerkDomain(): string | null {
  const key = config.clerk.publishableKey
  if (!key) return null
  const part = key.split('_').at(-1)
  if (!part) return null
  const decoded = Buffer.from(part, 'base64').toString('utf-8')
  const domain = decoded.replace(/\$$/, '').trim()
  return domain || null
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks() {
  if (jwks) return jwks
  const domain = clerkDomain()
  if (!domain) throw new Error('Clerk publishable key is not configured')
  jwks = createRemoteJWKSet(
    new URL(`https://${domain}/.well-known/jwks.json`),
  )
  return jwks
}

export interface ClerkSession {
  subject: string
  email: string | null
}

/** Verifies a Clerk session JWT against the instance's public JWKS. */
export async function verifyClerkJwt(token: string): Promise<ClerkSession> {
  const domain = clerkDomain()
  if (!domain) throw new Error('Clerk publishable key is not configured')
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: `https://${domain}`,
    algorithms: ['RS256'],
  })
  return normalizePayload(payload)
}

/** Resolves the user's primary email from the Clerk Users API (requires a secret key). */
async function emailFromClerkApi(userId: string): Promise<string | null> {
  if (!config.clerk.secretKey) return null
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${config.clerk.secretKey}` },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      email_addresses?: Array<{ email_address: string; id: string }>
      primary_email_address_id?: string
    }
    const primary = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id,
    )
    return primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? null
  } catch {
    return null
  }
}

function normalizePayload(payload: JWTPayload): ClerkSession {
  const subject = typeof payload.sub === 'string' ? payload.sub : ''
  let email =
    typeof payload.email === 'string'
      ? payload.email
      : typeof payload.email_address === 'string'
        ? payload.email_address
        : null
  return { subject, email }
}

/** True if the verified session belongs to an admin allowlisted by email. */
export function isAdminEmail(email: string | null): boolean {
  if (config.allowedAdminEmails.length === 0) return false
  return config.allowedAdminEmails.includes(email?.trim().toLowerCase() ?? '')
}

export { clerkDomain }

export async function verifyClerkSession(token: string): Promise<ClerkSession> {
  const session = await verifyClerkJwt(token)
  if (!session.email) {
    const fromApi = await emailFromClerkApi(session.subject)
    if (fromApi) session.email = fromApi
  }
  return session
}