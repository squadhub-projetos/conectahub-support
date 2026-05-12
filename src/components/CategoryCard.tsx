import type { DbCategory } from '../types/database'
import CategoryIcon from './CategoryIcon'
import './CategoryCard.css'

interface CategoryCardProps {
  category: DbCategory
  onClick: () => void
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button type="button" className="category-card" onClick={onClick}>
      <span className="category-icon">
        <CategoryIcon icon={category.icon} size={24} />
      </span>
      <span className="category-name">{category.name}</span>
      {category.description && (
        <span className="category-desc">{category.description}</span>
      )}
      <span className="category-cta">Ver guias →</span>
    </button>
  )
}
