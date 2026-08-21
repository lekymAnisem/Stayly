import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import PropertyDetail from './pages/PropertyDetail'
import { SearchProvider } from './lib/SearchContext'

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  let page: React.ReactNode
  if (hash.startsWith('#/admin')) page = <Admin />
  else {
    const match = hash.match(/^#\/properties\/(.+)$/)
    page = match ? <PropertyDetail id={decodeURIComponent(match[1])} /> : <Home />
  }
  return <SearchProvider>{page}</SearchProvider>
}