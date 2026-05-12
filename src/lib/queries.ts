import { supabase } from './supabase'
import type { DbCategory, DbGuide, DbGuideWithCategory } from '../types/database'

// ── Public queries ────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase
    .from('support_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index')
  if (error) throw error
  return (data ?? []) as DbCategory[]
}

export async function fetchGuides(): Promise<DbGuideWithCategory[]> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

export async function fetchGuideBySlug(slug: string): Promise<DbGuideWithCategory | null> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data as DbGuideWithCategory | null
}

export async function fetchRelatedGuides(
  categoryId: string,
  excludeId: string
): Promise<DbGuideWithCategory[]> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', excludeId)
    .limit(4)
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function fetchAllGuides(): Promise<DbGuideWithCategory[]> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

export async function fetchGuideById(id: string): Promise<DbGuideWithCategory | null> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as DbGuideWithCategory | null
}

export interface CreateGuideInput {
  title: string
  slug: string
  category_id: string
  excerpt: string | null
  status: 'draft' | 'published'
  metadata: Record<string, unknown>
}

export async function createGuide(input: CreateGuideInput): Promise<DbGuide> {
  const { data, error } = await supabase
    .from('support_guides')
    .insert({
      title: input.title,
      slug: input.slug,
      category_id: input.category_id,
      excerpt: input.excerpt,
      status: input.status,
      tags: [],
      estimated_read_minutes: 3,
      content_html: '<h2>Objetivo</h2><p>Escreva aqui o objetivo deste guia.</p>',
      content_markdown: '## Objetivo\n\nEscreva aqui o objetivo deste guia.',
      metadata: input.metadata,
      ...(input.status === 'published' ? { published_at: new Date().toISOString() } : {}),
    })
    .select()
    .single()
  if (error) throw error
  return data as DbGuide
}

export interface UpdateGuideInput {
  title?: string
  slug?: string
  category_id?: string
  excerpt?: string | null
  status?: string
  tags?: string[]
  video_url?: string | null
  cover_image_url?: string | null
  content_html?: string | null
  content_markdown?: string | null
  content_json?: unknown
  estimated_read_minutes?: number | null
  metadata?: Record<string, unknown>
  published_at?: string | null
}

export async function updateGuide(id: string, input: UpdateGuideInput): Promise<DbGuide> {
  const { data, error } = await supabase
    .from('support_guides')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as DbGuide
}
