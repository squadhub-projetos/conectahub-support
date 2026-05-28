import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchGuideById } from '../lib/queries'
import type { DbGuideWithCategory } from '../types/database'
import GuideContent from '../components/GuideContent'
import VideoEmbed from '../components/VideoEmbed'
import AdminRouteGuard from '../components/AdminRouteGuard'
import './GuidePage.css'
import './AdminGuidePreviewPage.css'

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  client_published: 'Publicado (cliente)',
  client_draft: 'Rascunho do cliente',
  archived: 'Arquivado',
}

const STATUS_CSS: Record<string, string> = {
  published: 'agp-status--published',
  draft: 'agp-status--draft',
  client_published: 'agp-status--client-published',
  client_draft: 'agp-status--client-draft',
  archived: 'agp-status--archived',
}

function PreviewContent({ id }: { id: string }) {
  const [guide, setGuide] = useState<DbGuideWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setNotFound(false)
        setError(false)
        const found = await fetchGuideById(id)
        if (cancelled) return
        if (!found) { setNotFound(true); return }
        setGuide(found)
      } catch (err) {
        if (!cancelled) { setError(true); console.error(err) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-loading">
            <div className="guide-skeleton guide-skeleton--breadcrumb" />
            <div className="guide-layout">
              <div className="guide-skeleton guide-skeleton--article" />
              <div className="guide-skeleton guide-skeleton--sidebar" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || error) {
    return (
      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-not-found">
            <span className="not-found-icon">📄</span>
            <h1 className="not-found-title">
              {notFound ? 'Guia não encontrado' : 'Erro ao carregar o guia'}
            </h1>
            <p className="not-found-desc">
              {notFound
                ? 'Nenhum guia encontrado com este ID.'
                : 'Não foi possível carregar este guia. Tente novamente.'}
            </p>
            <div className="not-found-actions">
              <Link to="/admin/guides" className="not-found-btn not-found-btn--primary">
                ← Voltar à lista
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!guide) return null

  const statusKey = guide.status ?? 'draft'
  const statusLabel = STATUS_LABELS[statusKey] ?? statusKey
  const statusCss = STATUS_CSS[statusKey] ?? ''
  const hasVideo = !!(
    guide.video_url ||
    guide.metadata?.video_embed_url ||
    guide.metadata?.video_embed_code
  )
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const updatedAt = guide.updated_at ?? guide.published_at

  return (
    <>
      <div className="agp-banner">
        <Link to="/admin/guides" className="agp-back-link">← Voltar à lista</Link>
        <span className={`agp-status-badge ${statusCss}`}>{statusLabel}</span>
        <span className="agp-preview-label">Modo preview — apenas editores</span>
        <Link to={`/admin/guides/${guide.id}/edit`} className="agp-edit-link">Editar guia →</Link>
      </div>

      <div className="guide-page">
        <div className="guide-page-inner">
          <nav className="breadcrumb">
            <Link to="/admin/guides">Guias</Link>
            <span className="breadcrumb-sep">›</span>
            <span>{guide.category?.name ?? (guide.metadata?.visibility === 'client' ? 'Guia de cliente' : 'Guia')}</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{guide.title}</span>
          </nav>

          <div className="guide-layout">
            <article className="guide-article">
              <header className="guide-article-header">
                <div className="guide-meta-top">
                  {guide.category && (
                    <span className="guide-cat-label">{guide.category.name}</span>
                  )}
                  {hasVideo && <span className="guide-video-label">▶ Contém vídeo</span>}
                </div>

                <h1 className="guide-article-title">{guide.title}</h1>
                {guide.excerpt && (
                  <p className="guide-article-desc">{guide.excerpt}</p>
                )}

                <div className="guide-meta-row">
                  <span className="meta-item">⏱ {readTime} min de leitura</span>
                  {updatedAt && (
                    <span className="meta-item">
                      🗓 Atualizado em {new Date(updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="guide-tags-row">
                    {tags.map((tag) => (
                      <span key={tag} className="guide-tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}
              </header>

              {hasVideo && (
                <VideoEmbed
                  videoUrl={guide.video_url}
                  metadata={guide.metadata}
                  title={`Vídeo: ${guide.title}`}
                />
              )}

              {guide.content_html ? (
                <div
                  className="guide-content"
                  dangerouslySetInnerHTML={{ __html: guide.content_html }}
                />
              ) : guide.content_markdown ? (
                <GuideContent content={guide.content_markdown} />
              ) : guide.excerpt ? (
                <p className="guide-content-empty">{guide.excerpt}</p>
              ) : (
                <p className="guide-content-empty">Conteúdo em breve.</p>
              )}
            </article>

            <aside className="guide-sidebar">
              {guide.category && (
                <div className="sidebar-card">
                  <h3 className="sidebar-heading">Categoria</h3>
                  <span className="sidebar-category-link">{guide.category.name}</span>
                </div>
              )}

              <div className="sidebar-card">
                <h3 className="sidebar-heading">Ações</h3>
                <div className="agp-sidebar-actions">
                  <Link to={`/admin/guides/${guide.id}/edit`} className="agp-sidebar-edit-btn">
                    Editar este guia
                  </Link>
                  <Link to="/admin/guides" className="back-to-support-btn">
                    ← Voltar à lista
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminGuidePreviewPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (
    <AdminRouteGuard>
      <PreviewContent id={id} />
    </AdminRouteGuard>
  )
}
