export interface Property {
  id: string
  title: string
  location: string
  country: string
  image: string
  images: string[]
  price: number
  rating: number
  reviews: number
  dates: string
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms?: number
  amenities: string[]
  category: string
  guestFavorite?: boolean
  instantBook?: boolean
  description?: string
}

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  image: string
  stays: number
}

export interface InspirationCardData {
  id: string
  title: string
  description: string
  image: string
}

export interface Category {
  id: string
  label: string
  icon: string
}

export type PlaceType = 'Entire place' | 'Private room' | 'Shared room'

export interface Filters {
  query?: string
  guests?: number
  price: [number, number]
  placeTypes: PlaceType[]
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  propertyTypes: string[]
  instantBook: boolean
  guestFavorite: boolean
}