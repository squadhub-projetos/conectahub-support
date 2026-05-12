import { Link } from 'react-router-dom'
import type { DbGuideWithCategory } from '../types/database'
import './GuideSearchResult.css'

interface GuideSearchResultProps {
  guide: DbGuideWithCategory
  onClick?: () => void
}

export default function GuideSearchResult({ guide, onClick }: GuideSearchResultProps) {
  return (
    <Link
      to={`/suporte/${guide.slug}`}
      className="guide-search-result"
      onClick={onClick}
    >
      <div className="gsr-body">
        <span className="gsr-title">{guide.title}</span>
        {guide.excerpt && (
          <span className="gsr-excerpt">{guide.excerpt}</span>
        )}
      </div>
      <span className="gsr-arrow">›</span>
    </Link>
  )
}
