import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { fetchClients, fetchClientGuidesForEditor, deleteGuide } from '../lib/queries'
import type { SupportClient, EditorClientGuideGroup, DbGuideWithCategory } from '../types/database'
import CreateClientGuideModal from './CreateClientGuideModal'
import DeleteGuideModal from './DeleteGuideModal'
import { getReadableError } from '../utils/getReadableError'
import './EditorClientArea.css'

export default function EditorClientArea() {
  const navigate = useNavigate()

  const [clients, setClients] = useState<SupportClient[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState('')

  const [groups, setGroups] = useState<EditorClientGuideGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<DbGuideWithCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchClients().then((list) => {
      setClients(list)
      if (list.length > 0) setSelectedClientId(list[0].id)
    }).catch(() => {}).finally(() => setClientsLoading(false))
  }, [])

  function loadGroups(clientId: string) {
    if (!clientId) { setGroups([]); return }
    setGroupsLoading(true)
    setGroupsError(null)
    fetchClientGuidesForEditor(clientId)
      .then((data) => setGroups(data))
      .catch((err) => setGroupsError(getReadableError(err)))
      .finally(() => setGroupsLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    if (!selectedClientId) { setGroups([]); return }
    setGroupsLoading(true)
    setGroupsError(null)
    fetchClientGuidesForEditor(selectedClientId)
      .then((data) => { if (!cancelled) setGroups(data) })
      .catch((err) => { if (!cancelled) setGroupsError(getReadableError(err)) })
      .finally(() => { if (!cancelled) setGroupsLoading(false) })
    return () => { cancelled = true }
  }, [selectedClientId])

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
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </select>
            )}
            {selectedClientId && (
              <button
                type="button"
                className="eca-new-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={14} strokeWidth={2.5} />
                Novo guia para este cliente
              </button>
            )}
          </div>
        </div>

        {selectedClientId && (
          <>
            {groupsLoading && (
              <div className="eca-groups">
                {[1, 2].map((i) => <div key={i} className="eca-group-skeleton" />)}
              </div>
            )}

            {groupsError && (
              <p className="eca-error">{groupsError}</p>
            )}

            {!groupsLoading && !groupsError && groups.length === 0 && (
              <div className="eca-empty">
                <p className="eca-empty-text">Nenhum guia exclusivo criado para este cliente ainda.</p>
              </div>
            )}

            {!groupsLoading && !groupsError && groups.length > 0 && (
              <div className="eca-groups">
                <p className="eca-count">{totalGuides} guia{totalGuides !== 1 ? 's' : ''} para {selectedClient?.display_name}</p>
                {groups.map((group, idx) => (
                  <div key={group.category?.id ?? `uncategorized-${idx}`} className="eca-group">
                    <p className="eca-group-name">
                      {group.category?.name ?? 'Sem categoria'}
                    </p>
                    <ul className="eca-guide-list">
                      {group.guides.map((guide) => (
                        <li key={guide.id} className="eca-guide-item">
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
                            {guide.excerpt && <span className="eca-guide-excerpt">{guide.excerpt}</span>}
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
                  </div>
                ))}
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
