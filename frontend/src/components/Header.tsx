import { useEffect, useRef, useState } from 'react'
import { useAuth, useClerk, UserButton } from '@clerk/clerk-react'
import { Globe, Heart, Menu } from 'lucide-react'
import HeroSearchBar, { HeroSearchBarCompact } from './HeroSearchBar'

function BrandMark() {
  return (
    <a
      href="#"
      aria-label="Stayly home"
      className="flex items-center gap-2 text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
        <path
          d="M12 2.5 3.5 8.2V21h5.2v-6.3c0-1.8 1.5-3.2 3.3-3.2s3.3 1.4 3.3 3.2V21h5.2V8.2L12 2.5Z"
          fill="currentColor"
        />
        <path d="M12 2.5 20.5 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-extrabold tracking-tight text-ink-900">
        stayly
      </span>
    </a>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { isSignedIn } = useAuth()
  const { openSignIn, openSignUp } = useClerk()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-1 shadow-[0_1px_2px_rgba(23,21,28,0.06)] hover:shadow-pop">
        <a
          href="#/admin"
          className="rounded-full px-3 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Admin
        </a>
        <UserButton
          afterSignOutUrl="/"
          userProfileMode="modal"
          appearance={{
            elements: { avatarBox: { width: 32, height: 32 } },
          }}
        />
      </div>
    )
  }

  const items: Array<{
    label: string
    bold?: boolean
    href?: string
    onClick?: () => void
  }> = [
    { label: 'Sign up', bold: true, onClick: () => void openSignUp() },
    { label: 'Log in', bold: true, onClick: () => void openSignIn() },
    { label: 'Host your home' },
    { label: 'Refer a host' },
    { label: 'Help center' },
    { label: 'Admin dashboard', href: '#/admin' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2.5 rounded-full border border-ink-200 bg-white py-1.5 pl-3 pr-1.5 shadow-[0_1px_2px_rgba(23,21,28,0.06)] transition-shadow hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Menu className="h-4 w-4 text-ink-900" aria-hidden="true" />
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-xs font-bold text-white"
          aria-hidden="true"
        >
          S
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-60 origin-top-right animate-fade-up rounded-2xl border border-ink-100 bg-white py-2 shadow-pop"
        >
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href ?? '#'}
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
              className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-ink-50 focus-visible:bg-ink-50 focus-visible:outline-none ${
                item.bold ? 'font-semibold text-ink-900' : 'text-ink-700'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function HeaderActions({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {!compact && (
        <button
          type="button"
          className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:block"
        >
          Become a host
        </button>
      )}
      <button
        type="button"
        aria-label="Language and currency"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Globe className="h-5 w-5" aria-hidden="true" />
      </button>
      {compact && (
        <button
          type="button"
          aria-label="Wishlist"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {!compact && <UserMenu />}
    </>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white transition-shadow duration-300 ${
        scrolled ? 'border-ink-200 shadow-[0_2px_8px_rgba(23,21,28,0.08)]' : 'border-ink-100'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* Mobile row: brand + compact actions */}
        <div className="flex h-14 items-center justify-between lg:hidden">
          <BrandMark />
          <div className="flex items-center gap-1">
            <HeaderActions compact />
          </div>
        </div>

        {/* Mobile search */}
        <div className="flex h-16 items-center pb-3 lg:hidden">
          <HeroSearchBarCompact />
        </div>

        {/* Desktop row */}
        <div className="hidden h-20 items-center gap-6 lg:flex">
          <BrandMark />
          <div className="mx-auto flex w-full max-w-2xl justify-center xl:max-w-3xl">
            <HeroSearchBar />
          </div>
          <div className="flex items-center gap-1">
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  )
}

export { BrandMark }