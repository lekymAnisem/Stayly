import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react'
import type { Booking, PaymentPayload, Property } from '../types'
import { createBooking, payBooking } from '../lib/api'
import { currency } from '../data/properties'

const SERVICE_FEE_RATE = 0.14

const errMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

interface BookingModalProps {
  property: Property
  checkIn: string
  checkOut: string
  guests: number
  getToken?: () => Promise<string | null>
  onClose: () => void
}

export default function BookingModal({
  property,
  checkIn,
  checkOut,
  guests,
  getToken,
  onClose,
}: BookingModalProps) {
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)

  const nights = Math.max(
    0,
    Math.round(
      (new Date(`${checkOut}T00:00:00Z`).getTime() -
        new Date(`${checkIn}T00:00:00Z`).getTime()) /
        86_400_000,
    ),
  )
  const subtotal = nights * property.price
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  const total = subtotal + serviceFee

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, submitting])

  const cardComplete = useMemo(
    () =>
      cardName.trim().length > 1 &&
      cardNumber.replace(/\s/g, '').length >= 13 &&
      /^\d{2}\/\d{2}$/.test(cardExpiry) &&
      /^\d{3,4}$/.test(cardCvc),
    [cardName, cardNumber, cardExpiry, cardCvc],
  )

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      const token = getToken ? await getToken() : undefined
      const booking = await createBooking(
        {
          propertyId: property.id,
          checkIn,
          checkOut,
          guests,
          guestName: guestName.trim() || undefined,
          guestEmail: guestEmail.trim() || undefined,
        },
        token ?? undefined,
      )
      const payment: PaymentPayload = {
        cardName: cardName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiry: cardExpiry.trim(),
        cardCvc: cardCvc.trim(),
      }
      const paid = await payBooking(booking.id, payment, token ?? undefined)
      setConfirmed(paid)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => {
        if (!submitting) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={confirmed ? 'Booking confirmed' : 'Confirm reservation and pay'}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-6 shadow-pop sm:rounded-3xl"
      >
        {confirmed ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold tracking-tight text-ink-900">
              Trip booked!
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Your stay at {property.title} is confirmed. A receipt was sent to your email.
            </p>
            <dl className="mt-5 w-full space-y-2 rounded-2xl border border-ink-100 p-4 text-left text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">Confirmation</dt>
                <dd className="font-mono font-semibold text-ink-900">
                  {confirmed.paymentReference ?? confirmed.id.slice(0, 8)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">Dates</dt>
                <dd className="font-medium text-ink-900">
                  {formatDate(confirmed.checkIn)} – {formatDate(confirmed.checkOut)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">Guests</dt>
                <dd className="font-medium text-ink-900">{confirmed.guests}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">Paid online</dt>
                <dd className="font-semibold text-ink-900">
                  {currency(confirmed.total)}{' '}
                  {confirmed.cardLast4 && (
                    <span className="text-xs font-normal text-ink-500">
                      · card ··{confirmed.cardLast4}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
                Confirm and pay
              </h2>
              <button
                type="button"
                aria-label="Close"
                disabled={submitting}
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink-100 p-3">
              <img
                src={property.image || '/placeholder.svg'}
                alt=""
                className="h-14 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {property.title}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {property.location}, {property.country}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {property.rating.toFixed(2)}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-ink-500">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {formatDate(checkIn)} – {formatDate(checkOut)}
                </dt>
                <dd className="text-ink-700">
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">
                  {currency(property.price)} × {nights}{' '}
                  {nights === 1 ? 'night' : 'nights'}
                </dt>
                <dd className="text-ink-700">{currency(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">Service fee</dt>
                <dd className="text-ink-700">{currency(serviceFee)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-2 text-base font-bold text-ink-900">
                <dt>Total</dt>
                <dd>{currency(total)}</dd>
              </div>
            </dl>

            {!getToken && (
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Full name
                  </span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    autoComplete="name"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Email for confirmation
                  </span>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
              </div>
            )}

            <fieldset className="mt-5" disabled={submitting}>
              <legend className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Pay online with card
              </legend>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Card number
                  </span>
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    autoComplete="cc-number"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 font-mono text-sm tracking-wide text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Expiry
                  </span>
                  <input
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 font-mono text-sm tracking-wide text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    CVC
                  </span>
                  <input
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    autoComplete="cc-csc"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 font-mono text-sm tracking-wide text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Name on card
                  </span>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="JUAN DELA CRUZ"
                    autoComplete="cc-name"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm uppercase text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
                </label>
              </div>
            </fieldset>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting || !cardComplete || (!getToken && (!guestName.trim() || !guestEmail.trim()))}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Processing payment…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Confirm and pay {currency(total)}
                </>
              )}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-ink-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Test mode — use 4242 4242 4242 4242. Cards ending in 0002 decline.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
