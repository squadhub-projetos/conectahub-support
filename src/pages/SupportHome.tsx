import { useState, useEffect, useMemo } from 'react'
import { Search, X as XIcon } from 'lucide-react'
import { fetchCategories, fetchGuides } from '../lib/queries'
import type { DbCategory, DbGuideWithCategory } from '../types/database'
import CategoryCard from '../components/CategoryCard'
import CategoryGuidesOverlay from '../components/CategoryGuidesOverlay'
import SearchResultsOverlay from '../components/SearchResultsOverlay'
import SupportRequestForm from '../components/SupportRequestForm'
import SupportTicketForm from '../components/SupportTicketForm'
import ClientArea from '../components/ClientArea'
import { useAuth } from '../contexts/AuthContext'
import './SupportHome.css'

export default function SupportHome() {
  const { role, clientData } = useAuth()
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [guides, setGuides] = useState<DbGuideWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [cats, gs] = await Promise.all([fetchCategories(), fetchGuides()])
        if (!cancelled) {
          setCategories(cats)
          setGuides(gs)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Não foi possível carregar os dados. Tente novamente.')
          console.error(err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId]
  )

  const categoryGuides = useMemo(
    () => (activeCategoryId ? guides.filter((g) => g.category_id === activeCategoryId) : []),
    [guides, activeCategoryId]
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    setShowSearch(val.trim().length > 0)
  }

  function clearSearch() {
    setSearch('')
    setShowSearch(false)
  }

  return (
    <>
      <div className="support-home">
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-eyebrow">Central de Suporte</span>
            <h1 className="hero-title">Como podemos te ajudar?</h1>
            <p className="hero-subtitle">
              Guias, tutoriais e materiais de apoio para você aproveitar ao máximo a plataforma ConectaHub.
            </p>
            <div className="search-wrap">
              <span className="search-icon-wrap">
                <Search size={18} strokeWidth={2} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar guias, tutoriais e tópicos…"
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <button type="button" className="search-clear" onClick={clearSearch} aria-label="Limpar busca">
                  <XIcon size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {role === 'client' && clientData && (
          <ClientArea clientData={clientData} />
        )}

        {error ? (
          <div className="data-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <section className="categories-section">
            <div className="section-inner">
              <div className="section-header-row">
                <h2 className="section-title">Navegue por categoria</h2>
                {!loading && (
                  <span className="section-count">{categories.length} categorias · {guides.length} guias</span>
                )}
              </div>
              {loading ? (
                <div className="categories-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onClick={() => setActiveCategoryId(cat.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <SupportRequestForm />
        <SupportTicketForm />
      </div>

      {activeCategoryId && activeCategory && (
        <CategoryGuidesOverlay
          category={activeCategory}
          guides={categoryGuides}
          onClose={() => setActiveCategoryId(null)}
        />
      )}

      {showSearch && search.trim() && (
        <SearchResultsOverlay
          query={search}
          guides={guides}
          onClose={() => setShowSearch(false)}
        />
      )}
    </>
  )
}
