import { supabase } from './supabase'
import type { DbCategory, DbGuideWithCategory } from '../types/database'

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
