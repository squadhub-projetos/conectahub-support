import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { DbGuideWithCategory } from '../types/database'
import './EditorGuideItem.css'

interface EditorGuideItemProps {
  guide: DbGuideWithCategory
  onDeleteRequest?: (guide: DbGuideWithCategory) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export default function EditorGuideItem({
  guide,
  onDeleteRequest,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: EditorGuideItemProps) {
  const tags = guide.tags ?? []
  const readTime = guide.estimated_read_minutes ?? 5
  const hasVideo = guide.video_url != null
  const isClientGuide = (guide.metadata?.visibility as string | undefined) === 'client'
  const showOrderControls = onMoveUp !== undefined || onMoveDown !== undefined

  return (
    <div className="editor-guide-item">
      <div className="egi-body">
        <div className="egi-meta-top">
          {guide.status === 'draft' && (
            <span className="egi-draft-badge">Rascunho</span>
          )}
          {isClientGuide && <span className="egi-client-badge">🔒 Cliente</span>}
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
        {showOrderControls && (
          <div className="egi-order-btns">
            <button
              type="button"
              className="egi-btn egi-btn--order"
              onClick={onMoveUp}
              disabled={isFirst}
              aria-label="Mover para cima"
              title="Mover para cima"
            >
              ↑
            </button>
            <button
              type="button"
              className="egi-btn egi-btn--order"
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="Mover para baixo"
              title="Mover para baixo"
            >
              ↓
            </button>
          </div>
        )}
        <Link
          to={`/admin/guides/${guide.id}/edit`}
          className="egi-btn egi-btn--edit"
        >
          Editar
        </Link>
        <a
          href={`/admin/guides/${guide.id}/preview`}
          target="_blank"
          rel="noreferrer"
          className="egi-btn egi-btn--view"
        >
          Visualizar
        </a>
        {onDeleteRequest && (
          <button
            type="button"
            className="egi-btn egi-btn--delete"
            onClick={() => onDeleteRequest(guide)}
            aria-label="Excluir guia"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}
