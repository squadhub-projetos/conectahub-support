import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import type { ClientGuideGroup } from '../types/database'
import { fetchClientGuideGroups } from '../lib/queries'
import type { SupportClientData } from '../contexts/AuthContext'
import './ClientArea.css'

interface ClientAreaProps {
  clientData: SupportClientData
}

export default function ClientArea({ clientData }: ClientAreaProps) {
  const [groups, setGroups] = useState<ClientGuideGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        if (import.meta.env.DEV) console.log('[support] ClientArea loading for clientId:', clientData.id, 'display_name:', clientData.display_name)
        const data = await fetchClientGuideGroups(clientData.id)
        if (!cancelled) setGroups(data)
      } catch (err) {
        if (!cancelled) {
          setError('Não foi possível carregar sua área agora.')
          console.error('[ClientArea]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clientData.id])

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="client-area-section">
      <div className="client-area-inner">
        <div className="client-area-header">
          <div>
            <h2 className="client-area-title">Sua Área</h2>
            <p className="client-area-subtitle">
              Tutoriais e treinamentos preparados para a sua operação.
            </p>
          </div>
          <span className="client-area-badge">{clientData.display_name}</span>
        </div>

        {loading ? (
          <div className="client-area-groups">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="client-area-group-skeleton" />
            ))}
          </div>
        ) : error ? (
          <p className="client-area-error">{error}</p>
        ) : groups.length === 0 ? (
          <div className="client-area-empty">
            <BookOpen size={32} strokeWidth={1.5} className="client-area-empty-icon" />
            <p className="client-area-empty-text">
              Nenhum guia disponível para sua área ainda.
            </p>
          </div>
        ) : (
          <div className="client-area-groups">
            {groups.map((group, idx) => {
              const catId = group.category?.id ?? `uncategorized-${idx}`
              const catName = group.category?.name ?? 'Sem categoria'
              const isOpen = openCategories.has(catId)
              return (
                <div key={catId} className="client-area-group">
                  <button
                    type="button"
                    className="client-area-group-toggle"
                    onClick={() => toggleCategory(catId)}
                    aria-expanded={isOpen}
                  >
                    <span className="client-area-group-toggle-icon">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="client-area-group-name">{catName}</span>
                    <span className="client-area-group-guide-count">
                      {group.guides.length} guia{group.guides.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="client-area-guide-list">
                      {group.guides.map((guide) => (
                        <li key={guide.id}>
                          <Link
                            to={`/suporte/guia/${guide.id}`}
                            className="client-area-guide-link"
                          >
                            <span className="client-area-guide-title">{guide.title}</span>
                            {guide.excerpt && (
                              <span className="client-area-guide-excerpt">{guide.excerpt}</span>
                            )}
                            {guide.estimated_read_minutes && (
                              <span className="client-area-guide-meta">
                                ⏱ {guide.estimated_read_minutes} min
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
