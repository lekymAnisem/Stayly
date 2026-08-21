import { SlidersHorizontal, X } from 'lucide-react'
import type { Filters } from '../types'
import { countActiveFilters } from '../data/filters'

function chipBase(active = false) {
  return `flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
    active
      ? 'border-ink-900 bg-ink-900 text-white'
      : 'border-ink-300 bg-white text-ink-800 hover:border-ink-900'
  }`
}

interface FilterBarProps {
  filters: Filters
  onToggleInstant: () => void
  onToggleGuestFav: () => void
  onOpenModal: () => void
}

export default function FilterBar({
  filters,
  onToggleInstant,
  onToggleGuestFav,
  onOpenModal,
}: FilterBarProps) {
  const activeCount = countActiveFilters(filters)

  const chipOpen = (label: string) => (
    <button type="button" onClick={onOpenModal} className={chipBase()}>
      {label}
    </button>
  )

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
      {chipOpen('Price')}
      {chipOpen('Type of place')}
      {chipOpen('Rooms and beds')}
      {chipOpen('Amenities')}
      {chipOpen('Property type')}

      <button
        type="button"
        aria-pressed={filters.instantBook}
        onClick={onToggleInstant}
        className={chipBase(filters.instantBook)}
      >
        Instant booking
        {filters.instantBook && <X className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      <button
        type="button"
        aria-pressed={filters.guestFavorite}
        onClick={onToggleGuestFav}
        className={chipBase(filters.guestFavorite)}
      >
        Guest favorite
        {filters.guestFavorite && <X className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={onOpenModal}
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-ink-900 px-4 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        More filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  )
}