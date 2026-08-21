import type { Property } from '../types'
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard'

interface PropertyGridProps {
  properties?: Property[]
  loading?: boolean
  className?: string
}

export default function PropertyGrid({
  properties = [],
  loading = false,
  className,
}: PropertyGridProps) {
  const gridClass =
    className ??
    'grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 10 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}