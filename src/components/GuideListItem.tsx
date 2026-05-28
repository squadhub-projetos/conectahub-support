import { Link } from 'react-router-dom'
import type { DbGuideWithCategory } from '../types/database'
import './GuideListItem.css'

interface GuideListItemProps {
  guide: DbGuideWithCategory
  onClick?: () => void
  clientRoute?: boolean
}

export default function GuideListItem({ guide, onClick, clientRoute }: GuideListItemProps) {
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const hasVideo = guide.video_url != null
  const to = clientRoute ? `/suporte/guia/${guide.id}` : `/suporte/${guide.slug}`

  return (
    <Link to={to} className="guide-list-item" onClick={onClick}>
      <div className="gli-body">
        <div className="gli-meta-top">
          {hasVideo && <span className="gli-video-badge">▶ Vídeo</span>}
          <span className="gli-readtime">⏱ {readTime} min</span>
        </div>
        <h4 className="gli-title">{guide.title}</h4>
        {guide.excerpt && <p className="gli-excerpt">{guide.excerpt}</p>}
        {tags.length > 0 && (
          <div className="gli-tags">
            {tags.map((tag) => (
              <span key={tag} className="gli-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      <span className="gli-cta" aria-hidden="true">Abrir →</span>
    </Link>
  )
}
