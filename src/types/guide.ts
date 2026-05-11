export type Category =
  | 'Contatos'
  | 'Conversas'
  | 'Oportunidades'
  | 'Automações'
  | 'Calendários'
  | 'Configurações'
  | 'Outros'

export type GuideStatus = 'published' | 'draft'

export interface Guide {
  id: string
  slug: string
  title: string
  description: string
  category: Category
  tags: string[]
  readTime: number
  hasVideo: boolean
  videoUrl?: string
  coverImage?: string
  content: string
  status: GuideStatus
  updatedAt: string
}
