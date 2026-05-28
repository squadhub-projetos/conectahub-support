import { useMemo, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import type { DbGuideWithCategory } from '../types/database'
import GuideListItem from './GuideListItem'
import EditorGuideItem from './EditorGuideItem'
import './SearchResultsOverlay.css'

interface SearchResultsOverlayProps {
  query: string
  guides: DbGuideWithCategory[]
  clientGuides?: DbGuideWithCategory[]
  onClose: () => void
  mode?: 'editor'
}

export default function SearchResultsOverlay({
  query,
  guides,
  clientGuides,
  onClose,
  mode,
}: SearchResultsOverlayProps) {
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

  const groups = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    function matchesQuery(g: DbGuideWithCategory) {
      return (
        g.title.toLowerCase().includes(q) ||
        (g.excerpt ?? '').toLowerCase().includes(q) ||
        (g.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (g.category?.name ?? '').toLowerCase().includes(q) ||
        (typeof g.content_markdown === 'string' && g.content_markdown.toLowerCase().includes(q))
      )
    }

    const generalMatched = guides.filter(matchesQuery)
    const map = new Map<string, DbGuideWithCategory[]>()
    for (const guide of generalMatched) {
      const catName = guide.category?.name ?? 'Geral'
      if (!map.has(catName)) map.set(catName, [])
      map.get(catName)!.push(guide)
    }
    const result = Array.from(map.entries()).map(([name, gs]) => ({ name, guides: gs, isClientArea: false }))

    if (clientGuides && clientGuides.length > 0) {
      const clientMatched = clientGuides.filter(matchesQuery)
      if (clientMatched.length > 0) {
        result.push({ name: 'Sua Área', guides: clientMatched, isClientArea: true })
      }
    }

    return result
  }, [guides, clientGuides, query])

  const totalCount = groups.reduce((sum, g) => sum + g.guides.length, 0)

  return (
    <div className="sro-backdrop" onClick={onClose}>
      <div className="sro-panel" onClick={(e) => e.stopPropagation()}>

        <div className="sro-header">
          <Search size={16} className="sro-search-icon" />
          <span className="sro-query">"{query}"</span>
          {totalCount > 0 && (
            <span className="sro-count-badge">
              {totalCount} resultado{totalCount !== 1 ? 's' : ''}
            </span>
          )}
          <button type="button" className="sro-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="sro-results">
          {groups.length === 0 ? (
            <div className="sro-empty">
              <span className="sro-empty-icon">🔍</span>
              <p className="sro-empty-title">Nenhum resultado para "{query}".</p>
              <p className="sro-empty-hint">Tente outras palavras-chave.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.name} className={`sro-group${group.isClientArea ? ' sro-group--client' : ''}`}>
                <div className="sro-group-header">
                  <h3 className="sro-group-name">
                    {group.isClientArea && <span className="sro-client-badge">Sua Área</span>}
                    {group.name}
                  </h3>
                  <span className="sro-group-count">
                    {group.guides.length} guia{group.guides.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="sro-guide-list">
                  {group.guides.map((guide) =>
                    mode === 'editor' ? (
                      <EditorGuideItem key={guide.id} guide={guide} />
                    ) : group.isClientArea ? (
                      <GuideListItem key={guide.id} guide={guide} clientRoute onClick={onClose} />
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
