import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchGuideById, fetchCategories, updateGuide } from '../lib/queries'
import type { DbGuideWithCategory, DbCategory } from '../types/database'
import { getGroupsByCategory, DEFAULT_GROUPS, type SupportGroup } from '../data/supportGroups'
import { normalizeVideoEmbed, type VideoProvider } from '../utils/videoEmbed'
import AdminRouteGuard from '../components/AdminRouteGuard'
import RichGuideEditor from '../components/RichGuideEditor'
import './AdminGuideEdit.css'

const VIDEO_PLACEHOLDERS: Record<string, string> = {
  '': 'https://youtube.com/watch?v=... ou cole o código embed',
  youtube: 'https://youtube.com/watch?v=VIDEO_ID',
  loom: 'https://www.loom.com/share/VIDEO_ID',
  vturb: '<div id="vid_...">\n...\n</div>\n<script src="https://scripts.converteai.net/..."></script>',
  google_drive: 'https://drive.google.com/file/d/FILE_ID/view',
}

const VIDEO_HINTS: Record<string, string> = {
  '': 'Cole uma URL do YouTube, Loom, Google Drive ou o código embed da VTurb.',
  youtube: 'Aceita youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/... ou youtube.com/shorts/...',
  loom: 'Aceita loom.com/share/ID ou loom.com/embed/ID — garanta que o vídeo esteja liberado para qualquer pessoa com o link.',
  vturb: 'Cole o código embed (iframe ou script) da VTurb. Adicione o domínio do site na aba de segurança da VTurb para o player carregar corretamente.',
  google_drive: 'Aceita drive.google.com/file/d/ID/view — garanta que o arquivo esteja compartilhado com permissão de visualização.',
}

export default function AdminGuideEdit() {
  return (
    <AdminRouteGuard>
      <AdminGuideEditInner />
    </AdminRouteGuard>
  )
}

