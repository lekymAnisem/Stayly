import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CalendarRange,
  Globe,
  MapPin,
  Minus,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useSearch } from '../lib/SearchContext'

// Popular destinations for autocomplete
const POPULAR_DESTINATIONS = [
  'Tokyo, Japan',
  'Paris, France',
  'New York, USA',
  'London, UK',
  'Bali, Indonesia',
  'Sydney, Australia',
  'Dubai, UAE',
  'Barcelona, Spain',
  'Amsterdam, Netherlands',
  'Singapore',
  'Rome, Italy',
  'Bangkok, Thailand',
  'Los Angeles, USA',
  'Berlin, Germany',
  'Prague, Czech Republic',
]

const labelCls = 'text-[11px] font-semibold tracking-wide'

function useSearchFields() {
  const { query, checkIn, checkOut, setQuery, setCheckIn, setCheckOut, setGuests, submit } =
    useSearch()
  const [activeField, setActiveField] = useState<string | null>(null)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([])
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [guestBreakdown, setGuestBreakdown] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  })

  const destinationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query) {
      setFilteredDestinations(
        POPULAR_DESTINATIONS.filter((d) =>
          d.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 5),
      )
    } else {
      setFilteredDestinations(POPULAR_DESTINATIONS.slice(0, 5))
    }
  }, [query])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false)
      }
      if (!event.target || !(event.target as Element).closest('.guest-dropdown-container')) {
        setShowGuestDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTotalGuests = () =>
    guestBreakdown.adults + guestBreakdown.children + guestBreakdown.infants

  const getGuestText = () => {
    const total = getTotalGuests()
    return total === 1 ? '1 guest' : `${total} guests`
  }

  const handleGuestChange = (
    type: 'adults' | 'children' | 'infants',
    action: 'increment' | 'decrement',
  ) => {
    setGuestBreakdown((prev) => ({
      ...prev,
      [type]:
        action === 'increment'
          ? prev[type] + 1
          : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1),
    }))
  }

  const handleSearch = () => {
    if (!query.trim()) {
      alert('Please select a destination')
      return
    }
    if (!checkIn) {
      alert('Please select check-in date')
      return
    }
    if (!checkOut) {
      alert('Please select check-out date')
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date')
      return
    }

    setGuests(getTotalGuests())
    submit()
  }

  const today = new Date().toISOString().split('T')[0]

  return {
    query,
    checkIn,
    checkOut,
    setQuery,
    setCheckIn,
    setCheckOut,
    activeField,
    setActiveField,
    showDestinationDropdown,
    setShowDestinationDropdown,
    filteredDestinations,
    showGuestDropdown,
    setShowGuestDropdown,
    getTotalGuests,
    getGuestText,
    guestBreakdown,
    handleGuestChange,
    handleSearch,
    destinationRef,
    today,
  }
}

function Dot({ className }: { className: string }) {
  return <span className={`h-2 w-2 rounded-full ${className}`} aria-hidden="true" />
}

