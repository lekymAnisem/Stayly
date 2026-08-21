import {
  Flame,
  Gem,
  HousePlus,
  LandPlot,
  Mountain,
  MountainSnow,
  Palmtree,
  Sailboat,
  Trees,
  Waves,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '../types'

const iconMap: Record<string, LucideIcon> = {
  Waves,
  Mountain,
  Trees,
  Palmtree,
  Wheat,
  MountainSnow,
  Gem,
  HousePlus,
  Sailboat,
  Flame,
  LandPlot,
}

export default function CategoryNav({
  active,
  onChange,
  categories,
}: {
  active: string
  onChange: (id: string) => void
  categories: Category[]
}) {
  return (
    <nav
      aria-label="Browse by category"
      className="sticky top-[120px] z-30 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:top-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="category-rail flex items-stretch gap-1 overflow-x-auto py-3">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Waves
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(cat.id)}
                className={`group flex min-w-fit flex-col items-center gap-1.5 px-3 pb-2 pt-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5 ${
                    isActive ? 'text-brand-600' : 'text-ink-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="relative text-xs font-medium">
                  {cat.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-ink-900 transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}