import { useState, useEffect, type FormEvent } from 'react'
import { X, UserPlus, Users, ChevronDown, ChevronRight, Plus, MessageSquare, Trash2 } from 'lucide-react'
import {
  fetchClients, fetchClientCategories,
  addClientCategory, toggleClientCategory,
  fetchGuideRequests, updateGuideRequestStatus,
  listSupportEditors, addSupportEditorByEmail, removeSupportEditor,
  upsertSupportClientByEmail,
} from '../lib/queries'
import type { EditorEntry, SupportClient, SupportClientCategory, SupportGuideRequest } from '../types/database'
import { getReadableError } from '../utils/getReadableError'
import './EditorSettingsModal.css'

function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

interface EditorSettingsModalProps {
  onClose: () => void
}

export default function EditorSettingsModal({ onClose }: EditorSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'editors' | 'clients' | 'requests'>('editors')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="esm-backdrop" onClick={onClose}>
      <div className="esm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="esm-header">
          <h2 className="esm-title">Configurações de acesso</h2>
          <button type="button" className="esm-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="esm-tabs">
          <button
            type="button"
            className={`esm-tab${activeTab === 'editors' ? ' esm-tab--active' : ''}`}
            onClick={() => setActiveTab('editors')}
          >
            Editores
          </button>
          <button
            type="button"
            className={`esm-tab${activeTab === 'clients' ? ' esm-tab--active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Clientes
          </button>
          <button
            type="button"
            className={`esm-tab${activeTab === 'requests' ? ' esm-tab--active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Solicitações
          </button>
        </div>

        <div className="esm-body">
          {activeTab === 'editors' && <EditorsTab />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'requests' && <RequestsTab />}
        </div>
      </div>
    </div>
  )
}

// ── Editors Tab ──────────────────────────────────────────────────────────────

function EditorsTab() {
  const [editors, setEditors] = useState<EditorEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'editor' | 'owner'>('editor')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    listSupportEditors()
      .then((list) => { setEditors(list); setLoading(false) })
      .catch((err) => { setError(getReadableError(err)); setLoading(false) })
  }, [])

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAddLoading(true); setAddError(null); setAddSuccess(false)
    try {
      await addSupportEditorByEmail(newEmail.trim(), newRole)
      setAddSuccess(true)
      setNewEmail('')
      listSupportEditors().then(setEditors).catch(() => {})
    } catch (err: unknown) {
      setAddError(getReadableError(err))
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemove(ed: EditorEntry) {
    if (!confirm(`Remover ${ed.email} dos editores?`)) return
    setRemovingId(ed.id)
    try {
      await removeSupportEditor(ed.id)
      setEditors((prev) => prev.filter((e) => e.id !== ed.id))
    } catch (err: unknown) {
      alert(getReadableError(err))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section className="esm-section">
      <div className="esm-section-head">
        <Users size={16} className="esm-section-icon" />
        <h3 className="esm-section-title">Editores autorizados</h3>
      </div>
      {loading ? (
        <p className="esm-hint">Carregando…</p>
      ) : error ? (
        <p className="esm-warn">{error}</p>
      ) : editors.length === 0 ? (
        <p className="esm-hint">Nenhum editor cadastrado.</p>
      ) : (
        <ul className="esm-editor-list">
          {editors.map((ed) => (
            <li key={ed.id} className="esm-editor-item">
              <span className="esm-editor-email">{ed.email}</span>
              <span className={`esm-role-badge esm-role-${ed.role}`}>{ed.role}</span>
              <button
                type="button"
                className="esm-remove-btn"
                onClick={() => handleRemove(ed)}
                disabled={removingId === ed.id}
                aria-label="Remover editor"
              >
                {removingId === ed.id ? '…' : <Trash2 size={13} strokeWidth={2} />}
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="esm-add-form" onSubmit={handleAdd}>
        <div className="esm-add-section-title"><UserPlus size={14} /><span>Adicionar editor</span></div>
        <div className="esm-add-row">
          <input type="email" className="esm-input" placeholder="email@empresa.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={addLoading} required />
          <select className="esm-select" value={newRole} onChange={(e) => setNewRole(e.target.value as 'editor' | 'owner')} disabled={addLoading}>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>
          <button type="submit" className="esm-add-btn" disabled={addLoading || !newEmail.trim()}>{addLoading ? '…' : 'Adicionar'}</button>
        </div>
        {addSuccess && <p className="esm-success">Editor adicionado!</p>}
        {addError && <p className="esm-warn">{addError}</p>}
      </form>
    </section>
  )
}

// ── Clients Tab ──────────────────────────────────────────────────────────────

function ClientsTab() {
  const [clients, setClients] = useState<SupportClient[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [catsByClient, setCatsByClient] = useState<Record<string, SupportClientCategory[]>>({})
  const [newCatName, setNewCatName] = useState<Record<string, string>>({})
  const [catLoading, setCatLoading] = useState<Record<string, boolean>>({})

  const [showCreate, setShowCreate] = useState(false)
  const [cfEmail, setCfEmail] = useState('')
  const [cfUsername, setCfUsername] = useState('')
  const [cfDisplay, setCfDisplay] = useState('')
  const [cfCompany, setCfCompany] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients().then((list) => { setClients(list); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleExpand(clientId: string) {
    if (expandedId === clientId) { setExpandedId(null); return }
    setExpandedId(clientId)
    if (!catsByClient[clientId]) {
      const cats = await fetchClientCategories(clientId).catch(() => [])
      setCatsByClient((prev) => ({ ...prev, [clientId]: cats }))
    }
  }

  async function handleAddCategory(clientId: string) {
    const name = (newCatName[clientId] ?? '').trim()
    if (!name) return
    setCatLoading((p) => ({ ...p, [clientId]: true }))
    try {
      const cat = await addClientCategory(clientId, name, slugify(name))
      setCatsByClient((prev) => ({ ...prev, [clientId]: [...(prev[clientId] ?? []), cat] }))
      setNewCatName((p) => ({ ...p, [clientId]: '' }))
    } catch { /* ignore */ }
    setCatLoading((p) => ({ ...p, [clientId]: false }))
  }

  async function handleToggleCategory(clientId: string, catId: string, isActive: boolean) {
    await toggleClientCategory(catId, !isActive).catch(() => {})
    setCatsByClient((prev) => ({
      ...prev,
      [clientId]: (prev[clientId] ?? []).map((c) => c.id === catId ? { ...c, is_active: !isActive } : c),
    }))
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = cfEmail.trim()
    const username = cfUsername.trim()
    const displayName = cfDisplay.trim()
    if (!email || !username || !displayName) { setCreateError('E-mail, usuário e nome são obrigatórios.'); return }
    setCreating(true); setCreateError(null)
    try {
      const c = await upsertSupportClientByEmail({
        email,
        username,
        display_name: displayName,
        company_name: cfCompany.trim() || undefined,
        slug: slugify(username),
      })
      setClients((prev) => {
        const exists = prev.find((x) => x.id === c.id)
        return exists ? prev.map((x) => x.id === c.id ? c : x) : [...prev, c]
      })
      setCfEmail(''); setCfUsername(''); setCfDisplay(''); setCfCompany('')
      setShowCreate(false)
    } catch (err: unknown) {
      setCreateError(getReadableError(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="esm-section">
      <div className="esm-section-head">
        <h3 className="esm-section-title">Clientes</h3>
        <button type="button" className="esm-icon-btn" onClick={() => setShowCreate((v) => !v)} aria-label="Novo cliente">
          <Plus size={15} />
        </button>
      </div>

      {loading ? <p className="esm-hint">Carregando…</p> : clients.length === 0 && !showCreate ? (
        <p className="esm-hint">Nenhum cliente cadastrado. Clique em + para criar.</p>
      ) : (
        <ul className="esm-client-list">
          {clients.map((c) => (
            <li key={c.id} className="esm-client-item">
              <button type="button" className="esm-client-row" onClick={() => handleExpand(c.id)}>
                {expandedId === c.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="esm-client-name">{c.display_name}</span>
                <span className="esm-client-username">@{c.username}</span>
                {!c.is_active && <span className="esm-badge-inactive">Inativo</span>}
              </button>
              {expandedId === c.id && (
                <div className="esm-client-cats">
                  {(catsByClient[c.id] ?? []).length === 0 ? (
                    <p className="esm-hint esm-hint--indent">Sem categorias.</p>
                  ) : (
                    <ul className="esm-cat-list">
                      {(catsByClient[c.id] ?? []).map((cat) => (
                        <li key={cat.id} className="esm-cat-item">
                          <span className={`esm-cat-name${cat.is_active ? '' : ' esm-cat-name--inactive'}`}>{cat.name}</span>
                          <button
                            type="button"
                            className={`esm-toggle-btn${cat.is_active ? '' : ' esm-toggle-btn--off'}`}
                            onClick={() => handleToggleCategory(c.id, cat.id, cat.is_active)}
                          >
                            {cat.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="esm-add-cat-row">
                    <input
                      className="esm-input esm-input--sm"
                      placeholder="Nova categoria…"
                      value={newCatName[c.id] ?? ''}
                      onChange={(e) => setNewCatName((p) => ({ ...p, [c.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(c.id) } }}
                      disabled={catLoading[c.id]}
                    />
                    <button
                      type="button"
                      className="esm-add-btn esm-add-btn--sm"
                      onClick={() => handleAddCategory(c.id)}
                      disabled={catLoading[c.id] || !(newCatName[c.id] ?? '').trim()}
                    >
                      {catLoading[c.id] ? '…' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <form className="esm-create-client-form" onSubmit={handleCreate}>
          <p className="esm-form-label">Criar / atualizar cliente</p>
          <p className="esm-note">O e-mail informado será vinculado a um usuário Auth. Se já existir, as informações serão atualizadas.</p>
          {createError && <p className="esm-warn">{createError}</p>}
          <input type="email" className="esm-input" placeholder="E-mail de login *" value={cfEmail} onChange={(e) => setCfEmail(e.target.value)} disabled={creating} required />
          <input className="esm-input" placeholder="Usuário (login) *" value={cfUsername} onChange={(e) => setCfUsername(e.target.value)} disabled={creating} required />
          <input className="esm-input" placeholder="Nome de exibição *" value={cfDisplay} onChange={(e) => setCfDisplay(e.target.value)} disabled={creating} required />
          <input className="esm-input" placeholder="Empresa (opcional)" value={cfCompany} onChange={(e) => setCfCompany(e.target.value)} disabled={creating} />
          <div className="esm-add-row">
            <button type="submit" className="esm-add-btn" disabled={creating}>{creating ? 'Salvando…' : 'Salvar cliente'}</button>
            <button type="button" className="esm-cancel-btn" onClick={() => setShowCreate(false)} disabled={creating}>Cancelar</button>
          </div>
        </form>
      )}
    </section>
  )
}

// ── Requests Tab ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  'em análise': 'Em análise',
  planejado: 'Planejado',
  concluído: 'Concluído',
  descartado: 'Descartado',
}

const STATUS_CLASS: Record<string, string> = {
  novo: 'esm-req-status--novo',
  'em análise': 'esm-req-status--analise',
  planejado: 'esm-req-status--planejado',
  concluído: 'esm-req-status--concluido',
  descartado: 'esm-req-status--descartado',
}

function RequestsTab() {
  const [requests, setRequests] = useState<SupportGuideRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchGuideRequests().then((list) => { setRequests(list); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleStatus(id: string, status: string) {
    setUpdatingId(id)
    try {
      await updateGuideRequestStatus(id, status)
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    } catch { /* ignore */ }
    setUpdatingId(null)
  }

  return (
    <section className="esm-section">
      <div className="esm-section-head">
        <MessageSquare size={16} className="esm-section-icon" />
        <h3 className="esm-section-title">Solicitações de guias</h3>
      </div>
      {loading ? (
        <p className="esm-hint">Carregando…</p>
      ) : requests.length === 0 ? (
        <p className="esm-hint">Nenhuma solicitação ainda.</p>
      ) : (
        <ul className="esm-req-list">
          {requests.map((r) => (
            <li key={r.id} className="esm-req-item">
              <div className="esm-req-top">
                <span className="esm-req-name">{r.name || 'Anônimo'}</span>
                {r.email && <span className="esm-req-email">{r.email}</span>}
                <span className={`esm-req-status ${STATUS_CLASS[r.status] ?? ''}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </div>
              {r.topic && <p className="esm-req-topic">{r.topic}</p>}
              {r.description && <p className="esm-req-desc">{r.description}</p>}
              <div className="esm-req-actions">
                <select
                  className="esm-req-select"
                  value={r.status}
                  onChange={(e) => handleStatus(r.id, e.target.value)}
                  disabled={updatingId === r.id}
                >
                  {Object.keys(STATUS_LABELS).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
