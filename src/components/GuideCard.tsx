import { Link } from 'react-router-dom'
import type { DbGuideWithCategory } from '../types/database'
import './GuideCard.css'

interface GuideCardProps {
  guide: DbGuideWithCategory
}

export default function GuideCard({ guide }: GuideCardProps) {
  const tags = guide.tags ?? []
  const hasVideo = guide.video_url != null
  const readTime = guide.estimated_read_minutes ?? 5
  const categoryName = guide.category?.name ?? 'Geral'

  return (
    <article className="guide-card">
      <div className="guide-card-header">
        <span className="guide-category-badge">{categoryName}</span>
        {hasVideo && <span className="guide-video-badge">▶ Vídeo</span>}
      </div>

      <h3 className="guide-title">{guide.title}</h3>
      {guide.excerpt && <p className="guide-description">{guide.excerpt}</p>}

      {tags.length > 0 && (
        <div className="guide-tags">
          {tags.map((tag) => (
            <span key={tag} className="guide-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="guide-footer">
        <span className="guide-read-time">⏱ {readTime} min de leitura</span>
        <Link to={`/suporte/${guide.slug}`} className="guide-link-btn">
          Ver guia →
        </Link>
      </div>
    </article>
  )
}
