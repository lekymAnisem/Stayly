import type { Destination } from '../types'
import SmartImage from './SmartImage'
import { MapPin } from 'lucide-react'

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <a
      href="#"
      className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div className="overflow-hidden">
        <SmartImage
          alt={`${destination.name}, ${destination.country}`}
          src={destination.image}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-ink-900">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <h3 className="text-base font-bold">{destination.name}</h3>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink-500">
          {destination.description}
        </p>
        <p className="mt-2.5 text-xs font-semibold text-ink-600">
          {destination.stays} stays
        </p>
      </div>
    </a>
  )
}