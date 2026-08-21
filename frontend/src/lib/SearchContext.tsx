import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface SearchState {
  query: string
  guests: number
  checkIn: string
  checkOut: string
  /** Bumped on every search submit so consumers can react to repeated searches. */
  nonce: number
}

interface SearchContextValue extends SearchState {
  setQuery: (value: string) => void
  setGuests: (value: number) => void
  setCheckIn: (value: string) => void
  setCheckOut: (value: string) => void
  submit: () => void
  clear: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [guests, setGuests] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [nonce, setNonce] = useState(0)

  const submit = useCallback(() => setNonce((n) => n + 1), [])
  const clear = useCallback(() => {
    setQuery('')
    setGuests(0)
    setCheckIn('')
    setCheckOut('')
    setNonce((n) => n + 1)
  }, [])

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      guests,
      checkIn,
      checkOut,
      nonce,
      setQuery,
      setGuests,
      setCheckIn,
      setCheckOut,
      submit,
      clear,
    }),
    [query, guests, checkIn, checkOut, nonce, submit, clear],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider')
  return ctx
}