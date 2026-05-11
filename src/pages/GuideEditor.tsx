import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { mockGuides } from '../data/mockGuides'
import type { Category, GuideStatus } from '../types/guide'
import MockRichTextEditor from '../components/MockRichTextEditor'
import './GuideEditor.css'

const CATEGORIES: Category[] = [
  'Contatos',
  'Conversas',
  'Oportunidades',
  'Automações',
  'Calendários',
  'Configurações',
  'Outros',
]

interface FormState {
  title: string
  slug: string
  category: Category
  description: string
  tags: string
  videoUrl: string
  coverImage: string
  status: GuideStatus
  content: string
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  category: 'Outros',
  description: '',
  tags: '',
  videoUrl: '',
  coverImage: '',
  status: 'draft',
  content: '',
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function GuideEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!isNew) {
      const existing = mockGuides.find((g) => g.id === id)
      if (existing) {
        setForm({
          title: existing.title,
          slug: existing.slug,
          category: existing.category,
          description: existing.description,
          tags: existing.tags.join(', '),
          videoUrl: existing.videoUrl ?? '',
          coverImage: existing.coverImage ?? '',
          status: existing.status,
          content: existing.content,
        })
        setSlugManual(true)
      }
    }
  }, [id, isNew])

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManual ? prev.slug : toSlug(value),
    }))
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSave() {
    // TODO: persist to Supabase when backend is connected
    alert(`[Mock] Guia "${form.title}" ${isNew ? 'criado' : 'atualizado'} com sucesso!\n\nEsta ação será conectada ao Supabase em versões futuras.`)
    navigate('/editor')
  }

  return (
    <div className="guide-editor">
      <div className="ge-page-header">
        <div>
          <h1 className="ge-title">{isNew ? 'Novo guia' : `Editando: ${form.title || '...'}`}</h1>
          <p className="ge-subtitle">
            {isNew ? 'Preencha os campos e escreva o conteúdo do guia abaixo.' : 'Edite as informações e o conteúdo do guia.'}
          </p>
        </div>
        <div className="ge-header-actions">
          <Link to="/editor" className="ge-cancel-btn">Cancelar</Link>
          <button type="button" className="ge-save-btn" onClick={handleSave}>
            {form.status === 'published' ? '✓ Salvar e publicar' : 'Salvar rascunho'}
          </button>
        </div>
      </div>

      <div className="ge-layout">
        <div className="ge-form-col">
          <div className="ge-section">
            <h2 className="ge-section-title">Informações básicas</h2>

            <div className="form-group">
              <label className="form-label">Título do guia *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Como criar um novo contato"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug (URL)</label>
              <div className="slug-wrap">
                <span className="slug-prefix">/suporte/</span>
                <input
                  type="text"
                  className="form-input slug-input"
                  placeholder="como-criar-contato"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true)
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={set('status')}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição curta *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Breve descrição do guia (aparece nos cards e na listagem)"
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags <span className="form-hint">(separadas por vírgula)</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="contato, criar, básico"
                value={form.tags}
                onChange={set('tags')}
              />
            </div>
          </div>

          <div className="ge-section">
            <h2 className="ge-section-title">Mídia</h2>

            <div className="form-group">
              <label className="form-label">URL do vídeo <span className="form-hint">(YouTube embed)</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="https://www.youtube.com/embed/..."
                value={form.videoUrl}
                onChange={set('videoUrl')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL da imagem/capa</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={form.coverImage}
                onChange={set('coverImage')}
              />
            </div>
          </div>
        </div>

        <div className="ge-content-col">
          <div className="ge-section">
            <h2 className="ge-section-title">Conteúdo do guia</h2>
            <MockRichTextEditor
              value={form.content}
              onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
