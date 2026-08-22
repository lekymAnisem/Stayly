import { Router } from 'express'
import { randomUUID, randomBytes } from 'node:crypto'
import { pool } from '../db/pool.js'
import { optionalClerkUserId } from '../lib/auth.js'

export const bookingsRouter = Router()

const SERVICE_FEE_RATE = 0.14
const PENDING_TTL_MINUTES = 15

interface BookingRow {
  id: string
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  pricePerNight: number
  subtotal: number
  serviceFee: number
  total: number
  status: string
  paymentMethod: string | null
  cardLast4: string | null
  paymentReference: string | null
  paidAt: string | null
  createdAt: string
}

const BOOKING_COLUMNS = `
  id,
  property_id AS "propertyId",
  check_in::text AS "checkIn",
  check_out::text AS "checkOut",
  guests, nights,
  price_per_night AS "pricePerNight",
  subtotal,
  service_fee AS "serviceFee",
  total, status,
  payment_method AS "paymentMethod",
  card_last4 AS "cardLast4",
  payment_reference AS "paymentReference",
  paid_at::text AS "paidAt",
  created_at::text AS "createdAt"
`

const httpError = (statusCode: number, message: string): Error =>
  Object.assign(new Error(message), { statusCode })

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null
  return value
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms =
    new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

async function fetchPropertyPrice(propertyId: string): Promise<number | null> {
  const { rows } = await pool.query<{ price: number }>(
    'SELECT price FROM properties WHERE id = $1',
    [propertyId],
  )
  return rows.length > 0 ? rows[0].price : null
}

async function fetchPropertyMaxGuests(propertyId: string): Promise<number | null> {
  const { rows } = await pool.query<{ guests: number }>(
    'SELECT guests FROM properties WHERE id = $1',
    [propertyId],
  )
  return rows.length > 0 ? rows[0].guests : null
}

async function expireStalePendings(): Promise<void> {
  await pool.query(
    `UPDATE bookings SET status = 'expired'
      WHERE status = 'pending'
        AND created_at < now() - ($1 || ' minutes')::interval`,
    [String(PENDING_TTL_MINUTES)],
  )
}

