import type {
  Booking,
  BookingPayload,
  Category,
  Destination,
  Filters,
  InspirationCardData,
  PaymentPayload,
  Property,
} from '../types'
import {
  categories as mockCategories,
  destinations as mockDestinations,
  inspirations as mockInspirations,
  properties as mockProperties,
} from '../data/properties'
import { PRICE_MAX, PRICE_MIN, applyFilters } from '../data/filters'

export const API_BASE: string = import.meta.env.VITE_API_URL ?? '/api'

export const ADMIN_TOKEN_KEY = 'stayly.admin.token'

export interface AdminPropertyPayload {
  title: string
  location: string
  country: string
  price: number
  rating: number
  reviews: number
  dates: string
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  category: string
  images: string[]
  description?: string
  guestFavorite?: boolean
  instantBook?: boolean
}

export interface CatalogData {
  categories: Category[]
  destinations: Destination[]
  inspirations: InspirationCardData[]
}

export type DataSource = 'server' | 'offline'

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal })
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return (await res.json()) as T
}

async function postJson<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? `Request failed with status ${res.status}`)
  }
  return (await res.json()) as T
}

async function putJson<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? `Request failed with status ${res.status}`)
  }
  return (await res.json()) as T
}

async function del(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok && res.status !== 204) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? `Request failed with status ${res.status}`)
  }
}

export function filtersToQuery(filters: Filters, category: string): URLSearchParams {
  const q = new URLSearchParams()
  if (filters.query?.trim()) q.set('q', filters.query.trim())
  if (filters.guests && filters.guests > 0)
    q.set('guests', String(filters.guests))
  if (category && category !== 'trending') q.set('category', category)
  if (filters.price[0] > PRICE_MIN) q.set('minPrice', String(filters.price[0]))
  if (filters.price[1] < PRICE_MAX) q.set('maxPrice', String(filters.price[1]))
  if (filters.placeTypes.length > 0) q.set('placeTypes', filters.placeTypes.join(','))
  if (filters.bedrooms > 0) q.set('bedrooms', String(filters.bedrooms))
  if (filters.beds > 0) q.set('beds', String(filters.beds))
  if (filters.bathrooms > 0) q.set('bathrooms', String(filters.bathrooms))
  if (filters.amenities.length > 0) q.set('amenities', filters.amenities.join(','))
  if (filters.propertyTypes.length > 0)
    q.set('propertyTypes', filters.propertyTypes.join(','))
  if (filters.instantBook) q.set('instantBook', 'true')
  if (filters.guestFavorite) q.set('guestFavorite', 'true')
  return q
}

/** Fetch the static catalog (categories, destinations, inspirations) from the API. */
export async function fetchCatalog(signal?: AbortSignal): Promise<CatalogData> {
  const [categories, destinations, inspirations] = await Promise.all([
    getJson<Category[]>('/categories', signal),
    getJson<Destination[]>('/destinations', signal),
    getJson<InspirationCardData[]>('/inspirations', signal),
  ])
  return { categories, destinations, inspirations }
}

/** Fetch filtered properties from the API. */
export async function fetchProperties(
  filters: Filters,
  category: string,
  signal?: AbortSignal,
): Promise<Property[]> {
  const query = filtersToQuery(filters, category)
  return getJson<Property[]>(`/properties?${query.toString()}`, signal)
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * Loads catalog + properties. Talks to the API when available and falls
 * back to the bundled demo dataset so the UI always renders.
 */
export async function loadData(
  filters: Filters,
  category: string,
  signal?: AbortSignal,
): Promise<{ data: CatalogData; properties: Property[]; source: DataSource }> {
  try {
    const [catalog, properties] = await Promise.all([
      fetchCatalog(signal),
      fetchProperties(filters, category, signal),
    ])
    return { data: catalog, properties, source: 'server' }
  } catch {
    await sleep(250)
    const byCategory =
      category === 'trending'
        ? mockProperties
        : mockProperties.filter((p) => p.category === category)
    return {
      data: {
        categories: mockCategories,
        destinations: mockDestinations,
        inspirations: mockInspirations,
      },
      properties: applyFilters(byCategory, filters),
      source: 'offline',
    }
  }
}

export async function fetchProperty(
  id: string,
  signal?: AbortSignal,
): Promise<Property> {
  return getJson<Property>(`/properties/${encodeURIComponent(id)}`, signal)
}

/** ---- Bookings API ---- */

export async function fetchAvailability(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  signal?: AbortSignal,
): Promise<{ available: boolean }> {
  const q = new URLSearchParams({ propertyId, checkIn, checkOut })
  return getJson<{ available: boolean }>(`/bookings/availability?${q.toString()}`, signal)
}

export async function createBooking(
  payload: BookingPayload,
  token?: string,
): Promise<Booking> {
  return postJson<Booking>('/bookings', payload, token)
}

export async function payBooking(
  bookingId: string,
  payment: PaymentPayload,
  token?: string,
): Promise<Booking> {
  return postJson<Booking>(`/bookings/${bookingId}/pay`, payment, token)
}

/** ---- Admin API ---- */

export async function adminLogin(password: string): Promise<string> {
  const data = await postJson<{ token: string }>('/admin/login', { password })
  return data.token
}

export async function adminListProperties(token: string): Promise<Property[]> {
  const res = await fetch(`${API_BASE}/admin/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return (await res.json()) as Property[]
}

export async function adminCreateProperty(
  token: string,
  payload: AdminPropertyPayload,
): Promise<Property> {
  return postJson<Property>('/admin/properties', payload, token)
}

export async function adminUpdateProperty(
  token: string,
  id: string,
  payload: AdminPropertyPayload,
): Promise<Property> {
  return putJson<Property>(`/admin/properties/${id}`, payload, token)
}

export async function adminDeleteProperty(token: string, id: string): Promise<void> {
  await del(`/admin/properties/${id}`, token)
}

/** Uploads image files to Cloudinary via the API, returns hosted URLs. */
export async function adminUploadImages(
  token: string,
  files: File[],
): Promise<string[]> {
  const form = new FormData()
  for (const file of files) form.append('images', file)
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = (await res.json().catch(() => null)) as { urls?: string[]; error?: string } | null
  if (!res.ok || !data) throw new Error(data?.error ?? `Upload failed with status ${res.status}`)
  return data.urls ?? []
}