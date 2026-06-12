import { supabase } from './supabase'
import type {
  DbCategory,
  DbGuide,
  DbGuideWithCategory,
  SupportClient,
  SupportClientCategory,
  SupportGuideClientAccess,
  SupportGuideRequest,
  ClientGuideGroup,
  EditorClientGuideGroup,
  EditorEntry,
} from '../types/database'

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
    .not('category_id', 'is', null)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

/** Fetch a general guide by slug. Only returns guides with category_id set (never client guides). */
export async function fetchGuideBySlug(slug: string): Promise<DbGuideWithCategory | null> {
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('slug', slug)
    .not('category_id', 'is', null)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data as DbGuideWithCategory | null
}

/** Fetch a general guide by slug with editor-aware status filtering. */
export async function fetchGeneralGuideBySlug(
  slug: string,
  isEditor: boolean,
): Promise<DbGuideWithCategory | null> {
  const statusFilter = isEditor ? ['published', 'draft'] : ['published']
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('slug', slug)
    .not('category_id', 'is', null)
    .in('status', statusFilter)
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
    .not('category_id', 'is', null)
    .in('status', ['published', 'draft'])
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

/**
 * Fetch general guides for a category. Ordering: order_index asc (null last), then title asc.
 * Grouping by support_group is done in JS (groupBySubcategory). Never filters by client access.
 */
export async function fetchGeneralGuidesByCategory(
  categoryId: string,
  isEditor: boolean,
): Promise<DbGuideWithCategory[]> {
  const statusFilter = isEditor ? ['published', 'draft'] : ['published']
  const { data, error } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('category_id', categoryId)
    .in('status', statusFilter)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
  if (error) throw error
  return (data ?? []) as DbGuideWithCategory[]
}

export async function updateGeneralGuideOrder(orderedGuideIds: string[]): Promise<void> {
  await Promise.all(
    orderedGuideIds.map((id, index) =>
      supabase.from('support_guides').update({ order_index: index }).eq('id', id),
    ),
  )
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

/**
 * Fetch a client guide by ID, validating access via support_guide_client_access.
 * Editors bypass the access check.
 */
export async function fetchClientGuideById(
  guideId: string,
  clientId: string,
  isEditor: boolean,
): Promise<DbGuideWithCategory | null> {
  const statusFilter = isEditor
    ? ['client_published', 'client_draft']
    : ['client_published']

  const { data: guide, error: guideError } = await supabase
    .from('support_guides')
    .select('*, category:support_categories(*)')
    .eq('id', guideId)
    .in('status', statusFilter)
    .maybeSingle()

  if (guideError) {
    if (import.meta.env.DEV) console.error('[fetchClientGuideById] guide error:', guideError)
    throw guideError
  }
  if (!guide) return null

  if (!isEditor) {
    const { data: access, error: accessError } = await supabase
      .from('support_guide_client_access')
      .select('id')
      .eq('guide_id', guideId)
      .eq('client_id', clientId)
      .maybeSingle()

    if (accessError) {
      if (import.meta.env.DEV) console.error('[fetchClientGuideById] access error:', accessError)
      return null
    }
    if (!access) return null
  }

  return guide as DbGuideWithCategory
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

export interface CreateClientGuideInput {
  title: string
  slug: string
  excerpt: string | null
  status: 'client_draft' | 'client_published'
  clientId: string
  clientCategoryId: string | null
}

export async function createClientGuide(input: CreateClientGuideInput): Promise<DbGuide> {
  const { data, error } = await supabase
    .from('support_guides')
    .insert({
      title: input.title,
      slug: input.slug,
      category_id: null,
      excerpt: input.excerpt,
      status: input.status,
      tags: [],
      estimated_read_minutes: 3,
      content_html: '<h2>Objetivo</h2><p>Escreva aqui o objetivo deste guia.</p>',
      content_markdown: '## Objetivo\n\nEscreva aqui o objetivo deste guia.',
      metadata: {
        visibility: 'client',
        client_id: input.clientId,
        client_category_id: input.clientCategoryId ?? null,
        support_group: 'client-specific',
      },
      ...(input.status === 'client_published' ? { published_at: new Date().toISOString() } : {}),
    })
    .select()
    .single()
  if (error) {
    if (import.meta.env.DEV) console.error('[createClientGuide] guide insert error:', error)
    throw error
  }
  const guide = data as DbGuide

  const { error: accessError } = await supabase
    .from('support_guide_client_access')
    .insert({
      guide_id: guide.id,
      client_id: input.clientId,
      client_category_id: input.clientCategoryId,
      order_index: 0,
      is_featured: false,
    })
  if (accessError) {
    if (import.meta.env.DEV) console.error('[createClientGuide] access insert error:', accessError)
    await supabase.from('support_guides').delete().eq('id', guide.id)
    throw accessError
  }

  return guide
}

export interface UpdateGuideInput {
  title?: string
  slug?: string
  category_id?: string | null
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

// ── Support Requests ──────────────────────────────────────────────────────────

export interface SupportRequestInput {
  name: string
  email: string
  topic: string
  description?: string
}

export async function submitSupportRequest(input: SupportRequestInput): Promise<void> {
  const { error } = await supabase
    .from('support_requests')
    .insert({
      name: input.name,
      email: input.email,
      topic: input.topic,
      description: input.description || null,
    })
  if (error) throw error
}

// ── Support Tickets ───────────────────────────────────────────────────────────

export type SupportTicketCategory =
  | 'Erro na plataforma'
  | 'Dúvida operacional'
  | 'Configuração'
  | 'Integração'
  | 'Automação'
  | 'Pagamentos'
  | 'Outro'

export type SupportTicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente'

export interface SupportTicketInput {
  name: string
  email: string
  company?: string
  subject: string
  category: SupportTicketCategory
  priority: SupportTicketPriority
  description: string
}

export async function submitSupportTicket(input: SupportTicketInput): Promise<void> {
  const payload = {
    name: input.name,
    email: input.email,
    company: input.company || null,
    subject: input.subject,
    category: input.category,
    priority: input.priority,
    description: input.description,
    status: 'novo',
  }

  const { error } = await supabase.from('support_tickets').insert(payload)

  if (error) {
    console.error('[submitSupportTicket] insert error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload,
    })
    throw error
  }
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

export async function deleteGuide(id: string): Promise<void> {
  const { error } = await supabase.from('support_guides').delete().eq('id', id)
  if (error) throw error
}

// ── Guide requests ────────────────────────────────────────────────────────────

export interface GuideRequestInput {
  name: string
  email: string
  company?: string
  topic: string
  description?: string
  client_id?: string
}

export async function submitGuideRequest(input: GuideRequestInput): Promise<void> {
  const { error } = await supabase.from('support_guide_requests').insert({
    name: input.name,
    email: input.email,
    topic: input.topic,
    description: input.description || null,
    status: 'novo',
    source: 'support_center',
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    ...(input.company ? { company: input.company } : {}),
    ...(input.client_id ? { client_id: input.client_id } : {}),
  })
  if (error) throw error
}

export async function fetchGuideRequests(limit = 50): Promise<SupportGuideRequest[]> {
  const { data, error } = await supabase
    .from('support_guide_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as SupportGuideRequest[]
}

export async function updateGuideRequestStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('support_guide_requests')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ── Client queries ────────────────────────────────────────────────────────────

export async function fetchClients(): Promise<SupportClient[]> {
  const { data, error } = await supabase
    .from('support_clients')
    .select('*')
    .order('display_name')
  if (error) throw error
  return (data ?? []) as SupportClient[]
}

export async function fetchClientCategories(clientId: string): Promise<SupportClientCategory[]> {
  const { data, error } = await supabase
    .from('support_client_categories')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('order_index')
  if (error) throw error
  return (data ?? []) as SupportClientCategory[]
}

export async function fetchAllClientCategories(
  clientId: string,
): Promise<SupportClientCategory[]> {
  const { data, error } = await supabase
    .from('support_client_categories')
    .select('*')
    .eq('client_id', clientId)
    .order('order_index')
  if (error) throw error
  return (data ?? []) as SupportClientCategory[]
}

/**
 * Fetch client guides for a logged-in client. Uses support_guide_client_access as source of truth.
 * Returns groups ordered by client category order_index, guides ordered by access order_index.
 */
export async function fetchClientGuideGroups(clientId: string): Promise<ClientGuideGroup[]> {
  if (!clientId) return []
  if (import.meta.env.DEV) console.log('[support] fetchClientGuideGroups clientId:', clientId)

  const [accessResult, catsResult] = await Promise.all([
    supabase
      .from('support_guide_client_access')
      .select('guide_id, client_category_id, order_index')
      .eq('client_id', clientId)
      .order('order_index', { ascending: true, nullsFirst: false }),
    supabase
      .from('support_client_categories')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('order_index'),
  ])

  if (accessResult.error) {
    if (import.meta.env.DEV) console.error('[fetchClientGuideGroups] access error:', accessResult.error)
    throw accessResult.error
  }

  const accessRows = accessResult.data ?? []
  const guideIds = accessRows.map((r) => r.guide_id)

  if (import.meta.env.DEV) console.log('[support] access rows:', accessRows.length, 'guide IDs:', guideIds.length)

  const guides: DbGuideWithCategory[] = []

  if (guideIds.length > 0) {
    const { data: guidesData, error: guidesError } = await supabase
      .from('support_guides')
      .select('*, category:support_categories(*)')
      .in('id', guideIds)
      .eq('status', 'client_published')

    if (guidesError) {
      if (import.meta.env.DEV) console.error('[fetchClientGuideGroups] guides error:', guidesError)
      throw guidesError
    }
    guides.push(...((guidesData ?? []) as DbGuideWithCategory[]))
  }

  if (import.meta.env.DEV) console.log('[support] published client guides found:', guides.length)

  const categories = catsResult.error ? [] : ((catsResult.data ?? []) as SupportClientCategory[])
  const categoryIds = new Set(categories.map((c) => c.id))

  // Build lookup: guide_id → access row
  const accessMap = new Map(accessRows.map((r) => [r.guide_id, r]))

  // Sort guides by access order_index, then title
  const sortedGuides = [...guides].sort((a, b) => {
    const oa = accessMap.get(a.id)?.order_index ?? Infinity
    const ob = accessMap.get(b.id)?.order_index ?? Infinity
    if (oa !== ob) return oa - ob
    return a.title.localeCompare(b.title, 'pt-BR')
  })

  const groups: ClientGuideGroup[] = categories
    .map((cat) => ({
      category: cat,
      guides: sortedGuides.filter((g) => accessMap.get(g.id)?.client_category_id === cat.id),
    }))
    .filter((group) => group.guides.length > 0)

  const uncategorized = sortedGuides.filter((g) => {
    const catId = accessMap.get(g.id)?.client_category_id
    return !catId || !categoryIds.has(catId)
  })

  if (uncategorized.length > 0) {
    groups.push({ category: null, guides: uncategorized })
  }

  return groups
}

/**
 * Fetch client guides for the editor view. Uses support_guide_client_access as source of truth.
 * Includes both client_published and client_draft statuses.
 */
export async function fetchClientGuidesForEditor(clientId: string): Promise<EditorClientGuideGroup[]> {
  const [accessResult, catsResult] = await Promise.all([
    supabase
      .from('support_guide_client_access')
      .select('guide_id, client_category_id, order_index')
      .eq('client_id', clientId)
      .order('order_index', { ascending: true, nullsFirst: false }),
    supabase
      .from('support_client_categories')
      .select('*')
      .eq('client_id', clientId)
      .order('order_index'),
  ])

  if (accessResult.error) throw accessResult.error
  if (catsResult.error) throw catsResult.error

  const accessRows = accessResult.data ?? []
  const guideIds = accessRows.map((r) => r.guide_id)

  const guides: DbGuideWithCategory[] = []

  if (guideIds.length > 0) {
    const { data: guidesData, error: guidesError } = await supabase
      .from('support_guides')
      .select('*, category:support_categories(*)')
      .in('id', guideIds)
      .in('status', ['client_published', 'client_draft'])

    if (guidesError) throw guidesError
    guides.push(...((guidesData ?? []) as DbGuideWithCategory[]))
  }

  const categories = (catsResult.data ?? []) as SupportClientCategory[]
  const categoryIds = new Set(categories.map((c) => c.id))
  const accessMap = new Map(accessRows.map((r) => [r.guide_id, r]))

  const groups: EditorClientGuideGroup[] = categories.map((cat) => ({
    category: cat,
    guides: guides.filter((g) => accessMap.get(g.id)?.client_category_id === cat.id),
  }))

  const uncategorized = guides.filter((g) => {
    const catId = accessMap.get(g.id)?.client_category_id
    return !catId || !categoryIds.has(catId)
  })

  if (uncategorized.length > 0) {
    groups.push({ category: null, guides: uncategorized })
  }

  return groups
}

export async function fetchGuideClientAccess(
  guideId: string,
): Promise<SupportGuideClientAccess | null> {
  const { data, error } = await supabase
    .from('support_guide_client_access')
    .select('*')
    .eq('guide_id', guideId)
    .maybeSingle()
  if (error) throw error
  return data as SupportGuideClientAccess | null
}

export async function upsertGuideClientAccess(
  guideId: string,
  clientId: string,
  clientCategoryId: string | null,
): Promise<void> {
  await supabase.from('support_guide_client_access').delete().eq('guide_id', guideId)
  const { error } = await supabase
    .from('support_guide_client_access')
    .insert({ guide_id: guideId, client_id: clientId, client_category_id: clientCategoryId })
  if (error) throw error
}

export async function removeGuideClientAccess(guideId: string): Promise<void> {
  const { error } = await supabase
    .from('support_guide_client_access')
    .delete()
    .eq('guide_id', guideId)
  if (error) throw error
}

export async function checkClientGuideAccess(
  guideId: string,
  clientId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('support_guide_client_access')
    .select('id')
    .eq('guide_id', guideId)
    .eq('client_id', clientId)
    .maybeSingle()
  if (error) return false
  return data != null
}

export async function createClient(input: {
  username: string
  login_email: string
  display_name: string
  company_name?: string
  slug: string
}): Promise<SupportClient> {
  const { data, error } = await supabase
    .from('support_clients')
    .insert({
      username: input.username,
      login_email: input.login_email,
      display_name: input.display_name,
      company_name: input.company_name || null,
      slug: input.slug,
      is_active: true,
    })
    .select()
    .single()
  if (error) throw error
  return data as SupportClient
}

export async function addClientCategory(
  clientId: string,
  name: string,
  slug: string,
): Promise<SupportClientCategory> {
  const { data, error } = await supabase
    .from('support_client_categories')
    .insert({ client_id: clientId, name, slug, is_active: true, order_index: 0 })
    .select()
    .single()
  if (error) throw error
  return data as SupportClientCategory
}

export async function toggleClientCategory(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('support_client_categories')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}

export async function updateClientCategoryOrder(id: string, orderIndex: number): Promise<void> {
  const { error } = await supabase
    .from('support_client_categories')
    .update({ order_index: orderIndex })
    .eq('id', id)
  if (error) throw error
}

export async function updateClientCategoryName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('support_client_categories')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteClientCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('support_client_categories')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Login identifier resolver ────────────────────────────────────────────────

export interface ResolvedSupportLogin {
  login_email: string
  account_type: string | null
  display_name: string | null
}

/**
 * Resolve a username or email to a canonical login_email using the
 * resolve_support_login_identifier RPC (SECURITY DEFINER — bypasses anon RLS).
 *
 * The RPC is defined as RETURNS TABLE, so Supabase-js always returns the result
 * as an array even when there is only one row. This function normalises that.
 *
 * Returns null when the identifier is not found (caller should show
 * "Usuário não encontrado.").
 * Throws when the RPC itself errors (caller should show a generic error).
 */
export async function resolveSupportLoginIdentifier(
  identifier: string,
): Promise<ResolvedSupportLogin | null> {
  const normalized = identifier.trim().toLowerCase()
  if (!normalized) return null

  console.log('[login resolver] identifier:', normalized)

  const { data, error } = await supabase.rpc('resolve_support_login_identifier', {
    p_identifier: normalized,
  })

  console.log('[login resolver] raw data:', data)
  console.log('[login resolver] raw error:', error)

  if (error) {
    console.error('[login resolver] RPC error:', error)
    throw error
  }

  // RETURNS TABLE → Supabase-js wraps the result in an array.
  // Do NOT access data.login_email directly without normalising first.
  const result: unknown = Array.isArray(data) ? (data as unknown[])[0] : data

  console.log('[login resolver] normalized result:', result)

  if (!result || typeof result !== 'object') return null

  const rec = result as Record<string, unknown>
  const loginEmail = typeof rec.login_email === 'string' ? rec.login_email.trim().toLowerCase() : ''
  if (!loginEmail) return null

  return {
    login_email: loginEmail,
    account_type: typeof rec.account_type === 'string' ? rec.account_type : null,
    display_name: typeof rec.display_name === 'string' ? rec.display_name : null,
  }
}

// ── Editor RPCs ───────────────────────────────────────────────────────────────

export type { EditorEntry } from '../types/database'

export async function listSupportEditors(): Promise<EditorEntry[]> {
  const { data, error } = await supabase.rpc('list_support_editors')
  if (error) throw error
  return (data ?? []) as EditorEntry[]
}

export async function addSupportEditorByEmail(email: string, role: string): Promise<void> {
  const { error } = await supabase.rpc('add_support_editor_by_email', {
    p_email: email,
    p_role: role,
  })
  if (error) throw error
}

export async function removeSupportEditor(userId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_support_editor', { p_user_id: userId })
  if (error) throw error
}

export async function upsertSupportClientByEmail(input: {
  email: string
  username: string
  display_name: string
  company_name?: string
  slug: string
}): Promise<SupportClient> {
  const { data, error } = await supabase.rpc('upsert_support_client_by_email', {
    p_email: input.email,
    p_username: input.username,
    p_display_name: input.display_name,
    p_company_name: input.company_name || null,
    p_slug: input.slug,
  })
  if (error) throw error
  return data as SupportClient
}
