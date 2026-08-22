import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  BedSingle,
  CalendarCheck2,
  Heart,
  Loader2,
  Share2,
  Star,
  Users,
  XCircle,
} from 'lucide-react'
import type { Property } from '../types'
import { API_BASE, fetchAvailability } from '../lib/api'
import BookingModal from '../components/BookingModal'
import { currency } from '../data/properties'

const errMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong'

const SERVICE_FEE_RATE = 0.14

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

type Availability = 'idle' | 'checking' | 'available' | 'unavailable' | 'error'

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0)
  const shown = images.length > 0 ? images : ['/placeholder.svg']

  return (
    <div>
      <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl bg-ink-100 sm:aspect-[21/9]">
        <img
          src={shown[index]}
          alt={`${title} — photo ${index + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index
                  ? 'border-ink-900'
                  : 'border-transparent hover:border-ink-300'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ property }: { property: Property }) {
  const { isSignedIn, getToken } = useAuth()
  const [favorite, setFavorite] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [availability, setAvailability] = useState<Availability>('idle')
  const [modalOpen, setModalOpen] = useState(false)

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(`${checkOut}T00:00:00Z`).getTime() -
            new Date(`${checkIn}T00:00:00Z`).getTime()) /
            86_400_000,
        )
      : 0
  const datesValid = nights >= 1

  useEffect(() => {
    if (!checkIn || !checkOut || !datesValid) {
      setAvailability('idle')
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setAvailability('checking')
      fetchAvailability(property.id, checkIn, checkOut, controller.signal)
        .then((r) => {
          if (!controller.signal.aborted) {
            setAvailability(r.available ? 'available' : 'unavailable')
          }
        })
        .catch((err: unknown) => {
          if (
            !controller.signal.aborted &&
            !(err instanceof DOMException && err.name === 'AbortError')
          ) {
            setAvailability('error')
          }
        })
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [property.id, checkIn, checkOut, datesValid])

  const subtotal = nights * property.price
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  const total = subtotal + serviceFee

  const statusLine = (): string => {
    if (availability === 'checking') return 'Checking availability…'
    if (availability === 'unavailable') return 'Those dates are booked — try others.'
    if (availability === 'error') return 'Could not check availability. Try again.'
    return "You won't be charged yet"
  }

  return (
    <aside className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="flex items-end justify-between gap-2">
        <p className="text-lg text-ink-900">
          <span className="font-bold">{currency(property.price)}</span>{' '}
          <span className="text-sm font-normal text-ink-500">night</span>
        </p>
        <p className="flex items-center gap-1 text-sm font-medium text-ink-900">
          <Star className="h-4 w-4 fill-current" aria-hidden="true" />
          {property.rating.toFixed(2)}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-200">
        <div className="grid grid-cols-2 border-b border-ink-200">
          <label className="border-r border-ink-200 px-3.5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Check in
            </span>
            <input
              type="date"
              value={checkIn}
              min={todayIso()}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value && checkOut <= e.target.value) {
                  setCheckOut(addDaysIso(e.target.value, 1))
                }
              }}
              aria-label="Check-in date"
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-ink-900 outline-none [color-scheme:light]"
            />
          </label>
          <label className="px-3.5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Check out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn ? addDaysIso(checkIn, 1) : addDaysIso(todayIso(), 1)}
              onChange={(e) => setCheckOut(e.target.value)}
              aria-label="Check-out date"
              disabled={!checkIn}
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-ink-900 outline-none disabled:text-ink-300 [color-scheme:light]"
            />
          </label>
        </div>
        <div className="px-3.5 py-3">
          <label htmlFor="booking-guests">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Guests
            </span>
          </label>
          <select
            id="booking-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-ink-900 outline-none"
          >
            {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={!datesValid || availability !== 'available'}
        onClick={() => setModalOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {availability === 'checking' && datesValid ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Checking…
          </>
        ) : (
          'Reserve'
        )}
      </button>

      <p
        className={`mt-2 flex items-center justify-center gap-1.5 text-center text-xs ${
          availability === 'unavailable' || availability === 'error'
            ? 'font-medium text-red-600'
            : availability === 'available'
              ? 'font-medium text-emerald-700'
              : 'text-ink-500'
        }`}
        role="status"
      >
        {availability === 'available' ? (
          <>
            <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
            Available for your dates!
          </>
        ) : availability === 'unavailable' ? (
          <>
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {statusLine()}
          </>
        ) : (
          statusLine()
        )}
      </p>

      {datesValid && (
        <dl className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-500">
              {currency(property.price)} × {nights} {nights === 1 ? 'night' : 'nights'}
            </dt>
            <dd className="text-ink-700">{currency(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-500">Service fee</dt>
            <dd className="text-ink-700">{currency(serviceFee)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 font-bold text-ink-900">
            <dt>Total</dt>
            <dd>{currency(total)}</dd>
          </div>
        </dl>
      )}

      <button
        type="button"
        onClick={() => setFavorite((v) => !v)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900"
      >
        <Heart
          className={`h-4 w-4 ${
            favorite ? 'fill-brand-500 text-brand-500' : 'text-ink-700'
          }`}
          aria-hidden="true"
        />
        {favorite ? 'Saved' : 'Save this stay'}
      </button>

      {modalOpen && (
        <BookingModal
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          getToken={isSignedIn ? getToken : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </aside>
  )
}

export default function PropertyDetail({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/properties/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) {
          setError('This listing could not be found.')
          return null
        }
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return (await res.json()) as Property
      })
      .then((p) => {
        if (p) setProperty(p)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(errMessage(err))
        setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-4">
        <p className="text-lg font-semibold text-ink-900">
          {error ?? 'This listing could not be found.'}
        </p>
        <a
          href="#/"
          className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
        >
          Back to home
        </a>
      </div>
    )
  }

  const roomIcons = [
    { icon: Users, label: `${property.guests} ${property.guests === 1 ? 'guest' : 'guests'}` },
    { icon: BedDouble, label: `${property.bedrooms} ${property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}` },
    { icon: BedSingle, label: `${property.beds} ${property.beds === 1 ? 'bed' : 'beds'}` },
  ]
  if (property.bathrooms) {
    roomIcons.push({
      icon: Bath,
      label: `${property.bathrooms} ${property.bathrooms === 1 ? 'bath' : 'baths'}`,
    })
  }

  return (
    <div className="min-h-dvh bg-white pb-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          <button
            type="button"
            onClick={() => history.back()}
            className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <a
              href="#/"
              className="rounded-full px-2 py-1.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
            >
              Home
            </a>
          </div>
        </div>

        <Gallery images={property.images} title={property.title} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-1 text-base text-ink-500">
                  {property.location}, {property.country}
                </p>
              </div>
              <p className="flex shrink-0 items-center gap-1 text-base font-semibold text-ink-900">
                <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                {property.rating.toFixed(2)}
                <span className="font-normal text-ink-500">
                  ({property.reviews})
                </span>
              </p>
            </div>

            <div className="my-6 h-px bg-ink-100" />

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {roomIcons.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-sm text-ink-700">
                  <Icon className="h-5 w-5 text-ink-900" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

            {property.instantBook && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Instant booking
              </span>
            )}

            <div className="my-6 h-px bg-ink-100" />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-800 text-sm font-bold text-white">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Hosted by Stayly</p>
                <p className="text-sm text-ink-500">
                  {property.propertyType} ·{' '}
                  {property.guestFavorite ? 'Guest favorite' : 'Verified host'}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-ink-100" />

            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink-900">
                About this stay
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
                {property.description || `${property.title} is a ${property.propertyType.toLowerCase()} in ${property.location}, ${property.country}. Enjoy a comfortable, well-reviewed stay.`}
              </p>
            </div>

            <div className="my-6 h-px bg-ink-100" />

            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink-900">
                What this place offers
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-ink-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingCard property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}