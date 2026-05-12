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

export const ICON_MAP: Record<string, LucideIcon> = {
  'user': User,
  'message-square': MessageSquare,
  'chart-line': TrendingUp,
  'zap': Zap,
  'calendar': Calendar,
  'settings': Settings,
  'book-open': BookOpen,
}

interface CategoryIconProps {
  icon: string | null
  size?: number
}

export default function CategoryIcon({ icon, size = 24 }: CategoryIconProps) {
  const IconComponent: LucideIcon = (icon != null ? ICON_MAP[icon] : undefined) ?? BookOpen
  return <IconComponent size={size} strokeWidth={1.75} />
}
