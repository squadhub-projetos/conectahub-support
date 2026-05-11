import type { DbCategory } from '../types/database'
import './CategoryCard.css'

interface CategoryCardProps {
  category: DbCategory
  count: number
  isActive: boolean
  onClick: () => void
}

export default function CategoryCard({ category, count, isActive, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      className={`category-card${isActive ? ' category-card--active' : ''}`}
      onClick={onClick}
    >
      <span className="category-icon">{category.icon ?? '📄'}</span>
      <div className="category-info">
        <span className="category-name">{category.name}</span>
        {category.description && (
          <span className="category-desc">{category.description}</span>
        )}
      </div>
      <span className="category-count">{count}</span>
    </button>
  )
}
