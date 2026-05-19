import { useState, useMemo, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import type { DbCategory, DbGuideWithCategory } from '../types/database'
import CategoryIcon from './CategoryIcon'
import GuideListItem from './GuideListItem'
import EditorGuideItem from './EditorGuideItem'
import { groupBySubcategory } from '../utils/subcategoryGrouping'
import './CategoryGuidesOverlay.css'

interface CategoryGuidesOverlayProps {
  category: DbCategory
  guides: DbGuideWithCategory[]
  onClose: () => void
  mode?: 'editor'
}

export default function CategoryGuidesOverlay({
  category,
  guides,
  onClose,
  mode,
}: CategoryGuidesOverlayProps) {
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    if (!search.trim()) return guides
    const q = search.toLowerCase()
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.excerpt ?? '').toLowerCase().includes(q) ||
        (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
  }, [guides, search])

  const groups = useMemo(() => groupBySubcategory(filtered, category.slug), [filtered, category.slug])

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
          <span className="cgo-guide-count">
            {filtered.length} guia{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Content ── */}
        <div className="cgo-content">
          {groups.length === 0 ? (
            <div className="cgo-empty">
              <span className="cgo-empty-icon">🔍</span>
              <p className="cgo-empty-title">Nenhum guia encontrado para essa busca.</p>
              <p className="cgo-empty-hint">
                Tente buscar por outro termo ou navegue pelas categorias.
              </p>
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
                  {group.guides.map((guide) =>
                    mode === 'editor' ? (
                      <EditorGuideItem key={guide.id} guide={guide} />
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
