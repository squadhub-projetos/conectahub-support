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
  metadata: Record<string, unknown> | null
  estimated_read_minutes: number | null
  published_at: string | null
  updated_at: string | null
}

export interface DbGuideWithCategory extends DbGuide {
  category: DbCategory | null
}

export interface SupportClient {
  id: string
  username: string
  display_name: string
  company_name: string | null
  slug: string
  login_email: string
  auth_user_id: string | null
  is_active: boolean
  created_at: string
}

export interface SupportClientCategory {
  id: string
  client_id: string
  name: string
  slug: string
  description: string | null
  order_index: number
  is_active: boolean
}

export interface SupportGuideClientAccess {
  id: string
  guide_id: string
  client_id: string
  client_category_id: string | null
  created_at: string
}

export interface SupportGuideRequest {
  id: string
  name: string
  email: string
  topic: string
  description: string | null
  status: string
  created_at: string
}

export interface ClientGuideGroup {
  category: SupportClientCategory | null
  guides: DbGuideWithCategory[]
}

export interface EditorClientGuideGroup {
  category: SupportClientCategory | null
  guides: DbGuideWithCategory[]
}

export interface EditorEntry {
  id: string
  email: string
  role: string
  created_at: string
}
