import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchGuideBySlug, fetchRelatedGuides } from '../lib/queries'
import type { DbGuideWithCategory } from '../types/database'
import GuideContent from '../components/GuideContent'
import { toYouTubeEmbedUrl } from '../utils/youtube'
import './GuidePage.css'

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>()

  const [guide, setGuide] = useState<DbGuideWithCategory | null>(null)
  const [related, setRelated] = useState<DbGuideWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const currentSlug = slug

    async function load() {
      try {
        setLoading(true)
        setNotFound(false)
        setError(false)

        const found = await fetchGuideBySlug(currentSlug)

        if (cancelled) return

        if (!found) {
          setNotFound(true)
          return
        }

        setGuide(found)

        const rels = await fetchRelatedGuides(found.category_id, found.id)
        if (!cancelled) setRelated(rels)
      } catch (err) {
        if (!cancelled) {
          setError(true)
          console.error(err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [slug])

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
                ? 'O guia que você está procurando não existe ou foi removido.'
                : 'Não foi possível carregar este guia. Tente novamente.'}
            </p>
            <div className="not-found-actions">
              <Link to="/suporte" className="not-found-btn not-found-btn--primary">
                ← Voltar à central
              </Link>
              {error && (
                <button
                  type="button"
                  className="not-found-btn not-found-btn--secondary"
                  onClick={() => window.location.reload()}
                >
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!guide) return null

  const videoEmbed = guide.video_url ? toYouTubeEmbedUrl(guide.video_url) ?? guide.video_url : null
  const hasVideo = videoEmbed != null
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const updatedAt = guide.updated_at ?? guide.published_at

  return (
    <div className="guide-page">
      <div className="guide-page-inner">
        <nav className="breadcrumb">
          <Link to="/suporte">Central de Suporte</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{guide.category?.name ?? 'Guia'}</span>
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

            {hasVideo && videoEmbed && (
              <div className="guide-video-block">
                <iframe
                  src={videoEmbed}
                  title={`Vídeo: ${guide.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {guide.content_html ? (
              <div
                className="guide-content"
                dangerouslySetInnerHTML={{ __html: guide.content_html }}
              />
            ) : guide.content_markdown ? (
              <GuideContent content={guide.content_markdown} />
            ) : (
              <p className="guide-content-empty">Conteúdo em breve.</p>
            )}
          </article>

          <aside className="guide-sidebar">
            {guide.category && (
              <div className="sidebar-card">
                <h3 className="sidebar-heading">Categoria</h3>
                <Link to="/suporte" className="sidebar-category-link">
                  {guide.category.icon && (
                    <span>{guide.category.icon}</span>
                  )}
                  {guide.category.name}
                </Link>
              </div>
            )}

            {related.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-heading">Artigos relacionados</h3>
                <ul className="related-list">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link to={`/suporte/${r.slug}`} className="related-link">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sidebar-card">
              <Link to="/suporte" className="back-to-support-btn">
                ← Voltar à central
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
