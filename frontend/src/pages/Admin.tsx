import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import {
  ADMIN_TOKEN_KEY,
  adminCreateProperty,
  adminDeleteProperty,
  adminListProperties,
  adminLogin,
  adminUpdateProperty,
  adminUploadImages,
  type AdminPropertyPayload,
} from '../lib/api'
import type { Category, Property } from '../types'

const PLACE_TYPES = ['Entire place', 'Private room', 'Shared room']

const errMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong'

const inputCls =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function LoginScreen({
  onLogin,
  onClerk,
  clerkBusy,
  clerkDenied,
}: {
  onLogin: (token: string) => void
  onClerk: () => void
  clerkBusy?: boolean
  clerkDenied?: string | null
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const token = await adminLogin(password)
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
      onLogin(token)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-ink-900">
          Stayly Admin
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to add and manage accommodation listings.
        </p>

        {clerkDenied && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
          >
            {clerkDenied}
          </p>
        )}

        {!clerkDenied && (
          <>
            <button
              type="button"
              onClick={onClerk}
              disabled={clerkBusy}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
            >
              {clerkBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserRound className="h-4 w-4" aria-hidden="true" />
              )}
              Continue with Clerk
            </button>
            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <span className="h-px flex-1 bg-ink-100" />
              or
              <span className="h-px flex-1 bg-ink-100" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className={labelCls}>
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in with password
          </button>
        </form>
        <a
          href="#/"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to site
        </a>
      </div>
    </div>
  )
}

interface FormState {
  title: string
  location: string
  country: string
  category: string
  price: string
  rating: string
  reviews: string
  dates: string
  propertyType: string
  guests: string
  bedrooms: string
  beds: string
  bathrooms: string
  amenities: string
  description: string
  guestFavorite: boolean
  instantBook: boolean
  images: string[]
}

function formFromProperty(p: Property | null): FormState {
  return {
    title: p?.title ?? '',
    location: p?.location ?? '',
    country: p?.country ?? '',
    category: p?.category ?? '',
    price: String(p?.price ?? ''),
    rating: String(p?.rating ?? ''),
    reviews: String(p?.reviews ?? ''),
    dates: p?.dates ?? '',
    propertyType: p?.propertyType ?? 'Entire place',
    guests: String(p?.guests ?? ''),
    bedrooms: String(p?.bedrooms ?? ''),
    beds: String(p?.beds ?? ''),
    bathrooms: String(p?.bathrooms ?? ''),
    amenities: p?.amenities.join(', ') ?? '',
    description: p?.description ?? '',
    guestFavorite: p?.guestFavorite ?? false,
    instantBook: p?.instantBook ?? false,
    images: p?.images ?? [],
  }
}

