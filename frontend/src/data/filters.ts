import type { Filters, PlaceType, Property } from '../types'

export const PRICE_MIN = 1000
export const PRICE_MAX = 35000

export const AMENITY_OPTIONS = [
  'WiFi',
  'Pool',
  'Kitchen',
  'Free parking',
  'Beach access',
  'Ocean view',
  'Mountain view',
  'Fireplace',
  'Hot tub',
  'Air conditioning',
  'Breakfast',
  'Garden',
]

export const PROPERTY_TYPE_OPTIONS = [
  'Entire home',
  'Entire villa',
  'Entire cabin',
  'Entire apartment',
  'Tiny home',
]

export const DEFAULT_FILTERS: Filters = {
  price: [PRICE_MIN, PRICE_MAX],
  placeTypes: [],
  bedrooms: 0,
  beds: 0,
  bathrooms: 0,
  amenities: [],
  propertyTypes: [],
  instantBook: false,
  guestFavorite: false,
}

export const placeTypeOf = (propertyType: string): PlaceType => {
  if (propertyType.startsWith('Entire') || propertyType.startsWith('Tiny'))
    return 'Entire place'
  if (propertyType.startsWith('Private')) return 'Private room'
  return 'Shared room'
}

const hashOf = (id: string): number => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash
}

export const instantBooking = (property: Property): boolean =>
  hashOf(property.id) % 2 === 0

export function applyFilters(list: Property[], filters: Filters): Property[] {
  return list.filter((p) => {
    const query = filters.query?.trim().toLowerCase()
    if (query) {
      const haystack = `${p.title} ${p.location} ${p.country} ${p.amenities.join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (filters.guests && filters.guests > 0 && p.guests < filters.guests) return false
    if (p.price < filters.price[0] || p.price > filters.price[1]) return false
    if (filters.placeTypes.length > 0) {
      const pt = placeTypeOf(p.propertyType)
      if (!filters.placeTypes.includes(pt)) return false
    }
    if (filters.bedrooms > 0 && p.bedrooms < filters.bedrooms) return false
    if (filters.beds > 0 && p.beds < filters.beds) return false
    if (filters.amenities.length > 0 && !filters.amenities.every((a) => p.amenities.includes(a)))
      return false
    if (
      filters.propertyTypes.length > 0 &&
      !filters.propertyTypes.includes(p.propertyType)
    )
      return false
    if (filters.instantBook && !instantBooking(p)) return false
    if (filters.guestFavorite && !p.guestFavorite) return false
    return true
  })
}

export const countActiveFilters = (filters: Filters): number =>
  (filters.placeTypes.length > 0 ? 1 : 0) +
  (filters.bedrooms > 0 ? 1 : 0) +
  (filters.beds > 0 ? 1 : 0) +
  (filters.bathrooms > 0 ? 1 : 0) +
  (filters.amenities.length > 0 ? 1 : 0) +
  (filters.propertyTypes.length > 0 ? 1 : 0) +
  (filters.instantBook ? 1 : 0) +
  (filters.guestFavorite ? 1 : 0) +
  (filters.price[0] > PRICE_MIN || filters.price[1] < PRICE_MAX ? 1 : 0)