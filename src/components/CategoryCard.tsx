import {
  User,
  MessageSquare,
  TrendingUp,
  Zap,
  Calendar,
  Settings,
  BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DbCategory } from '../types/database'
import './CategoryCard.css'

const ICON_MAP: Record<string, LucideIcon> = {
  'user': User,
  'message-square': MessageSquare,
  'chart-line': TrendingUp,
  'zap': Zap,
  'calendar': Calendar,
  'settings': Settings,
  'book-open': BookOpen,
}

interface CategoryCardProps {
  category: DbCategory
  count: number
  isActive: boolean
  onClick: () => void
}

export default function CategoryCard({ category, count, isActive, onClick }: CategoryCardProps) {
  const IconComponent: LucideIcon =
    (category.icon != null ? ICON_MAP[category.icon] : undefined) ?? BookOpen

  return (
    <button
      type="button"
      className={`category-card${isActive ? ' category-card--active' : ''}`}
      onClick={onClick}
    >
      <span className="category-icon">
        <IconComponent size={20} strokeWidth={1.75} />
      </span>
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