function AdminGuideEditInner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [guide, setGuide] = useState<DbGuideWithCategory | null>(null)
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  // Form fields
  const [fTitle, setFTitle] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fCategoryId, setFCategoryId] = useState('')
  const [availableGroups, setAvailableGroups] = useState<SupportGroup[]>(DEFAULT_GROUPS)
  const [fSupportGroup, setFSupportGroup] = useState(DEFAULT_GROUPS[0].slug)
  const [fExcerpt, setFExcerpt] = useState('')
  const [fStatus, setFStatus] = useState('draft')
  const [fTags, setFTags] = useState('')
  const [fVideoUrl, setFVideoUrl] = useState('')
  const [fVideoProvider, setFVideoProvider] = useState('')
  const [fCoverUrl, setFCoverUrl] = useState('')
  const [fReadMin, setFReadMin] = useState('3')
  const [fContentHtml, setFContentHtml] = useState('')
  const [fContentJson, setFContentJson] = useState<unknown>(null)
  const [fContentMd, setFContentMd] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [g, cats] = await Promise.all([fetchGuideById(id!), fetchCategories()])
        if (cancelled) return
        if (!g) { setError('Guia não encontrado.'); return }
        setGuide(g)
        setCategories(cats)
        setFTitle(g.title)
        setFSlug(g.slug)
        setFCategoryId(g.category_id)

        const cat = cats.find((c) => c.id === g.category_id)
        const groups = getGroupsByCategory(cat?.slug)
        setAvailableGroups(groups)

        const meta = g.metadata
        const savedGroup = meta?.support_group as string | undefined
        if (savedGroup && groups.find((gr) => gr.slug === savedGroup)) {
          setFSupportGroup(savedGroup)
        } else {
          setFSupportGroup(groups[0]?.slug ?? DEFAULT_GROUPS[0].slug)
        }

        setFExcerpt(g.excerpt ?? '')
        setFStatus(g.status)
        setFTags((g.tags ?? []).join(', '))
        const savedProvider = typeof g.metadata?.video_provider === 'string' ? g.metadata.video_provider : ''
        const savedEmbedCode = typeof g.metadata?.video_embed_code === 'string' ? g.metadata.video_embed_code : undefined
        setFVideoProvider(savedProvider)
        setFVideoUrl(savedEmbedCode ?? g.video_url ?? '')
        setFCoverUrl(g.cover_image_url ?? '')
        setFReadMin(String(g.estimated_read_minutes ?? 3))
        setFContentHtml(g.content_html ?? '')
        setFContentMd(g.content_markdown ?? '')
        setFContentJson(g.content_json ?? null)
      } catch (err) {
        if (!cancelled) setError('Não foi possível carregar o guia.')
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  const markDirty = useCallback(() => setDirty(true), [])

  function handleCategoryChange(newId: string) {
    setFCategoryId(newId)
    markDirty()
    const cat = categories.find((c) => c.id === newId)
    const groups = getGroupsByCategory(cat?.slug)
    setAvailableGroups(groups)
    if (!groups.find((g) => g.slug === fSupportGroup)) {
      setFSupportGroup(groups[0]?.slug ?? '')
    }
  }

  function handleEditorChange(html: string, json: unknown) {
    setFContentHtml(html)
    setFContentJson(json)
    markDirty()
  }

  async function handleSave() {
    if (!id || !guide) return
    setSaving(true)
    setSavedMsg(null)
    setSaveError(null)

    const tagsArray = fTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const groupLabel = availableGroups.find((g) => g.slug === fSupportGroup)?.label ?? fSupportGroup
    const coverUrlNorm = fCoverUrl.trim() || null
    const readMin = parseInt(fReadMin, 10)

    const videoInput = fVideoUrl.trim()
    let videoUrlToSave: string | null = null
    const videoMeta: Record<string, unknown> = {}
    if (videoInput) {
      const norm = normalizeVideoEmbed(
        videoInput,
        fVideoProvider ? (fVideoProvider as VideoProvider) : undefined,
      )
      videoMeta.video_provider = norm.provider
      videoMeta.video_embed_type = norm.type
      if (norm.embedUrl) videoMeta.video_embed_url = norm.embedUrl
      if (norm.embedCode) videoMeta.video_embed_code = norm.embedCode
      videoUrlToSave = norm.provider === 'vturb' && norm.type === 'script' ? null : videoInput
    }
    const baseMetadata = Object.fromEntries(
      Object.entries(guide.metadata ?? {}).filter(
        ([k]) => !['video_provider', 'video_embed_type', 'video_embed_url', 'video_embed_code'].includes(k),
      ),
    )

    try {
      await updateGuide(id, {
        title: fTitle.trim() || guide.title,
        slug: fSlug.trim() || guide.slug,
        category_id: fCategoryId || guide.category_id,
        excerpt: fExcerpt.trim() || null,
        status: fStatus,
        tags: tagsArray,
        video_url: videoUrlToSave,
        cover_image_url: coverUrlNorm,
        estimated_read_minutes: Number.isFinite(readMin) && readMin > 0 ? readMin : null,
        content_html: fContentHtml || null,
        content_markdown: fContentMd || null,
        content_json: fContentJson ?? null,
        metadata: {
          ...baseMetadata,
          support_group: fSupportGroup,
          support_group_label: groupLabel,
          ...(videoInput ? videoMeta : {}),
        },
        ...(fStatus === 'published' && !guide.published_at
          ? { published_at: new Date().toISOString() }
          : {}),
      })
      setSavedMsg('Guia salvo com sucesso!')
      setDirty(false)
      setTimeout(() => setSavedMsg(null), 3000)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('[AdminGuideEdit] save error:', err)
      let msg = 'Erro desconhecido'
      if (err instanceof Error) {
        msg = err.message
      } else if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>
        msg = (e.message as string) || (e.details as string) || (e.hint as string) || JSON.stringify(err)
      } else {
        msg = String(err)
      }
      setSaveError(`Erro ao salvar: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const videoNormalized = fVideoUrl.trim()
    ? normalizeVideoEmbed(fVideoUrl.trim(), fVideoProvider ? (fVideoProvider as VideoProvider) : undefined)
    : null
  const videoProviderLabel: Record<string, string> = {
    youtube: 'YouTube', loom: 'Loom', vturb: 'VTurb', google_drive: 'Google Drive',
  }

  // ── Render states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="age-page">
        <div className="age-toolbar">
          <Link to="/admin/guides" className="age-back-btn">← Voltar</Link>
          <span className="age-toolbar-title">Carregando…</span>
        </div>
        <div className="age-loading">
          <div className="age-spinner" />
          <p>Carregando guia…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="age-page">
        <div className="age-toolbar">
          <Link to="/admin/guides" className="age-back-btn">← Voltar</Link>
        </div>
        <div className="age-loading">
          <span style={{ fontSize: 36 }}>⚠️</span>
          <p>{error}</p>
          <Link to="/admin/guides" className="age-link-btn">← Voltar à lista</Link>
        </div>
      </div>
    )
  }

  if (!guide) return null

  return (
    <div className="age-page">
      {/* ── Toolbar ── */}
      <div className="age-toolbar">
        <div className="age-toolbar-left">
          <Link to="/admin/guides" className="age-back-btn">← Voltar</Link>
          <span className="age-toolbar-sep">|</span>
          <span className="age-toolbar-title" title={fTitle}>
            {fTitle || 'Sem título'}{dirty ? ' •' : ''}
          </span>
        </div>
        <div className="age-toolbar-right">
          {savedMsg && <span className="age-saved-msg">✓ {savedMsg}</span>}
          {saveError && <span className="age-save-error" title={saveError}>{saveError}</span>}
          <a
            href={`/suporte/${guide.slug}`}
            target="_blank"
            rel="noreferrer"
            className="age-view-btn"
          >
            Visualizar
          </a>
          <button type="button" className="age-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="age-body">

        {/* ── Main column ── */}
        <div className="age-main">
          <div className="age-card">
            <h3 className="age-card-heading">Conteúdo</h3>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-title">Título</label>
              <input
                id="f-title"
                type="text"
                className="age-input"
                value={fTitle}
                onChange={(e) => { setFTitle(e.target.value); markDirty() }}
              />
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-excerpt">Descrição curta</label>
              <textarea
                id="f-excerpt"
                className="age-textarea"
                value={fExcerpt}
                onChange={(e) => { setFExcerpt(e.target.value); markDirty() }}
                rows={2}
                placeholder="Uma frase que resume o guia…"
              />
            </div>

            {/* ── Visual Editor (primary) ── */}
            <div className="age-form-group">
              <label className="age-label">
                Editor visual
                <span className="age-label-hint">(conteúdo principal)</span>
              </label>
              {guide && (
                <RichGuideEditor
                  key={guide.id}
                  content={fContentHtml || '<p></p>'}
                  guideId={guide.id}
                  onChange={handleEditorChange}
                />
              )}
            </div>

            {/* ── Markdown (secondary/advanced) ── */}
            <details className="age-advanced-section">
              <summary className="age-advanced-toggle">Markdown (avançado / fallback)</summary>
              <div className="age-form-group age-form-group--mt">
                <label className="age-label" htmlFor="f-content-md">
                  Conteúdo Markdown
                  <span className="age-label-hint">(usado como fallback se o HTML estiver vazio)</span>
                </label>
                <textarea
                  id="f-content-md"
                  className="age-textarea age-content-editor"
                  value={fContentMd}
                  onChange={(e) => { setFContentMd(e.target.value); markDirty() }}
                  rows={16}
                  spellCheck
                  placeholder="## Seção&#10;&#10;Texto do guia aqui..."
                />
              </div>
            </details>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="age-sidebar">
          <div className="age-card">
            <h3 className="age-card-heading">Publicação</h3>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-status">Status</label>
              <select id="f-status" className="age-select" value={fStatus} onChange={(e) => { setFStatus(e.target.value); markDirty() }}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-slug">Slug</label>
              <input id="f-slug" type="text" className="age-input age-input--mono" value={fSlug} onChange={(e) => { setFSlug(e.target.value); markDirty() }} />
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-read-min">Tempo de leitura (min)</label>
              <input id="f-read-min" type="number" min="1" max="60" className="age-input" value={fReadMin} onChange={(e) => { setFReadMin(e.target.value); markDirty() }} />
            </div>
          </div>

          <div className="age-card">
            <h3 className="age-card-heading">Classificação</h3>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-category">Categoria</label>
              <select id="f-category" className="age-select" value={fCategoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-group">Grupamento</label>
              <select
                id="f-group"
                className="age-select"
                value={fSupportGroup}
                onChange={(e) => { setFSupportGroup(e.target.value); markDirty() }}
                disabled={!fCategoryId}
              >
                {availableGroups.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-tags">Tags <span className="age-label-hint">(separadas por vírgula)</span></label>
              <input id="f-tags" type="text" className="age-input" value={fTags} onChange={(e) => { setFTags(e.target.value); markDirty() }} placeholder="configuração, usuário, acesso" />
            </div>
          </div>

          <div className="age-card">
            <h3 className="age-card-heading">Vídeo</h3>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-video-provider">Plataforma</label>
              <select
                id="f-video-provider"
                className="age-select"
                value={fVideoProvider}
                onChange={(e) => { setFVideoProvider(e.target.value); markDirty() }}
              >
                <option value="">Auto detectar</option>
                <option value="youtube">YouTube</option>
                <option value="loom">Loom</option>
                <option value="vturb">VTurb</option>
                <option value="google_drive">Google Drive</option>
              </select>
            </div>

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-video">
                {fVideoProvider === 'vturb' ? 'Código embed' : 'URL do vídeo'}
              </label>
              <textarea
                id="f-video"
                className={`age-textarea${videoNormalized?.error && fVideoUrl.trim() ? ' age-input--error' : ''}`}
                value={fVideoUrl}
                onChange={(e) => { setFVideoUrl(e.target.value); markDirty() }}
                rows={fVideoProvider === 'vturb' || fVideoUrl.includes('<') ? 5 : 2}
                placeholder={VIDEO_PLACEHOLDERS[fVideoProvider] ?? VIDEO_PLACEHOLDERS['']}
              />
              {videoNormalized?.error && fVideoUrl.trim() && (
                <span className="age-field-hint age-field-hint--error">{videoNormalized.error}</span>
              )}
              <p className="age-field-hint">{VIDEO_HINTS[fVideoProvider] ?? VIDEO_HINTS['']}</p>
            </div>

            {videoNormalized && fVideoUrl.trim() && !videoNormalized.error && (
              <div className="age-video-preview-wrap">
                {videoNormalized.embedUrl && (
                  <div className="age-video-preview">
                    <iframe
                      src={videoNormalized.embedUrl}
                      title="Prévia do vídeo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {videoNormalized.provider === 'vturb' && videoNormalized.type === 'script' && (
                  <div className="age-video-info-card">
                    <span className="age-video-info-icon">▶</span>
                    <p>Embed VTurb (script) detectado. Salve e visualize o guia publicado para confirmar.</p>
                  </div>
                )}
                {videoNormalized.provider !== 'unknown' && (
                  <span className="age-field-hint age-field-hint--success">
                    ✓ {videoProviderLabel[videoNormalized.provider] ?? videoNormalized.provider} detectado
                  </span>
                )}
              </div>
            )}

            <div className="age-form-group">
              <label className="age-label" htmlFor="f-cover">URL da imagem de capa</label>
              <input id="f-cover" type="url" className="age-input" value={fCoverUrl} onChange={(e) => { setFCoverUrl(e.target.value); markDirty() }} placeholder="https://..." />
            </div>
          </div>

          <div className="age-actions-bottom">
            <button type="button" className="age-save-btn age-save-btn--full" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
            <button type="button" className="age-back-full-btn" onClick={() => navigate('/admin/guides')}>
              ← Voltar ao modo edição
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