function PropertyForm({
  initial,
  categories,
  token,
  onSaved,
  onCancel,
}: {
  initial: Property | null
  categories: Category[]
  token: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => formFromProperty(initial))
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls = await adminUploadImages(token, Array.from(files))
      if (urls.length > 0) set('images', [...form.images, ...urls])
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const addUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    set('images', [...form.images, trimmed])
    setUrlInput('')
  }

  const removeImage = (index: number) =>
    set('images', form.images.filter((_, i) => i !== index))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload: AdminPropertyPayload = {
      title: form.title.trim(),
      location: form.location.trim(),
      country: form.country.trim(),
      category: form.category,
      price: Number(form.price),
      rating: Number(form.rating),
      reviews: Number(form.reviews) || 0,
      dates: form.dates.trim(),
      propertyType: form.propertyType,
      guests: Number(form.guests),
      bedrooms: Number(form.bedrooms) || 0,
      beds: Number(form.beds),
      bathrooms: Number(form.bathrooms) || 0,
      amenities: form.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      description: form.description.trim() || undefined,
      guestFavorite: form.guestFavorite,
      instantBook: form.instantBook,
      images: form.images,
    }
    try {
      if (initial) await adminUpdateProperty(token, initial.id, payload)
      else await adminCreateProperty(token, payload)
      onSaved()
    } catch (err) {
      setError(errMessage(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
          {initial ? 'Edit listing' : 'Add a new listing'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          aria-label="Close form"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Seafront villa with pool"
              required
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="El Nido, Palawan"
            required
          />
        </Field>
        <Field label="Country">
          <input
            className={inputCls}
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            placeholder="Philippines"
            required
          />
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Place type">
          <select
            className={inputCls}
            value={form.propertyType}
            onChange={(e) => set('propertyType', e.target.value)}
          >
            {PLACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price per night (₱)">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="3500"
            required
          />
        </Field>
        <Field label="Rating (0–5)">
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className={inputCls}
            value={form.rating}
            onChange={(e) => set('rating', e.target.value)}
            placeholder="4.8"
            required
          />
        </Field>
        <Field label="Reviews">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.reviews}
            onChange={(e) => set('reviews', e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Available dates">
          <input
            className={inputCls}
            value={form.dates}
            onChange={(e) => set('dates', e.target.value)}
            placeholder="Aug 20 – Sep 2"
          />
        </Field>
        <Field label="Guests">
          <input
            type="number"
            min="1"
            className={inputCls}
            value={form.guests}
            onChange={(e) => set('guests', e.target.value)}
            placeholder="4"
            required
          />
        </Field>
        <Field label="Bedrooms">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.bedrooms}
            onChange={(e) => set('bedrooms', e.target.value)}
            placeholder="2"
          />
        </Field>
        <Field label="Beds">
          <input
            type="number"
            min="1"
            className={inputCls}
            value={form.beds}
            onChange={(e) => set('beds', e.target.value)}
            placeholder="3"
            required
          />
        </Field>
        <Field label="Bathrooms">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.bathrooms}
            onChange={(e) => set('bathrooms', e.target.value)}
            placeholder="2"
          />
        </Field>
        <Field label="Amenities (comma-separated)">
          <input
            className={inputCls}
            value={form.amenities}
            onChange={(e) => set('amenities', e.target.value)}
            placeholder="Wifi, Pool, Kitchen"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              rows={3}
              className={inputCls}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="A short description of the stay…"
            />
          </Field>
        </div>
      </div>

      <div>
        <span className={labelCls}>Photos</span>
        <div className="flex flex-wrap gap-3">
          {form.images.map((img, i) => (
            <div key={img} className="group relative h-20 w-28 overflow-hidden rounded-xl border border-ink-200">
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink-700 shadow-sm transition-colors hover:bg-white hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink-300 text-ink-500 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-[11px] font-semibold">Upload</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className={inputCls}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
            placeholder="…or paste an image URL"
          />
          <button
            type="button"
            onClick={addUrl}
            className="shrink-0 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
          >
            Add URL
          </button>
        </div>
        {form.images.length === 0 && (
          <p className="mt-2 text-xs text-ink-500">
            Upload photos to Cloudinary or add an image URL — at least one is
            required.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={form.guestFavorite}
            onChange={(e) => set('guestFavorite', e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 accent-brand-600"
          />
          Guest favorite
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={form.instantBook}
            onChange={(e) => set('instantBook', e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 accent-brand-600"
          />
          Instant booking
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {initial ? 'Save changes' : 'Create listing'}
        </button>
      </div>
    </form>
  )
}

export default function Admin() {
  const { isSignedIn, getToken } = useAuth()
  const { openSignIn, signOut } = useClerk()
  const { user } = useUser()
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY),
  )
  const [clerkDenied, setClerkDenied] = useState<string | null>(null)
  const [clerkBusy, setClerkBusy] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)

  useEffect(() => {
    if (token || !isSignedIn) {
      setClerkBusy(false)
      return
    }
    let cancelled = false
    setClerkBusy(true)
    ;(async () => {
      try {
        const clerkToken = await getToken()
        if (!clerkToken) return
        await adminListProperties(clerkToken)
        if (!cancelled) setToken(clerkToken)
      } catch (err) {
        if (!cancelled) {
          const message = errMessage(err)
          if (message.includes('403')) {
            setClerkDenied('This Clerk account is not allowed to manage listings. Use the admin password instead.')
          } else {
            setClerkDenied(message)
          }
        }
      } finally {
        if (!cancelled) setClerkBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, token])

  const reload = useCallback(async (tok: string) => {
    setLoading(true)
    setError(null)
    try {
      const [props, cats] = await Promise.all([
        adminListProperties(tok),
        fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/categories`).then((r) =>
          r.json(),
        ) as Promise<Category[]>,
      ])
      setProperties(props)
      setCategories(cats)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) reload(token)
  }, [token, reload])

  const logout = async () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken(null)
    setFormOpen(false)
    setEditing(null)
    setClerkDenied(null)
    if (isSignedIn) await signOut()
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (p: Property) => {
    setEditing(p)
    setFormOpen(true)
  }

  const remove = async (p: Property) => {
    if (!token) return
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return
    setError(null)
    try {
      await adminDeleteProperty(token, p.id)
      await reload(token)
    } catch (err) {
      setError(errMessage(err))
    }
  }

  if (!token) {
    return (
      <LoginScreen
        onLogin={setToken}
        onClerk={() => void openSignIn()}
        clerkBusy={clerkBusy}
        clerkDenied={clerkDenied}
      />
    )
  }

  const who = isSignedIn
    ? user?.primaryEmailAddress?.emailAddress ?? 'Clerk account'
    : 'password'

  return (
    <div className="min-h-dvh bg-ink-50 pb-16">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="#/"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to site</span>
            </a>
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              Stayly Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-ink-500 sm:inline">
              {who}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
              Listings
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {loading
                ? 'Loading…'
                : `${properties.length} ${properties.length === 1 ? 'listing' : 'listings'} · shown on the public site`}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add listing
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {formOpen ? (
          <div className="mt-6">
            <PropertyForm
              initial={editing}
              categories={categories}
              token={token}
              onCancel={() => {
                setFormOpen(false)
                setEditing(null)
              }}
              onSaved={async () => {
                await reload(token)
                setFormOpen(false)
                setEditing(null)
              }}
            />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 font-semibold">Listing</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Rating</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-ink-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden="true" />
                      </td>
                    </tr>
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-ink-500">
                        No listings yet. Click “Add listing” to create one.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p.id} className="border-b border-ink-50 transition-colors hover:bg-ink-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt=""
                              className="h-11 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{p.title}</p>
                              <p className="truncate text-xs text-ink-500">
                                {p.location}, {p.country}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 capitalize text-ink-700">{p.category}</td>
                        <td className="px-5 py-3 font-medium text-ink-900">₱{p.price.toLocaleString()}</td>
                        <td className="px-5 py-3 text-ink-700">{p.rating.toFixed(1)} · {p.reviews}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              aria-label={`Edit ${p.title}`}
                              onClick={() => openEdit(p)}
                              className="rounded-full p-2 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${p.title}`}
                              onClick={() => remove(p)}
                              className="rounded-full p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}