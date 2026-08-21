import { Compass, LocateFixed, MapPin, X } from 'lucide-react'

const markers = [
  { price: '₱4,200', top: '22%', left: '18%' },
  { price: '₱5,800', top: '38%', left: '52%' },
  { price: '₱7,200', top: '60%', left: '30%' },
  { price: '₱9,500', top: '44%', left: '74%' },
]

export default function MapView() {
  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[#eef0ea]">
      {/* Stylized map background */}
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 600"
      >
        <rect width="800" height="600" fill="#eef0ea" />
        {/* Roads */}
        <path d="M-20 180 C 180 160, 260 240, 420 210 S 720 150, 840 190" stroke="#ffffff" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M-20 420 C 200 390, 420 470, 840 400" stroke="#ffffff" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M180 -20 C 200 160, 140 320, 220 640" stroke="#ffffff" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M520 -20 C 500 180, 600 360, 540 640" stroke="#ffffff" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M360 240 C 420 300, 380 420, 430 500" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Water */}
        <path d="M40 520 C 140 440, 300 540, 420 500 C 520 470, 640 540, 760 480 L 760 600 L 40 600 Z" fill="#cfe3ee" />
        <path d="M600 -20 C 660 60, 620 140, 780 180 L 800 180 L 800 -20 Z" fill="#cfe3ee" />
        {/* Park blocks */}
        <rect x="440" y="90" width="150" height="90" rx="18" fill="#d6e3c9" transform="rotate(-6 515 135)" />
        <rect x="60" y="300" width="110" height="80" rx="16" fill="#d6e3c9" transform="rotate(8 115 340)" />
        <rect x="660" y="330" width="120" height="80" rx="16" fill="#d6e3c9" transform="rotate(-10 720 370)" />
      </svg>

      <div className="absolute inset-0" aria-hidden="true">
        {markers.map((m) => (
          <div
            key={m.price}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ top: m.top, left: m.left }}
          >
            <div className="group flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 bg-white py-1.5 pl-2 pr-3 shadow-float transition-transform duration-200 hover:scale-105">
              <span className="text-brand-600" aria-hidden="true">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-ink-900">{m.price}</span>
            </div>
            <div className="mx-auto mt-1 h-2 w-2 rotate-45 border-b border-r border-ink-200 bg-white" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Recentre map"
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-float transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Show map controls"
        className="absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-float transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="absolute left-3 top-3 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-float">
        Bantayan Island, Cebu
      </div>
    </div>
  )
}

export function MapOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-up lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Map view"
    >
      <div className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-ink-900">
          Bantayan Island, Cebu
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close map"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <MapView />
      </div>
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-pop transition-colors hover:bg-ink-800"
        >
          Show list
        </button>
      </div>
    </div>
  )
}

export function ShowMapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
    >
      <MapPin className="h-4 w-4" aria-hidden="true" />
      Show map
    </button>
  )
}