async function isRangeAvailable(
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  await expireStalePendings()
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id FROM bookings
      WHERE property_id = $1
        AND status IN ('pending', 'confirmed')
        AND check_in < $3
        AND check_out > $2
      LIMIT 1`,
    [propertyId, checkIn, checkOut],
  )
  return rows.length === 0
}

bookingsRouter.get('/availability', async (req, res, next) => {
  try {
    const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId : ''
    const checkIn = parseIsoDate(req.query.checkIn)
    const checkOut = parseIsoDate(req.query.checkOut)

    if (!propertyId || !checkIn || !checkOut) {
      throw httpError(400, 'propertyId, checkIn and checkOut are required (YYYY-MM-DD)')
    }
    if (nightsBetween(checkIn, checkOut) < 1) {
      throw httpError(400, 'checkOut must be after checkIn')
    }

    res.json({ available: await isRangeAvailable(propertyId, checkIn, checkOut) })
  } catch (err) {
    next(err)
  }
})

bookingsRouter.post('/', async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId : ''
    const checkIn = parseIsoDate(body.checkIn)
    const checkOut = parseIsoDate(body.checkOut)
    const guests = Number(body.guests)

    if (!checkIn || !checkOut) {
      throw httpError(400, 'checkIn and checkOut are required (YYYY-MM-DD)')
    }
    const nights = nightsBetween(checkIn, checkOut)
    if (nights < 1) throw httpError(400, 'checkOut must be after checkIn')
    if (nights > 365) throw httpError(400, 'Stays are limited to 365 nights')
    if (checkIn < todayIso()) throw httpError(400, 'Check-in cannot be in the past')

    const maxGuests = await fetchPropertyMaxGuests(propertyId)
    if (maxGuests === null) throw httpError(404, 'Property not found')
    if (!Number.isInteger(guests) || guests < 1) {
      throw httpError(400, 'guests must be at least 1')
    }
    if (guests > maxGuests) {
      throw httpError(400, `This place allows up to ${maxGuests} guests`)
    }

    const clerkUserId = await optionalClerkUserId(req)
    let guestName: string | null = null
    let guestEmail: string | null = null
    if (!clerkUserId) {
      guestName = typeof body.guestName === 'string' ? body.guestName.trim() : ''
      guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : ''
      if (!guestName || guestName.length > 120) {
        throw httpError(400, 'A guest name is required')
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        throw httpError(400, 'A valid email address is required')
      }
    }

    if (!(await isRangeAvailable(propertyId, checkIn, checkOut))) {
      throw httpError(409, 'Those dates are no longer available')
    }

    const pricePerNight = (await fetchPropertyPrice(propertyId)) ?? 0
    const subtotal = pricePerNight * nights
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)

    const { rows } = await pool.query<BookingRow>(
      `INSERT INTO bookings
        (id, property_id, clerk_user_id, guest_name, guest_email,
         check_in, check_out, guests, nights,
         price_per_night, subtotal, service_fee, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
       RETURNING ${BOOKING_COLUMNS}`,
      [
        randomUUID(),
        propertyId,
        clerkUserId,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight,
        subtotal,
        serviceFee,
        subtotal + serviceFee,
      ],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

function luhnValid(digits: string): boolean {
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

interface CardInput {
  last4: string
  brand: string
}

function parseCard(body: Record<string, unknown>): CardInput | string {
  const number = String(body.cardNumber ?? '').replace(/[\s-]/g, '')
  const name = String(body.cardName ?? '').trim()
  const expiry = String(body.cardExpiry ?? '').trim()
  const cvc = String(body.cardCvc ?? '').trim()

  if (!name || name.length > 120) return 'The cardholder name is required'
  if (!/^\d{13,19}$/.test(number) || !luhnValid(number)) {
    return 'That card number looks invalid'
  }
  const expiryMatch = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry)
  if (!expiryMatch) return 'Expiry must be in MM/YY format'
  const month = Number(expiryMatch[1])
  const year = 2000 + Number(expiryMatch[2])
  if (month < 1 || month > 12) return 'Expiry month must be between 01 and 12'
  const now = new Date()
  const expiresAt = new Date(Date.UTC(year, month, 1))
  if (expiresAt <= now) return 'That card has expired'

  if (!/^\d{3,4}$/.test(cvc)) return 'The security code must be 3 or 4 digits'

  const brand = number.startsWith('4')
    ? 'Visa'
    : number.startsWith('5')
      ? 'Mastercard'
      : number.startsWith('3')
        ? 'Amex'
        : 'Card'

  return { last4: number.slice(-4), brand }
}

bookingsRouter.post('/:id/pay', async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const parsed = parseCard(body)
    if (typeof parsed === 'string') throw httpError(400, parsed)

    const { rows } = await pool.query<BookingRow>(
      `SELECT ${BOOKING_COLUMNS} FROM bookings WHERE id = $1`,
      [req.params.id],
    )
    if (rows.length === 0) throw httpError(404, 'Booking not found')
    const booking = rows[0]
    if (booking.status === 'confirmed') {
      res.json(booking)
      return
    }
    if (booking.status !== 'pending') {
      throw httpError(409, `This booking can no longer be paid (status: ${booking.status})`)
    }

    await new Promise((resolve) => setTimeout(resolve, 900))
    if (parsed.last4 === '0002') {
      throw httpError(402, 'Your card was declined by the issuer')
    }

    const updated = await pool.query<BookingRow>(
      `UPDATE bookings
          SET status = 'confirmed',
              payment_method = $2,
              card_last4 = $3,
              payment_reference = $4,
              paid_at = now()
        WHERE id = $1 AND status = 'pending'
        RETURNING ${BOOKING_COLUMNS}`,
      [booking.id, `${parsed.brand} (online)`, parsed.last4, randomBytes(9).toString('hex')],
    )
    if (updated.rows.length === 0) {
      throw httpError(409, 'Those dates are no longer available')
    }
    res.json(updated.rows[0])
  } catch (err) {
    next(err)
  }
})
