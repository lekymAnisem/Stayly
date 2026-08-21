import { Globe } from 'lucide-react'

const columns = [
  {
    title: 'Support',
    links: ['Help Center', 'Cancellation options', 'Safety information', 'Neighborhood support'],
  },
  {
    title: 'Hosting',
    links: ['Become a host', 'Hosting resources', 'Community forum', 'Host responsibility'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Newsroom', 'Investors'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Sitemap'],
  },
]

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3V11H9v3h2.3v7h2.2Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="currentColor" aria-hidden="true">
      <path d="M17.6 4h2.9l-6.4 7.3L21.5 20h-5.9l-4.6-6-5.3 6H2.8l6.9-7.8L2.5 4h6l4.2 5.5L17.6 4Zm-1 14.4h1.6L7.5 5.5H5.8l10.8 12.9Z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.2 5 12 5 12 5s-6.2 0-7.9.5A2.4 2.4 0 0 0 2.4 7.2 25 25 0 0 0 2 12a25 25 0 0 0 .4 4.8 2.4 2.4 0 0 0 1.7 1.7c1.7.5 7.9.5 7.9.5s6.2 0 7.9-.5a2.4 2.4 0 0 0 1.7-1.7A25 25 0 0 0 22 12a25 25 0 0 0-.4-4.8ZM10 15.2V8.8L15.2 12 10 15.2Z" />
    </svg>
  )
}

const socials = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'X', Icon: XIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-ink-50">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-bold text-ink-900">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink-600 transition-colors hover:text-ink-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-ink-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-600">© 2026 Stayly</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
            <button
              type="button"
              aria-label="Language"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              English
            </button>
            <button
              type="button"
              aria-label="Currency"
              className="rounded-full px-3 py-1.5 font-medium transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              ₱ PHP
            </button>
          </div>

          <div className="flex items-center gap-2">
            {socials.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}