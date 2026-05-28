import { useState, useEffect, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { createClientGuide, fetchClientCategories } from '../lib/queries'
import type { SupportClientCategory } from '../types/database'
import { getReadableError } from '../utils/getReadableError'
import './CreateGuideModal.css'

interface CreateClientGuideModalProps {
  clientId: string
  clientName: string
  onClose: () => void
  onCreated: (guideId: string) => void
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CreateClientGuideModal({ clientId, clientName, onClose, onCreated }: CreateClientGuideModalProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'client_draft' | 'client_published'>('client_draft')
  const [clientCategories, setClientCategories] = useState<SupportClientCategory[]>([])
  const [clientCategoryId, setClientCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchClientCategories(clientId).then((list) => {
      setClientCategories(list)
      setClientCategoryId(list[0]?.id ?? '')
    }).catch(() => {})
  }, [clientId])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    setSlug(e.target.value)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!title.trim()) { setErrorMsg('O título é obrigatório.'); return }
    if (!slug.trim()) { setErrorMsg('O slug é obrigatório.'); return }

    setLoading(true)
    try {
      const guide = await createClientGuide({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        status,
        clientId,
        clientCategoryId: clientCategoryId || null,
      })
      onCreated(guide.id)
    } catch (err: unknown) {
      const msg = getReadableError(err)
      setErrorMsg(
        msg.includes('unique') || msg.includes('duplicate')
          ? 'Já existe um guia com esse slug. Escolha outro.'
          : `Erro ao criar guia: ${msg}`
      )
      setLoading(false)
    }
  }

  return (
    <div className="cgm-backdrop" onClick={onClose}>
      <div className="cgm-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cgm-close" onClick={onClose} aria-label="Fechar" disabled={loading}>
          <X size={18} />
        </button>

        <div className="cgm-header">
          <h2 className="cgm-title">Novo guia para {clientName}</h2>
          <p className="cgm-sub">Preencha os dados básicos. Você poderá editar o conteúdo na próxima tela.</p>
        </div>

        <form className="cgm-form" onSubmit={handleSubmit}>
          {errorMsg && <p className="cgm-error">{errorMsg}</p>}

          <label className="cgm-label">
            Título *
            <input
              type="text"
              className="cgm-input"
              value={title}
              onChange={handleTitleChange}
              placeholder="Ex: Como usar o painel do cliente"
              required
              disabled={loading}
              autoFocus
            />
          </label>

          <label className="cgm-label">
            Slug *
            <input
              type="text"
              className="cgm-input cgm-input--mono"
              value={slug}
              onChange={handleSlugChange}
              placeholder="como-usar-painel-do-cliente"
              required
              disabled={loading}
            />
            <span className="cgm-hint">Gerado automaticamente — pode ser editado</span>
          </label>

          <label className="cgm-label">
            Categoria do cliente
            <select
              className="cgm-select"
              value={clientCategoryId}
              onChange={(e) => setClientCategoryId(e.target.value)}
              disabled={loading}
            >
              <option value="">Sem categoria</option>
              {clientCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="cgm-label">
            Descrição curta
            <textarea
              className="cgm-textarea"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Uma frase que resume o que o usuário vai aprender..."
              rows={2}
              disabled={loading}
            />
          </label>

          <div className="cgm-label">
            Status inicial
            <div className="cgm-radio-group">
              <label className="cgm-radio-option">
                <input
                  type="radio"
                  name="status"
                  value="client_draft"
                  checked={status === 'client_draft'}
                  onChange={() => setStatus('client_draft')}
                  disabled={loading}
                />
                <span>Rascunho</span>
                <span className="cgm-radio-hint">Não aparece para o cliente</span>
              </label>
              <label className="cgm-radio-option">
                <input
                  type="radio"
                  name="status"
                  value="client_published"
                  checked={status === 'client_published'}
                  onChange={() => setStatus('client_published')}
                  disabled={loading}
                />
                <span>Publicado</span>
                <span className="cgm-radio-hint">Visível para o cliente</span>
              </label>
            </div>
          </div>

          <div className="cgm-actions">
            <button type="submit" className="cgm-submit" disabled={loading}>
              {loading ? 'Criando…' : 'Criar e abrir editor →'}
            </button>
            <button type="button" className="cgm-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
