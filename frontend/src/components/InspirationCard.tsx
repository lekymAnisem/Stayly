import type { InspirationCardData } from '../types'
import SmartImage from './SmartImage'
import { ArrowUpRight } from 'lucide-react'

export default function InspirationCard({
  item,
}: {
  item: InspirationCardData
}) {
  return (
    <a
      href="#"
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <SmartImage
        alt={item.title}
        src={item.image}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity group-hover:from-black/70"
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold drop-shadow-sm sm:text-xl">{item.title}</h3>
          <ArrowUpRight
            className="h-5 w-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>
        <p className="mt-1 text-sm text-white/85">{item.description}</p>
      </div>
    </a>
  )
}