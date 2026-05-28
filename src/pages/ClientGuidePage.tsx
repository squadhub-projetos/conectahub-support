import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchGuideById } from '../lib/queries'
import type { DbGuideWithCategory } from '../types/database'
import GuideContent from '../components/GuideContent'
import VideoEmbed from '../components/VideoEmbed'
import { useAuth } from '../contexts/AuthContext'
import './GuidePage.css'

export default function ClientGuidePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, clientData } = useAuth()

  const [guide, setGuide] = useState<DbGuideWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    if (!id) return
    if (role === 'loading') return
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setNotFound(false)
        setError(false)
        setAccessDenied(false)

        const found = await fetchGuideById(id!)
        if (cancelled) return

        if (!found) {
          setNotFound(true)
          return
        }

        const isClientGuide = (found.metadata?.visibility as string | undefined) === 'client'
        const isPublished = found.status === 'client_published' || found.status === 'published'

        if (isClientGuide) {
          if (role === 'none') { setAccessDenied(true); return }
          if (role === 'editor') {
            // Editors can see all statuses — redirect to admin preview for full context
            if (!cancelled) navigate(`/admin/guides/${found.id}/preview`, { replace: true })
            return
          }
          if (role === 'client') {
            if (!clientData) { setAccessDenied(true); return }
            // Validate by metadata.client_id to avoid RLS issues on the access table
            const metaClientId = typeof found.metadata?.client_id === 'string' ? found.metadata.client_id : null
            if (import.meta.env.DEV) console.log('[support] ClientGuidePage access check metaClientId:', metaClientId, 'clientData.id:', clientData.id)
            if (metaClientId !== clientData.id) { setAccessDenied(true); return }
            if (!isPublished) { setNotFound(true); return }
          }
        } else {
          // General guide accessed via /suporte/guia/:id — redirect to slug route
          if (!cancelled) navigate(`/suporte/${found.slug}`, { replace: true })
          return
        }

        if (cancelled) return
        setGuide(found)
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
  }, [id, role, clientData, navigate])

  useEffect(() => {
    const onScroll = () => setShowBack(window.scrollY > 280)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/suporte')
    }
  }

  if (loading || role === 'loading') {
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

  if (accessDenied) {
    return (
      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-not-found">
            <span className="not-found-icon">🔒</span>
            <h1 className="not-found-title">Acesso restrito</h1>
            <p className="not-found-desc">
              Este guia é exclusivo para clientes autorizados. Faça login com sua conta para acessá-lo.
            </p>
            <div className="not-found-actions">
              <Link to="/suporte" className="not-found-btn not-found-btn--primary">
                ← Voltar à central
              </Link>
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

  const hasVideo = !!(
    guide.video_url ||
    guide.metadata?.video_embed_url ||
    guide.metadata?.video_embed_code
  )
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const updatedAt = guide.updated_at ?? guide.published_at

  return (
    <div className="guide-page">
      <div className="guide-page-inner">
        <nav className="breadcrumb">
          <Link to="/suporte">Central de Suporte</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Sua Área</span>
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
            ) : (
              <p className="guide-content-empty">Conteúdo em breve.</p>
            )}
          </article>

          <aside className="guide-sidebar">
            <div className="sidebar-card">
              <Link to="/suporte" className="back-to-support-btn">
                ← Voltar à central
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        className={`guide-float-back${showBack ? ' guide-float-back--visible' : ''}`}
        onClick={handleBack}
        aria-label="Voltar"
      >
        ← Voltar
      </button>
    </div>
  )
}
