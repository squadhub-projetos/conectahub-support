import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { createGuide } from '../lib/queries'
import type { DbCategory } from '../types/database'
import { getGroupsByCategory, type SupportGroup } from '../data/supportGroups'
import './CreateGuideModal.css'

interface CreateGuideModalProps {
  categories: DbCategory[]
  onClose: () => void
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

export default function CreateGuideModal({ categories, onClose }: CreateGuideModalProps) {
  const navigate = useNavigate()

  const initialCatId = categories[0]?.id ?? ''
  const initialGroups = getGroupsByCategory(categories[0]?.slug)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [categoryId, setCategoryId] = useState(initialCatId)
  const [availableGroups, setAvailableGroups] = useState<SupportGroup[]>(initialGroups)
  const [supportGroup, setSupportGroup] = useState(initialGroups[0]?.slug ?? '')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  function handleClose() {
    const dirty = title.trim() !== '' || excerpt.trim() !== ''
    if (dirty && !window.confirm('Descartar alterações?')) return
    onClose()
  }

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    setSlug(e.target.value)
  }

  function handleCategoryChange(newId: string) {
    setCategoryId(newId)
    const cat = categories.find((c) => c.id === newId)
    const groups = getGroupsByCategory(cat?.slug)
    setAvailableGroups(groups)
    if (!groups.find((g) => g.slug === supportGroup)) {
      setSupportGroup(groups[0]?.slug ?? '')
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!title.trim()) { setErrorMsg('O título é obrigatório.'); return }
    if (!slug.trim()) { setErrorMsg('O slug é obrigatório.'); return }
    if (!categoryId) { setErrorMsg('Selecione uma categoria.'); return }

    const groupLabel = availableGroups.find((g) => g.slug === supportGroup)?.label ?? supportGroup

    setLoading(true)
    try {
      const guide = await createGuide({
        title: title.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        excerpt: excerpt.trim() || `Guia sobre ${title.trim()}`,
        status,
        metadata: {
          support_group: supportGroup,
          support_group_label: groupLabel,
          visibility: 'general',
        },
      })
      navigate(`/admin/guides/${guide.id}/edit`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(
        msg.includes('unique') || msg.includes('duplicate')
          ? 'Já existe um guia com esse slug. Escolha outro.'
          : `Erro ao criar guia: ${msg}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cgm-backdrop">
      <div className="cgm-modal">
        <button type="button" className="cgm-close" onClick={handleClose} aria-label="Fechar">
          <X size={18} />
        </button>

        <div className="cgm-header">
          <h2 className="cgm-title">Novo guia geral</h2>
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
              placeholder="Ex: Como criar seu primeiro funil"
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
              placeholder="como-criar-seu-primeiro-funil"
              required
              disabled={loading}
            />
            <span className="cgm-hint">Gerado automaticamente — pode ser editado</span>
          </label>

          <div className="cgm-row">
            <label className="cgm-label">
              Categoria *
              <select
                className="cgm-select"
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loading}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>

            <label className="cgm-label">
              Grupamento
              <select
                className="cgm-select"
                value={supportGroup}
                onChange={(e) => setSupportGroup(e.target.value)}
                disabled={loading || !categoryId}
              >
                {availableGroups.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.label}</option>
                ))}
              </select>
            </label>
          </div>

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
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  disabled={loading}
                />
                <span>Rascunho</span>
                <span className="cgm-radio-hint">Não aparece para usuários</span>
              </label>
              <label className="cgm-radio-option">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  disabled={loading}
                />
                <span>Publicado</span>
                <span className="cgm-radio-hint">Visível imediatamente</span>
              </label>
            </div>
          </div>

          <div className="cgm-actions">
            <button type="submit" className="cgm-submit" disabled={loading}>
              {loading ? 'Criando…' : 'Criar e abrir editor →'}
            </button>
            <button type="button" className="cgm-cancel" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
