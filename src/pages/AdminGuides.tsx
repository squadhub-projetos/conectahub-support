import { useState, useEffect, useMemo } from 'react'
import { Search, X as XIcon, Plus } from 'lucide-react'
import { fetchCategories, fetchAllGuides, deleteGuide } from '../lib/queries'
import type { DbCategory, DbGuideWithCategory } from '../types/database'
import CategoryCard from '../components/CategoryCard'
import CategoryGuidesOverlay from '../components/CategoryGuidesOverlay'
import SearchResultsOverlay from '../components/SearchResultsOverlay'
import AdminRouteGuard from '../components/AdminRouteGuard'
import CreateGuideModal from '../components/CreateGuideModal'
import DeleteGuideModal from '../components/DeleteGuideModal'
import EditorClientArea from '../components/EditorClientArea'
import './SupportHome.css'
import './AdminGuides.css'

export default function AdminGuides() {
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [guides, setGuides] = useState<DbGuideWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<DbGuideWithCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [cats, gs] = await Promise.all([fetchCategories(), fetchAllGuides()])
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

  async function handleDeleteConfirm() {
    if (!guideToDelete) return
    setDeleting(true)
    try {
      await deleteGuide(guideToDelete.id)
      setGuides((prev) => prev.filter((g) => g.id !== guideToDelete.id))
      setGuideToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="support-home">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Central de Suporte</h1>
            <p className="hero-subtitle">
              Clique em uma categoria para ver e editar os guias, ou crie um novo guia abaixo.
            </p>
            <div className="search-wrap">
              <span className="search-icon-wrap">
                <Search size={18} strokeWidth={2} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar todos os guias…"
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

        {error ? (
          <div className="data-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <section className="categories-section">
            <div className="section-inner">
              <div className="admin-section-header">
                <h2 className="section-title">Guias gerais</h2>
                <span className="admin-guide-count">{guides.length} guias</span>
                <button
                  type="button"
                  className="admin-new-guide-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Novo guia geral
                </button>
              </div>
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
                      onClick={() => setActiveCategoryId(cat.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <EditorClientArea />
      </div>

      {activeCategoryId && activeCategory && (
        <CategoryGuidesOverlay
          category={activeCategory}
          guides={categoryGuides}
          onClose={() => setActiveCategoryId(null)}
          mode="editor"
          onDeleteGuide={setGuideToDelete}
        />
      )}

      {showSearch && search.trim() && (
        <SearchResultsOverlay
          query={search}
          guides={guides}
          onClose={() => setShowSearch(false)}
          mode="editor"
        />
      )}

      {showCreateModal && (
        <CreateGuideModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {guideToDelete && (
        <DeleteGuideModal
          guide={guideToDelete}
          deleting={deleting}
          onCancel={() => setGuideToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </AdminRouteGuard>
  )
}
