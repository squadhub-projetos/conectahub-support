import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { fetchClients, fetchClientGuidesForEditor, deleteGuide, updateGuide } from '../lib/queries'
import type { SupportClient, EditorClientGuideGroup, DbGuideWithCategory } from '../types/database'
import CreateClientGuideModal from './CreateClientGuideModal'
import DeleteGuideModal from './DeleteGuideModal'
import { getReadableError } from '../utils/getReadableError'
import './EditorClientArea.css'

function sortGuides(guides: DbGuideWithCategory[]): DbGuideWithCategory[] {
  return [...guides].sort((a, b) => {
    const sa = typeof a.metadata?.sort_order === 'number' ? a.metadata.sort_order : 999999
    const sb = typeof b.metadata?.sort_order === 'number' ? b.metadata.sort_order : 999999
    return sa !== sb ? sa - sb : a.title.localeCompare(b.title)
  })
}

export default function EditorClientArea() {
  const navigate = useNavigate()

  const [clients, setClients] = useState<SupportClient[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState('')

  const [groups, setGroups] = useState<EditorClientGuideGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  const [dragGuideId, setDragGuideId] = useState<string | null>(null)
  const [dragOverGuideId, setDragOverGuideId] = useState<string | null>(null)
  const [dragGuideCatId, setDragGuideCatId] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<DbGuideWithCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchClients()
      .then((list) => setClients(list))
      .catch(() => {})
      .finally(() => setClientsLoading(false))
  }, [])

  function loadGroups(clientId: string) {
    if (!clientId) { setGroups([]); return }
    setGroupsLoading(true)
    setGroupsError(null)
    fetchClientGuidesForEditor(clientId)
      .then((data) => { setGroups(data); setOpenCategories(new Set()) })
      .catch((err) => setGroupsError(getReadableError(err)))
      .finally(() => setGroupsLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    if (!selectedClientId) { setGroups([]); setOpenCategories(new Set()); return }
    setGroupsLoading(true)
    setGroupsError(null)
    fetchClientGuidesForEditor(selectedClientId)
      .then((data) => { if (!cancelled) { setGroups(data); setOpenCategories(new Set()) } })
      .catch((err) => { if (!cancelled) setGroupsError(getReadableError(err)) })
      .finally(() => { if (!cancelled) setGroupsLoading(false) })
    return () => { cancelled = true }
  }, [selectedClientId])

  function toggleCategory(catId: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  function handleGuideDragStart(e: React.DragEvent, catId: string, guideId: string) {
    e.dataTransfer.effectAllowed = 'move'
    setDragGuideCatId(catId)
    setDragGuideId(guideId)
  }

  function handleGuideDragOver(e: React.DragEvent, catId: string, guideId: string) {
    e.preventDefault()
    if (dragGuideCatId !== catId) return
    setDragOverGuideId(guideId)
  }

  function handleGuideDrop(e: React.DragEvent, catId: string, targetGuideId: string) {
    e.preventDefault()
    if (!dragGuideId || dragGuideCatId !== catId || dragGuideId === targetGuideId) {
      setDragGuideId(null); setDragOverGuideId(null); setDragGuideCatId(null)
      return
    }
    setGroups((prev) =>
      prev.map((group) => {
        const gid = group.category?.id ?? 'uncategorized'
        if (gid !== catId) return group
        const sorted = sortGuides(group.guides)
        const fromIdx = sorted.findIndex((g) => g.id === dragGuideId)
        const toIdx = sorted.findIndex((g) => g.id === targetGuideId)
        if (fromIdx === -1 || toIdx === -1) return group
        const reordered = [...sorted]
        const [moved] = reordered.splice(fromIdx, 1)
        reordered.splice(toIdx, 0, moved)
        const withOrder = reordered.map((g, i) => ({
          ...g,
          metadata: { ...(g.metadata ?? {}), sort_order: i },
        })) as DbGuideWithCategory[]
        withOrder.forEach((g) =>
          updateGuide(g.id, { metadata: g.metadata as Record<string, unknown> }).catch(() => {})
        )
        return { ...group, guides: withOrder }
      })
    )
    setDragGuideId(null)
    setDragOverGuideId(null)
    setDragGuideCatId(null)
  }

  function handleGuideDragEnd() {
    setDragGuideId(null)
    setDragOverGuideId(null)
    setDragGuideCatId(null)
  }

  async function handleDeleteConfirm() {
    if (!guideToDelete) return
    setDeleting(true)
    try {
      await deleteGuide(guideToDelete.id)
      setGroups((prev) =>
        prev
          .map((g) => ({ ...g, guides: g.guides.filter((guide) => guide.id !== guideToDelete.id) }))
          .filter((g) => g.category !== null || g.guides.length > 0)
      )
      setGuideToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  function handleCreated(guideId: string) {
    setShowCreateModal(false)
    loadGroups(selectedClientId)
    navigate(`/admin/guides/${guideId}/edit`)
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null
  const totalGuides = groups.reduce((sum, g) => sum + g.guides.length, 0)

  return (
    <section className="eca-section">
      <div className="eca-inner">
        <div className="eca-header">
          <div className="eca-header-left">
            <h2 className="eca-title">Áreas de clientes</h2>
            <p className="eca-subtitle">Guias exclusivos por cliente.</p>
          </div>
          <div className="eca-header-controls">
            {clientsLoading ? (
              <div className="eca-select-skeleton" />
            ) : clients.length === 0 ? (
              <p className="eca-no-clients">Nenhum cliente cadastrado.</p>
            ) : (
              <select
                className="eca-client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="eca-new-btn"
              onClick={() => setShowCreateModal(true)}
              disabled={!selectedClientId}
            >
              <Plus size={14} strokeWidth={2.5} />
              Novo guia
            </button>
          </div>
        </div>

        {!selectedClientId && !clientsLoading && clients.length > 0 && (
          <div className="eca-empty">
            <p className="eca-empty-text">Selecione um cliente acima para ver e gerenciar os guias.</p>
          </div>
        )}

        {selectedClientId && (
          <>
            {groupsLoading && (
              <div className="eca-groups">
                {[1, 2].map((i) => <div key={i} className="eca-group-skeleton" />)}
              </div>
            )}

            {groupsError && <p className="eca-error">{groupsError}</p>}

            {!groupsLoading && !groupsError && groups.length === 0 && (
              <div className="eca-empty">
                <p className="eca-empty-text">Nenhum guia exclusivo criado para este cliente ainda.</p>
              </div>
            )}

            {!groupsLoading && !groupsError && groups.length > 0 && (
              <div className="eca-groups">
                <p className="eca-count">
                  {totalGuides} guia{totalGuides !== 1 ? 's' : ''} para {selectedClient?.display_name}
                </p>
                {groups.map((group, idx) => {
                  const catId = group.category?.id ?? `uncategorized-${idx}`
                  const isOpen = openCategories.has(catId)
                  const sorted = sortGuides(group.guides)
                  return (
                    <div key={catId} className="eca-group">
                      <button
                        type="button"
                        className="eca-group-toggle"
                        onClick={() => toggleCategory(catId)}
                        aria-expanded={isOpen}
                      >
                        <span className="eca-group-toggle-icon">
                          {isOpen ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
                        </span>
                        <span className="eca-group-name">{group.category?.name ?? 'Sem categoria'}</span>
                        <span className="eca-group-guide-count">
                          {group.guides.length} guia{group.guides.length !== 1 ? 's' : ''}
                        </span>
                        {group.category && !group.category.is_active && (
                          <span className="eca-badge eca-badge--hidden">Oculta</span>
                        )}
                      </button>

                      {isOpen && (
                        <ul className="eca-guide-list">
                          {sorted.map((guide) => (
                            <li
                              key={guide.id}
                              className={[
                                'eca-guide-item',
                                dragGuideId === guide.id ? 'eca-guide-item--dragging' : '',
                                dragOverGuideId === guide.id && dragGuideCatId === catId ? 'eca-guide-item--dragover' : '',
                              ].filter(Boolean).join(' ')}
                              draggable
                              onDragStart={(e) => handleGuideDragStart(e, catId, guide.id)}
                              onDragOver={(e) => handleGuideDragOver(e, catId, guide.id)}
                              onDrop={(e) => handleGuideDrop(e, catId, guide.id)}
                              onDragEnd={handleGuideDragEnd}
                            >
                              <span className="eca-drag-handle" title="Arrastar para reordenar">
                                <GripVertical size={14} strokeWidth={2} />
                              </span>
                              <div className="eca-guide-body">
                                <div className="eca-guide-meta">
                                  {guide.status === 'client_draft' && (
                                    <span className="eca-badge eca-badge--draft">Rascunho</span>
                                  )}
                                  {guide.status === 'client_published' && (
                                    <span className="eca-badge eca-badge--published">Publicado</span>
                                  )}
                                </div>
                                <span className="eca-guide-title">{guide.title}</span>
                                {guide.excerpt && (
                                  <span className="eca-guide-excerpt">{guide.excerpt}</span>
                                )}
                                {guide.estimated_read_minutes && (
                                  <span className="eca-guide-time">⏱ {guide.estimated_read_minutes} min</span>
                                )}
                              </div>
                              <div className="eca-guide-actions">
                                <Link
                                  to={`/admin/guides/${guide.id}/edit`}
                                  className="eca-btn eca-btn--edit"
                                >
                                  Editar
                                </Link>
                                <a
                                  href={`/admin/guides/${guide.id}/preview`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="eca-btn eca-btn--view"
                                >
                                  Visualizar
                                </a>
                                <button
                                  type="button"
                                  className="eca-btn eca-btn--delete"
                                  onClick={() => setGuideToDelete(guide)}
                                  aria-label="Excluir guia"
                                >
                                  <Trash2 size={13} strokeWidth={2} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && selectedClient && (
        <CreateClientGuideModal
          clientId={selectedClient.id}
          clientName={selectedClient.display_name}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
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
    </section>
  )
}
