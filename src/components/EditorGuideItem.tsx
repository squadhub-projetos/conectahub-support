import { Link } from 'react-router-dom'
import type { DbGuideWithCategory } from '../types/database'
import './EditorGuideItem.css'

interface EditorGuideItemProps {
  guide: DbGuideWithCategory
}

export default function EditorGuideItem({ guide }: EditorGuideItemProps) {
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const hasVideo = guide.video_url != null

  return (
    <div className="editor-guide-item">
      <div className="egi-body">
        <div className="egi-meta-top">
          {guide.status === 'draft' && (
            <span className="egi-draft-badge">Rascunho</span>
          )}
          {hasVideo && <span className="gli-video-badge">▶ Vídeo</span>}
          <span className="gli-readtime">⏱ {readTime} min</span>
        </div>
        <h4 className="egi-title">{guide.title}</h4>
        {guide.excerpt && <p className="gli-excerpt">{guide.excerpt}</p>}
        {tags.length > 0 && (
          <div className="gli-tags">
            {tags.map((tag) => (
              <span key={tag} className="gli-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="egi-actions">
        <Link
          to={`/admin/guides/${guide.id}/edit`}
          className="egi-btn egi-btn--edit"
        >
          Editar
        </Link>
        <a
          href={`/suporte/${guide.slug}`}
          target="_blank"
          rel="noreferrer"
          className="egi-btn egi-btn--view"
        >
          Visualizar
        </a>
      </div>
    </div>
  )
}
