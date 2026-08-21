import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import type { Property } from '../types'
import SmartImage from './SmartImage'
import { currency, formatTotal } from '../data/properties'

const nightsFromDates = (dates: string): number => {
  const nums = dates.match(/\d+/g)?.map(Number) ?? []
  if (nums.length >= 2) return Math.max(nums[nums.length - 1] - nums[0], 1)
  return 1
}

const distanceFor = (id: string): string => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const km = (hash % 3200) + 24
  return `${km.toLocaleString('en-PH')} km away`
}

function Carousel({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0)
  const hovered = useRef(false)
  const count = images.length

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  )

  return (
    <div
      className="group/carousel relative aspect-[4/3] w-full overflow-hidden"
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="h-full w-full shrink-0">
            <SmartImage
              alt={`${title} — photo ${i + 1}`}
              src={src}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 opacity-0 shadow-float transition-all duration-200 hover:scale-105 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 opacity-0 shadow-float transition-all duration-200 hover:scale-105 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index ? 'w-3.5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [favorite, setFavorite] = useState(false)
  const nights = nightsFromDates(property.dates)
  const href = `#/properties/${encodeURIComponent(property.id)}`

  return (
    <article className="group relative">
      <a
        href={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div className="transition-transform duration-500 group-hover:scale-[1.04]">
              <Carousel images={property.images} title={property.title} />
            </div>
          </div>

          {property.guestFavorite && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-float">
              Guest favorite
            </span>
          )}
        </div>
      </a>

      <button
        type="button"
        aria-label={favorite ? `Remove ${property.title} from favorites` : `Save ${property.title} to favorites`}
        aria-pressed={favorite}
        onClick={() => setFavorite((v) => !v)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Heart
          className={`h-6 w-6 transition-colors ${
            favorite ? 'fill-brand-500 text-brand-500' : 'text-white drop-shadow'
          }`}
          aria-hidden="true"
        />
      </button>

      <a href={href} className="mt-2.5 block space-y-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-ink-900">
            {property.propertyType} · {property.title}
          </h3>
          <p className="flex shrink-0 items-center gap-1 text-[15px] font-semibold text-ink-900">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {property.rating.toFixed(2)}
          </p>
        </div>
        <p className="truncate text-sm text-ink-500">
          {property.location}, {property.country}
        </p>
        <p className="text-sm text-ink-500">
          {distanceFor(property.id)} · {property.dates}
        </p>
        <div className="pt-1.5">
          <p className="text-sm text-ink-900">
            <span className="font-semibold">{currency(property.price)}</span>{' '}
            <span className="text-ink-500">night</span>
          </p>
          <p className="mt-0.5 text-sm text-ink-500 underline underline-offset-2">
            {formatTotal(property.price, nights)} total
          </p>
        </div>
      </a>
    </article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="animate-fade-up" aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-2xl" />
      <div className="mt-3 space-y-2 px-0.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/4 rounded" />
      </div>
    </div>
  )
}