function GuestRows({
  breakdown,
  onChange,
}: {
  breakdown: { adults: number; children: number; infants: number }
  onChange: (type: 'adults' | 'children' | 'infants', action: 'increment' | 'decrement') => void
}) {
  const rows: Array<{
    type: 'adults' | 'children' | 'infants'
    label: string
    hint: string
    min: number
  }> = [
    { type: 'adults', label: 'Adults', hint: 'Ages 13+', min: 1 },
    { type: 'children', label: 'Children', hint: 'Ages 2-12', min: 0 },
    { type: 'infants', label: 'Infants', hint: 'Under 2', min: 0 },
  ]
  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={row.type}
          className={`flex items-center justify-between py-3 ${i < rows.length - 1 ? 'border-b border-ink-100' : ''}`}
        >
          <div>
            <div className="text-sm font-medium text-ink-900">{row.label}</div>
            <div className="text-xs text-ink-500">{row.hint}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Remove ${row.label}`}
              onClick={() => onChange(row.type, 'decrement')}
              disabled={breakdown[row.type] <= row.min}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-300 text-ink-700 transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-ink-900">
              {breakdown[row.type]}
            </span>
            <button
              type="button"
              aria-label={`Add ${row.label}`}
              onClick={() => onChange(row.type, 'increment')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-300 text-ink-700 transition-colors hover:border-ink-900"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function DestinationDropdown({
  open,
  destinations,
  onSelect,
  onClose,
}: {
  open: boolean
  destinations: string[]
  onSelect: (destination: string) => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-ink-100 bg-white py-2 shadow-pop">
      {destinations.map((destination, i) => (
        <button
          type="button"
          key={i}
          onClick={() => {
            onSelect(destination)
            onClose()
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-900 transition-colors hover:bg-ink-50"
        >
          <MapPin className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
          <span className="truncate">{destination}</span>
        </button>
      ))}
    </div>
  )
}

function DestinationField({
  active,
  value,
  onChange,
  onFocus,
  onClick,
  inputRef,
}: {
  active: boolean
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onClick: () => void
  inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <div
      className={`flex cursor-pointer flex-col rounded-full px-4 py-1.5 transition-colors hover:bg-ink-50 ${
        active ? 'bg-ink-50' : ''
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-brand-500" aria-hidden="true" />
        <span className={`${labelCls} text-brand-600`}>Where to</span>
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Search destinations"
        className="w-full truncate bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </div>
  )
}

