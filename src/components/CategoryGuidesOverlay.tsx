import { useState, useMemo, useEffect } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import type { DbCategory, DbGuideWithCategory } from '../types/database'
import CategoryIcon from './CategoryIcon'
import GuideListItem from './GuideListItem'
import EditorGuideItem from './EditorGuideItem'
import { groupBySubcategory } from '../utils/subcategoryGrouping'
import { fetchGeneralGuidesByCategory, updateGeneralGuideOrder } from '../lib/queries'
import './CategoryGuidesOverlay.css'

interface CategoryGuidesOverlayProps {
  category: DbCategory
  /** Passed as initial/fallback data; fresh data is always fetched from DB on open. */
  guides: DbGuideWithCategory[]
  onClose: () => void
  mode?: 'editor'
  onDeleteGuide?: (guide: DbGuideWithCategory) => void
}

export default function CategoryGuidesOverlay({
  category,
  guides: initialGuides,
  onClose,
  mode,
  onDeleteGuide,
}: CategoryGuidesOverlayProps) {
  const isEditor = mode === 'editor'

  const [search, setSearch] = useState('')
  const [localGuides, setLocalGuides] = useState<DbGuideWithCategory[]>(initialGuides)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Always fetch fresh from DB when the overlay opens or category changes.
  // isEditor controls whether drafts are included.
  useEffect(() => {
    let cancelled = false
    setFetchLoading(true)
    fetchGeneralGuidesByCategory(category.id, isEditor)
      .then((fresh) => { if (!cancelled) setLocalGuides(fresh) })
      .catch(() => { /* keep initialGuides on error */ })
      .finally(() => { if (!cancelled) setFetchLoading(false) })
    return () => { cancelled = true }
  }, [category.id, isEditor])

  const filtered = useMemo(() => {
    if (!search.trim()) return localGuides
    const q = search.toLowerCase()
    return localGuides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.excerpt ?? '').toLowerCase().includes(q) ||
        (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
  }, [localGuides, search])

  const groups = useMemo(() => groupBySubcategory(filtered, category.slug), [filtered, category.slug])

  async function handleMove(
    guide: DbGuideWithCategory,
    groupName: string,
    direction: 'up' | 'down',
  ) {
    const group = groups.find((g) => g.name === groupName)
    if (!group) return
    const idx = group.guides.findIndex((g) => g.id === guide.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === group.guides.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const newGroupGuides = [...group.guides]
    ;[newGroupGuides[idx], newGroupGuides[swapIdx]] = [newGroupGuides[swapIdx], newGroupGuides[idx]]
    const orderedIds = newGroupGuides.map((g) => g.id)

    const snapshot = localGuides
    setLocalGuides((prev) =>
      prev.map((g) => {
        const newIdx = orderedIds.indexOf(g.id)
        if (newIdx === -1) return g
        return { ...g, order_index: newIdx }
      }),
    )

    setSavingOrder(true)
    setOrderError(null)
    try {
      await updateGeneralGuideOrder(orderedIds)
    } catch {
      setOrderError('Erro ao salvar a ordem. Revertendo.')
      setLocalGuides(snapshot)
    } finally {
      setSavingOrder(false)
    }
  }

  function handleDelete(guide: DbGuideWithCategory) {
    setLocalGuides((prev) => prev.filter((g) => g.id !== guide.id))
    onDeleteGuide?.(guide)
  }

  return (
    <div className="cgo-backdrop" onClick={onClose}>
      <div className="cgo-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="cgo-header">
          <div className="cgo-header-content">
            <span className="cgo-icon-wrap">
              <CategoryIcon icon={category.icon} size={26} />
            </span>
            <div className="cgo-title-block">
              <h2 className="cgo-title">{category.name}</h2>
              {category.description && (
                <p className="cgo-desc">{category.description}</p>
              )}
            </div>
          </div>
          <button type="button" className="cgo-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="cgo-search-row">
          <div className="cgo-search-wrap">
            <Search size={15} className="cgo-search-icon" />
            <input
              type="text"
              className="cgo-search-input"
              placeholder={`Buscar em ${category.name}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="cgo-search-clear"
                onClick={() => setSearch('')}
                aria-label="Limpar"
              >
                <X size={13} />
              </button>
            )}
          </div>
          {!fetchLoading && (
            <span className="cgo-guide-count">
              {filtered.length} guia{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Order status feedback (editor only) ── */}
        {isEditor && (savingOrder || orderError) && (
          <div className="cgo-order-status">
            {savingOrder && <span className="cgo-order-saving">Salvando ordem…</span>}
            {orderError && <span className="cgo-order-error">{orderError}</span>}
          </div>
        )}

        {/* ── Content ── */}
        <div className="cgo-content">
          {fetchLoading ? (
            <div className="cgo-loading">
              <Loader2 size={22} className="cgo-loading-icon" />
              <p>Carregando guias…</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="cgo-empty">
              <span className="cgo-empty-icon">🔍</span>
              <p className="cgo-empty-title">
                {search.trim()
                  ? 'Nenhum guia encontrado para essa busca.'
                  : 'Nenhum guia disponível nessa categoria.'}
              </p>
              {search.trim() && (
                <p className="cgo-empty-hint">
                  Tente buscar por outro termo ou navegue pelas categorias.
                </p>
              )}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.name} className="cgo-group">
                <div className="cgo-group-header">
                  <h3 className="cgo-group-name">{group.name}</h3>
                  <span className="cgo-group-count">
                    {group.guides.length} guia{group.guides.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="cgo-guide-list">
                  {group.guides.map((guide, idx) =>
                    isEditor ? (
                      <EditorGuideItem
                        key={guide.id}
                        guide={guide}
                        onDeleteRequest={handleDelete}
                        onMoveUp={() => handleMove(guide, group.name, 'up')}
                        onMoveDown={() => handleMove(guide, group.name, 'down')}
                        isFirst={idx === 0}
                        isLast={idx === group.guides.length - 1}
                      />
                    ) : (
                      <GuideListItem key={guide.id} guide={guide} onClick={onClose} />
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
