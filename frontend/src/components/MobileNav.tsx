import { useState } from 'react'
import { CalendarDays, Compass, Heart, Home, User } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'explore', label: 'Explore', Icon: Compass },
  { id: 'favorites', label: 'Favorites', Icon: Heart },
  { id: 'trips', label: 'Trips', Icon: CalendarDays },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function MobileNav() {
  const [active, setActive] = useState('home')

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActive(id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                isActive ? 'text-brand-600' : 'text-ink-500'
              }`}
            >
              <Icon className={`h-[22px] w-[22px] ${isActive ? 'fill-brand-100' : ''}`} aria-hidden="true" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}