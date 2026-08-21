import type { NextFunction, Request, Response } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { isAdminEmail, verifyClerkSession } from './clerk.js'

const adminToken = Buffer.from(config.adminPassword)

function passwordTokenMatches(token: string): boolean {
  const received = Buffer.from(token, 'base64')
  return (
    received.length === adminToken.length &&
    timingSafeEqual(received, adminToken)
  )
}

function isJwt(token: string): boolean {
  return token.split('.').length === 3
}

/** POST /api/admin/login — verify the admin password, return a bearer token. */
export function adminLogin(req: Request, res: Response): void {
  const { password } = (req.body ?? {}) as { password?: unknown }
  if (
    typeof password !== 'string' ||
    password.length !== adminToken.length ||
    !timingSafeEqual(Buffer.from(password), adminToken)
  ) {
    res.status(401).json({ error: 'Invalid password' })
    return
  }
  res.json({ token: adminToken.toString('base64') })
}

/**
 * Guards admin routes. Accepts either:
 *  - the legacy password token (`Authorization: Bearer <base64 password>`), or
 *  - a verified Clerk session JWT for an email in ALLOWED_ADMIN_EMAILS.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!isJwt(token)) {
    if (passwordTokenMatches(token)) {
      next()
      return
    }
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const session = await verifyClerkSession(token)
    if (session.email) {
      if (isAdminEmail(session.email)) {
        next()
        return
      }
      res.status(403).json({
        error: 'This account is not allowed to manage listings',
      })
      return
    }
    res.status(500).json({
      error:
        'Session verified, but the email could not be resolved. Add CLERK_SECRET_KEY (and your email to ALLOWED_ADMIN_EMAILS) to the backend env.',
    })
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}