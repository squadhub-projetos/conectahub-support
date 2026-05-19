import { useState, useEffect, type FormEvent } from 'react'
import { X, UserPlus, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './EditorSettingsModal.css'

interface EditorEntry {
  id: string
  email?: string
  role: string
  created_at?: string
}

interface EditorSettingsModalProps {
  onClose: () => void
}

export default function EditorSettingsModal({ onClose }: EditorSettingsModalProps) {
  const [editors, setEditors] = useState<EditorEntry[]>([])
  const [editorsLoading, setEditorsLoading] = useState(true)
  const [editorsError, setEditorsError] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'editor' | 'owner'>('editor')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addNote, setAddNote] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEditors() {
      try {
        const { data, error } = await supabase
          .from('support_editors')
          .select('id, email, role, created_at')
          .order('created_at', { ascending: true })
        if (error) throw error
        setEditors((data as EditorEntry[]) ?? [])
      } catch {
        setEditorsError('Não foi possível carregar a lista de editores. Verifique se a tabela support_editors existe e tem as policies corretas.')
      } finally {
        setEditorsLoading(false)
      }
    }
    fetchEditors()
  }, [])

  async function handleAddEditor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAddLoading(true)
    setAddError(null)
    setAddNote(null)
    setAddSuccess(false)
    try {
      const { error } = await supabase.rpc('invite_support_editor', {
        p_email: newEmail.trim(),
        p_role: newRole,
      })
      if (error) throw error
      setAddSuccess(true)
      setNewEmail('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isMissing = msg.includes('does not exist') || msg.includes('not found') || msg.includes('42883')
      if (isMissing) {
        setAddNote('Para ativar este recurso em produção, crie a função invite_support_editor no Supabase (Edge Function ou RPC com service_role) para gerenciar convites com segurança.')
      } else {
        setAddError(`Erro: ${msg}`)
      }
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="esm-backdrop" onClick={onClose}>
      <div className="esm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="esm-header">
          <h2 className="esm-title">Configurações de acesso</h2>
          <button type="button" className="esm-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="esm-body">

          {/* ── Section A: Editors ── */}
          <section className="esm-section">
            <div className="esm-section-head">
              <Users size={16} className="esm-section-icon" />
              <h3 className="esm-section-title">Editores autorizados</h3>
            </div>

            {editorsLoading ? (
              <p className="esm-hint">Carregando editores…</p>
            ) : editorsError ? (
              <p className="esm-warn">{editorsError}</p>
            ) : editors.length === 0 ? (
              <p className="esm-hint">Nenhum editor cadastrado na tabela support_editors.</p>
            ) : (
              <ul className="esm-editor-list">
                {editors.map((ed) => (
                  <li key={ed.id} className="esm-editor-item">
                    <span className="esm-editor-email">{ed.email ?? ed.id}</span>
                    <span className={`esm-role-badge esm-role-${ed.role}`}>{ed.role}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Add editor form */}
            <form className="esm-add-form" onSubmit={handleAddEditor}>
              <div className="esm-add-section-title">
                <UserPlus size={14} />
                <span>Convidar editor</span>
              </div>
              <div className="esm-add-row">
                <input
                  type="email"
                  className="esm-input"
                  placeholder="email@empresa.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={addLoading}
                  required
                />
                <select
                  className="esm-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'editor' | 'owner')}
                  disabled={addLoading}
                >
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                <button type="submit" className="esm-add-btn" disabled={addLoading || !newEmail.trim()}>
                  {addLoading ? '…' : 'Convidar'}
                </button>
              </div>
              {addSuccess && <p className="esm-success">Convite enviado com sucesso!</p>}
              {addError && <p className="esm-warn">{addError}</p>}
              {addNote && <p className="esm-note">{addNote}</p>}
            </form>
          </section>

          {/* ── Section B: Client access (placeholder) ── */}
          <section className="esm-section esm-section--muted">
            <div className="esm-section-head">
              <h3 className="esm-section-title">Acesso de clientes</h3>
              <span className="esm-badge-soon">Em breve</span>
            </div>
            <p className="esm-hint">
              Em breve, será possível cadastrar clientes e liberar tutoriais específicos por negócio.
            </p>
            <div className="esm-placeholder-fields">
              <input className="esm-input esm-input--disabled" placeholder="Nome do cliente" disabled />
              <input className="esm-input esm-input--disabled" placeholder="E-mail" disabled />
              <input className="esm-input esm-input--disabled" placeholder="Empresa" disabled />
              <input className="esm-input esm-input--disabled" placeholder="Permissões de conteúdo" disabled />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
