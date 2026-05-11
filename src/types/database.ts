export interface DbCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order_index: number
  is_active: boolean
}

export interface DbGuide {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_id: string
  status: string
  tags: string[] | null
  video_url: string | null
  cover_image_url: string | null
  content_html: string | null
  content_markdown: string | null
  content_json: unknown
  estimated_read_minutes: number | null
  published_at: string | null
  updated_at: string | null
}

export interface DbGuideWithCategory extends DbGuide {
  category: DbCategory | null
}
