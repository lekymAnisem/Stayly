import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchX, ServerCog, WifiOff, X } from 'lucide-react'
import Header from '../components/Header'
import CategoryNav from '../components/CategoryNav'
import Hero from '../components/Hero'
import PropertyGrid from '../components/PropertyGrid'
import FilterBar from '../components/FilterBar'
import FilterModal from '../components/FilterModal'
import MapView, { MapOverlay, ShowMapButton } from '../components/MapView'
import DestinationCard from '../components/DestinationCard'
import InspirationCard from '../components/InspirationCard'
import Footer from '../components/Footer'
import MobileNav from '../components/MobileNav'
import { DEFAULT_FILTERS, applyFilters, countActiveFilters } from '../data/filters'
import {
  categories as mockCategories,
  destinations as mockDestinations,
  inspirations as mockInspirations,
  properties as mockProperties,
} from '../data/properties'
import { loadData, type CatalogData, type DataSource } from '../lib/api'
import { useSearch } from '../lib/SearchContext'
import type { Filters, Property } from '../types'

const sectionHeading =
  'text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl'
const sectionSub = 'mt-1 text-sm text-ink-500 sm:text-base'

const EMPTY_CATALOG: CatalogData = {
  categories: [],
  destinations: [],
  inspirations: [],
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [category, setCategory] = useState('trending')
  const [loading, setLoading] = useState(true)
  const [mapOpen, setMapOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [catalog, setCatalog] = useState<CatalogData>(EMPTY_CATALOG)
  const [source, setSource] = useState<DataSource>('offline')
  const requestId = useRef(0)
  const staysRef = useRef<HTMLElement>(null)
  const { query, guests, nonce, clear } = useSearch()
  const [committed, setCommitted] = useState({ query: '', guests: 0 })

  useEffect(() => {
    setCommitted({ query: query.trim(), guests })
    if (nonce > 0) {
      setTimeout(() => staysRef.current?.scrollIntoView({ behavior: 'smooth' }), 120)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  const searchFilters: Filters = useMemo(
    () => ({
      ...filters,
      query: committed.query || undefined,
      guests: committed.guests || undefined,
    }),
    [filters, committed],
  )

  useEffect(() => {
    const id = ++requestId.current
    const controller = new AbortController()
    setLoading(true)

    loadData(searchFilters, category, controller.signal)
      .then(({ data, properties: list, source: src }) => {
        if (id !== requestId.current) return
        setCatalog(data)
        setProperties(list)
        setSource(src)
        setLoading(false)
      })
      .catch(() => {
        if (id !== requestId.current) return
        const byCategory =
          category === 'trending'
            ? mockProperties
            : mockProperties.filter((p) => p.category === category)
        setCatalog({
          categories: mockCategories,
          destinations: mockDestinations,
          inspirations: mockInspirations,
        })
        setProperties(applyFilters(byCategory, searchFilters))
        setSource('offline')
        setLoading(false)
      })

    return () => controller.abort()
  }, [searchFilters, category])

  const resetFilters = () => setFilters(DEFAULT_FILTERS)
  const categoryLabel = catalog.categories.find((c) => c.id === category)?.label
  const activeCount = countActiveFilters(filters)
  const isSearching = committed.query.length > 0 || committed.guests > 0
  const searchSummary =
    committed.query || (committed.guests > 0 ? `${committed.guests}+ guests` : '')

  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      <Header />
      <CategoryNav
        active={category}
        onChange={setCategory}
        categories={catalog.categories}
      />
      <main>
        <Hero />

        {/* Popular stays */}
        <section ref={staysRef} className="mx-auto mt-10 max-w-[1440px] scroll-mt-24 px-4 sm:px-6 lg:mt-14 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className={sectionHeading}>
                {category === 'trending' || !categoryLabel
                  ? 'Popular stays'
                  : `${categoryLabel} stays`}
              </h2>
              <p className={sectionSub}>
                {loading
                  ? 'Finding homes you’ll love…'
                  : `${properties.length} ${properties.length === 1 ? 'stay' : 'stays'} · Verified photos and guest reviews`}
                {isSearching && !loading && (
                  <span className="font-medium text-ink-900">
                    {' '}· results for “{searchSummary}”
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSearching && (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-900 transition-colors hover:border-ink-900"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear search
                </button>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  source === 'server'
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-ink-50 text-ink-500'
                }`}
              >
                {source === 'server' ? (
                  <ServerCog className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {source === 'server' ? 'Live API · PostgreSQL' : 'Demo data (offline)'}
              </span>
              <button
                type="button"
                aria-pressed={mapOpen}
                onClick={() => setMapOpen((v) => !v)}
                className="hidden items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:flex"
              >
                {mapOpen ? 'Hide map' : 'Show map'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <FilterBar
              filters={filters}
              onToggleInstant={() =>
                setFilters((f) => ({ ...f, instantBook: !f.instantBook }))
              }
              onToggleGuestFav={() =>
                setFilters((f) => ({ ...f, guestFavorite: !f.guestFavorite }))
              }
              onOpenModal={() => setFilterOpen(true)}
            />
          </div>

          <div className="mt-6 flex gap-8">
            <div className="min-w-0 flex-1">
              {loading ? (
                <PropertyGrid loading />
              ) : properties.length > 0 ? (
                <PropertyGrid
                  properties={properties}
                  className={`grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 ${
                    mapOpen ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-ink-50 px-6 py-20 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-400 shadow-card">
                    <SearchX className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink-900">
                    No stays match your filters
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-ink-500">
                    Try widening your price range or removing a few filters to
                    see more places.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Desktop map */}
            {mapOpen && (
              <aside className="hidden shrink-0 lg:block lg:w-[380px] xl:w-[440px]">
                <div className="sticky top-32 overflow-hidden rounded-3xl shadow-card">
                  <div className="h-[calc(100dvh-11rem)]">
                    <MapView />
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* Destinations */}
        <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6 lg:mt-20 lg:px-10">
          <h2 className={sectionHeading}>Explore popular destinations</h2>
          <p className={sectionSub}>
            Places travelers can’t stop talking about across the Philippines.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.destinations.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </section>

        {/* Inspiration */}
        <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6 lg:mt-20 lg:px-10">
          <h2 className={sectionHeading}>Get inspiration for your next trip</h2>
          <p className={sectionSub}>
            Curated collections to help you decide where to go next.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.inspirations.map((item) => (
              <InspirationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />

      <FilterModal
        open={filterOpen}
        filters={filters}
        resultCount={activeCount > 0 ? properties.length : mockProperties.length}
        onApply={(next) => {
          setFilters(next)
          setFilterOpen(false)
        }}
        onClose={() => setFilterOpen(false)}
      />

      <ShowMapButton onClick={() => setMapOpen(true)} />
      {mapOpen && <MapOverlay onClose={() => setMapOpen(false)} />}
    </div>
  )
}