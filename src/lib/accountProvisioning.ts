import { supabase } from './supabase'

export interface ProvisionClientInput {
  email: string
  username: string
  displayName: string
  company?: string
}

export interface ProvisionEditorInput {
  email: string
  role: 'editor' | 'owner'
}

export interface ProvisionResult {
  success: boolean
  message?: string
  [key: string]: unknown
}

async function callProvisionWebhook(payload: Record<string, unknown>): Promise<ProvisionResult> {
  const url = import.meta.env.VITE_N8N_PROVISION_ACCOUNT_URL
  if (!url) throw new Error('VITE_N8N_PROVISION_ACCOUNT_URL não configurada.')

  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData?.session?.access_token
  if (!accessToken) throw new Error('Sessão expirada. Faça login novamente.')

  if (import.meta.env.DEV) {
    console.log('[provision] payload:', JSON.stringify({ ...payload, _token: '[omitted]' }))
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => ({ success: false, message: `HTTP ${res.status}` }))

  if (import.meta.env.DEV) {
    console.log('[provision] response status:', res.status, '| body:', body)
  }

  if (!res.ok) {
    const msg = (body as { message?: string }).message ?? `Erro HTTP ${res.status}`
    throw new Error(msg)
  }

  return body as ProvisionResult
}

export async function provisionClient(input: ProvisionClientInput): Promise<ProvisionResult> {
  return callProvisionWebhook({
    action: 'create_client',
    email: input.email,
    username: input.username,
    displayName: input.displayName,
    company: input.company ?? '',
    mode: 'invite',
  })
}

export async function provisionEditor(input: ProvisionEditorInput): Promise<ProvisionResult> {
  return callProvisionWebhook({
    action: 'create_editor',
    email: input.email,
    role: input.role,
    mode: 'invite',
  })
}
