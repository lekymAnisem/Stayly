import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Minus, Plus, X } from 'lucide-react'
import type { Filters, PlaceType } from '../types'
import {
  AMENITY_OPTIONS,
  DEFAULT_FILTERS,
  PRICE_MAX,
  PRICE_MIN,
  PROPERTY_TYPE_OPTIONS,
} from '../data/filters'
import { currency } from '../data/properties'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        checked ? 'bg-ink-900' : 'bg-ink-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-float transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function CheckChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-300 bg-white text-ink-800 hover:border-ink-900'
      }`}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-ink-900 transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">
          {value === 0 ? 'Any' : `${value} ${label.toLowerCase()}`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value === 0}
          onClick={() => onChange(value - 1)}
          className={btn}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value || 'Any'}</span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={() => onChange(value + 1)}
          className={btn}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function DualRangeSlider({
  value,
  onChange,
}: {
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [min, max] = value
  const step = 500
  const left = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const right = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  return (
    <div>
      <div className="dual-range">
        <div className="track" aria-hidden="true" />
        <div
          className="fill"
          aria-hidden="true"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={step}
          value={min}
          aria-label="Minimum price"
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), max - step)
            onChange([v, max])
          }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={step}
          value={max}
          aria-label="Maximum price"
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), min + step)
            onChange([min, v])
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-ink-600">
        <span>{currency(min)}</span>
        <span>{currency(max)}</span>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 text-lg font-bold text-ink-900">{children}</h3>
}

function Divider() {
  return <div className="my-6 h-px bg-ink-100" aria-hidden="true" />
}

interface FilterModalProps {
  open: boolean
  filters: Filters
  resultCount: number
  onApply: (filters: Filters) => void
  onClose: () => void
}

function FilterModalPanel({
  filters,
  resultCount,
  onApply,
  onClose,
}: Omit<FilterModalProps, 'open'>) {
  const [draft, setDraft] = useState<Filters>(filters)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isDefault = useMemo(() => {
    return (
      draft.price[0] === DEFAULT_FILTERS.price[0] &&
      draft.price[1] === DEFAULT_FILTERS.price[1] &&
      draft.placeTypes.length === 0 &&
      draft.bedrooms === 0 &&
      draft.beds === 0 &&
      draft.bathrooms === 0 &&
      draft.amenities.length === 0 &&
      draft.propertyTypes.length === 0 &&
      !draft.instantBook &&
      !draft.guestFavorite
    )
  }, [draft])

  const togglePlaceType = (t: PlaceType) =>
    setDraft((d) => ({
      ...d,
      placeTypes: d.placeTypes.includes(t)
        ? d.placeTypes.filter((x) => x !== t)
        : [...d.placeTypes, t],
    }))

  const toggleAmenity = (a: string) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a)
        ? d.amenities.filter((x) => x !== a)
        : [...d.amenities, a],
    }))

  const togglePropertyType = (t: string) =>
    setDraft((d) => ({
      ...d,
      propertyTypes: d.propertyTypes.includes(t)
        ? d.propertyTypes.filter((x) => x !== t)
        : [...d.propertyTypes, t],
    }))

  const placeTypes: PlaceType[] = ['Entire place', 'Private room', 'Shared room']

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Filter stays"
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]"
      />
      <div className="relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-pop animate-fade-up sm:max-w-2xl sm:rounded-3xl sm:max-h-[85dvh]">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-ink-100 px-4 py-3.5">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h2 className="text-base font-bold text-ink-900">Filters</h2>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <SectionTitle>Price range</SectionTitle>
          <p className="mb-5 text-sm text-ink-500">
            The average nightly price for your dates is{' '}
            <span className="font-semibold text-ink-900">₱6,500</span>.
          </p>
          <DualRangeSlider
            value={draft.price}
            onChange={(price) => setDraft((d) => ({ ...d, price }))}
          />

          <Divider />
          <SectionTitle>Type of place</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {placeTypes.map((t) => (
              <CheckChip
                key={t}
                label={t}
                active={draft.placeTypes.includes(t)}
                onClick={() => togglePlaceType(t)}
              />
            ))}
          </div>

          <Divider />
          <SectionTitle>Rooms and beds</SectionTitle>
          <div className="divide-y divide-ink-100">
            <Stepper
              label="Bedrooms"
              value={draft.bedrooms}
              onChange={(v) => setDraft((d) => ({ ...d, bedrooms: v }))}
            />
            <Stepper
              label="Beds"
              value={draft.beds}
              onChange={(v) => setDraft((d) => ({ ...d, beds: v }))}
            />
            <Stepper
              label="Bathrooms"
              value={draft.bathrooms}
              onChange={(v) => setDraft((d) => ({ ...d, bathrooms: v }))}
            />
          </div>

          <Divider />
          <SectionTitle>Amenities</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <CheckChip
                key={a}
                label={a}
                active={draft.amenities.includes(a)}
                onClick={() => toggleAmenity(a)}
              />
            ))}
          </div>

          <Divider />
          <SectionTitle>Property type</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_OPTIONS.map((t) => (
              <CheckChip
                key={t}
                label={t}
                active={draft.propertyTypes.includes(t)}
                onClick={() => togglePropertyType(t)}
              />
            ))}
          </div>

          <Divider />
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">Instant booking</p>
                <p className="text-xs text-ink-500">
                  Listings you can book without waiting for host approval.
                </p>
              </div>
              <Toggle
                label="Instant booking"
                checked={draft.instantBook}
                onChange={() =>
                  setDraft((d) => ({ ...d, instantBook: !d.instantBook }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">Guest favorite</p>
                <p className="text-xs text-ink-500">
                  The most loved homes on Stayly.
                </p>
              </div>
              <Toggle
                label="Guest favorite"
                checked={draft.guestFavorite}
                onChange={() =>
                  setDraft((d) => ({ ...d, guestFavorite: !d.guestFavorite }))
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4 sm:px-8">
          <button
            type="button"
            disabled={isDefault}
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-900 underline underline-offset-4 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-ink-800 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Show {resultCount} stays
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FilterModal({
  open,
  filters,
  resultCount,
  onApply,
  onClose,
}: FilterModalProps) {
  if (!open) return null
  return (
    <FilterModalPanel
      filters={filters}
      resultCount={resultCount}
      onApply={onApply}
      onClose={onClose}
    />
  )
}