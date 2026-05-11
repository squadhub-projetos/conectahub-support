import { useState, useEffect, useMemo } from 'react'
import { fetchCategories, fetchGuides } from '../lib/queries'
import type { DbCategory, DbGuideWithCategory } from '../types/database'
import CategoryCard from '../components/CategoryCard'
import GuideCard from '../components/GuideCard'
import './SupportHome.css'

export default function SupportHome() {
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [guides, setGuides] = useState<DbGuideWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
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

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((cat) => [cat.id, guides.filter((g) => g.category_id === cat.id).length])
      ) as Record<string, number>,
    [categories, guides]
  )

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return guides.filter((g) => {
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        (g.excerpt ?? '').toLowerCase().includes(q) ||
        (g.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (g.category?.name ?? '').toLowerCase().includes(q)
      const matchesCategory = !activeCategoryId || g.category_id === activeCategoryId
      return matchesSearch && matchesCategory
    })
  }, [guides, search, activeCategoryId])

  function handleCategoryClick(id: string) {
    setActiveCategoryId((prev) => (prev === id ? null : id))
  }

  function clearFilters() {
    setSearch('')
    setActiveCategoryId(null)
  }

  const hasFilter = search !== '' || activeCategoryId !== null

  return (
    <div className="support-home">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Como podemos te ajudar?</h1>
          <p className="hero-subtitle">
            Guias, tutoriais e materiais de apoio para você aproveitar ao máximo a plataforma.
          </p>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar guias, tutoriais e tópicos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <div className="data-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <section className="categories-section">
            <div className="section-inner">
              <h2 className="section-title">Categorias</h2>
              {loading ? (
                <div className="categories-grid">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      count={categoryCounts[cat.id] ?? 0}
                      isActive={activeCategoryId === cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="guides-section">
            <div className="section-inner">
              <div className="guides-header">
                <h2 className="section-title">
                  {activeCategory ? activeCategory.name : 'Todos os guias'}
                  {!loading && (
                    <span className="guides-count">{filtered.length}</span>
                  )}
                </h2>
                {hasFilter && (
                  <button type="button" className="clear-filter-btn" onClick={clearFilters}>
                    Limpar filtros ✕
                  </button>
                )}
              </div>

              {loading ? (
                <div className="guides-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-guide-card" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="guides-grid">
                  {filtered.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              ) : (
                <div className="guides-empty">
                  <span className="empty-icon">🔍</span>
                  <p>Nenhum guia encontrado para "{search || activeCategory?.name}".</p>
                  <button type="button" className="clear-filter-btn" onClick={clearFilters}>
                    Ver todos os guias
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