function DateField({
  active,
  label,
  value,
  min,
  onChange,
  onFocus,
  onClick,
  dotClass,
  labelClass,
}: {
  active: boolean
  label: string
  value: string
  min: string
  onChange: (value: string) => void
  onFocus: () => void
  onClick: () => void
  dotClass: string
  labelClass: string
}) {
  return (
    <div
      className={`flex cursor-pointer flex-col rounded-full px-4 py-1.5 transition-colors hover:bg-ink-50 ${
        active ? 'bg-ink-50' : ''
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        <Dot className={dotClass} />
        <span className={`${labelCls} ${labelClass}`}>{label}</span>
      </span>
      <input
        type="date"
        aria-label={label}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="w-full cursor-pointer bg-transparent text-sm text-ink-900 outline-none"
      />
    </div>
  )
}

export default function HeroSearchBar() {
  const {
    query,
    checkIn,
    checkOut,
    setQuery,
    setCheckIn,
    setCheckOut,
    activeField,
    setActiveField,
    showDestinationDropdown,
    setShowDestinationDropdown,
    filteredDestinations,
    showGuestDropdown,
    setShowGuestDropdown,
    getGuestText,
    guestBreakdown,
    handleGuestChange,
    handleSearch,
    destinationRef,
    today,
  } = useSearchFields()
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        handleSearch()
      }}
      className="flex w-full items-center rounded-full border border-ink-200 bg-white p-1.5 pl-2 shadow-[0_1px_2px_rgba(23,21,28,0.06)] transition-shadow hover:shadow-pop"
    >
      <div className="relative min-w-0 flex-[1.4]" ref={destinationRef}>
        <DestinationField
          active={activeField === 'destination'}
          value={query}
          onChange={setQuery}
          onClick={() => {
            setActiveField('destination')
            setShowDestinationDropdown(true)
          }}
          onFocus={() => {
            setActiveField('destination')
            setShowDestinationDropdown(true)
          }}
        />
        <DestinationDropdown
          open={showDestinationDropdown}
          destinations={filteredDestinations}
          onSelect={setQuery}
          onClose={() => setShowDestinationDropdown(false)}
        />
      </div>

      <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-ink-200 xl:block" />

      <div className="hidden shrink-0 xl:block">
        <DateField
          active={activeField === 'checkIn'}
          label="Check in"
          value={checkIn}
          min={today}
          onChange={setCheckIn}
          onClick={() => setActiveField('checkIn')}
          onFocus={() => setActiveField('checkIn')}
          dotClass="bg-neon-500 animate-pulse"
          labelClass="text-neon-700"
        />
      </div>

      <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-ink-200 xl:block" />

      <div className="hidden shrink-0 xl:block">
        <DateField
          active={activeField === 'checkOut'}
          label="Check out"
          value={checkOut}
          min={checkIn || today}
          onChange={setCheckOut}
          onClick={() => setActiveField('checkOut')}
          onFocus={() => setActiveField('checkOut')}
          dotClass="bg-electric-500 animate-pulse"
          labelClass="text-electric-700"
        />
      </div>

      <span aria-hidden="true" className="h-8 w-px shrink-0 bg-ink-200" />

      <div className="relative shrink-0 guest-dropdown-container">
        <div
          className={`flex cursor-pointer flex-col rounded-full px-4 py-1.5 transition-colors hover:bg-ink-50 ${
            activeField === 'guests' ? 'bg-ink-50' : ''
          }`}
          onClick={() => {
            setActiveField('guests')
            setShowGuestDropdown((v) => !v)
          }}
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-cyber-500" aria-hidden="true" />
            <span className={`${labelCls} text-cyber-700`}>Travelers</span>
          </span>
          <span className="text-sm text-ink-900">{getGuestText()}</span>
        </div>

        {showGuestDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-ink-100 bg-white p-4 shadow-pop">
            <GuestRows breakdown={guestBreakdown} onChange={handleGuestChange} />
          </div>
        )}
      </div>

      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-cyber-500 px-5 py-3 text-sm font-bold text-white transition-all hover:from-brand-400 hover:to-cyber-400 hover:shadow-glow-cyber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden xl:inline">Search</span>
      </button>
    </form>
  )
}

export function HeroSearchBarCompact() {
  const [open, setOpen] = useState(false)
  const {
    query,
    checkIn,
    checkOut,
    setQuery,
    setCheckIn,
    setCheckOut,
    activeField,
    setActiveField,
    showDestinationDropdown,
    setShowDestinationDropdown,
    filteredDestinations,
    getTotalGuests,
    guestBreakdown,
    handleGuestChange,
    handleSearch,
    destinationRef,
    today,
  } = useSearchFields()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        aria-label="Open search"
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 80)
        }}
        className="flex w-full items-center gap-3 rounded-full border border-ink-200 bg-white px-4 py-2 text-left shadow-[0_1px_2px_rgba(23,21,28,0.06)] transition-shadow hover:shadow-pop"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-cyber-500 text-white">
          <Search className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink-900">
            {query.trim() || 'Anywhere'}
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-500">
            <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
            {checkIn && checkOut ? `${checkIn} – ${checkOut}` : 'Any week'}
            <span className="mx-1 text-ink-300">·</span>
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {getTotalGuests() > 0 ? `${getTotalGuests()}+` : 'Add guests'}
          </span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition-colors hover:bg-ink-50"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-base font-bold text-ink-900">Search stays</p>
          </div>

          <div className="space-y-4 overflow-y-auto px-4 py-5">
            <div className="relative" ref={destinationRef}>
              <DestinationField
                active={activeField === 'destination'}
                value={query}
                onChange={setQuery}
                inputRef={inputRef}
                onClick={() => {
                  setActiveField('destination')
                  setShowDestinationDropdown(true)
                }}
                onFocus={() => {
                  setActiveField('destination')
                  setShowDestinationDropdown(true)
                }}
              />
              <DestinationDropdown
                open={showDestinationDropdown}
                destinations={filteredDestinations}
                onSelect={setQuery}
                onClose={() => setShowDestinationDropdown(false)}
              />
            </div>

            <div>
              <span className={labelCls}>When</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  aria-label="Check in"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                <input
                  type="date"
                  aria-label="Check out"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            <div className="guest-dropdown-container">
              <span className={labelCls}>Travelers</span>
              <div className="mt-1.5 rounded-2xl border border-ink-200 px-4">
                <GuestRows breakdown={guestBreakdown} onChange={handleGuestChange} />
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-3 border-t border-ink-100 px-4 py-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-ink-200 text-ink-700 transition-colors hover:border-ink-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleSearch()
                setOpen(false)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-cyber-500 py-3 text-base font-semibold text-white transition-all hover:from-brand-400 hover:to-cyber-400 hover:shadow-glow-cyber"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </div>
        </div>
      )}
    </>
  )
}