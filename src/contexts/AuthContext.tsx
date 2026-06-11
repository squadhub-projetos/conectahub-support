import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'loading' | 'none' | 'editor' | 'client'

export interface SupportClientData {
  id: string
  username: string
  display_name: string
  company_name: string | null
  slug: string
  login_email: string
  is_active: boolean
}

interface AuthContextValue {
  user: User | null
  role: UserRole
  clientData: SupportClientData | null
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: 'loading',
  clientData: null,
  refreshRole: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>('loading')
  const [clientData, setClientData] = useState<SupportClientData | null>(null)

  const resolveRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole('none')
      setClientData(null)
      return
    }

    console.log('[auth] resolveRole — user.id:', currentUser.id, '| email:', currentUser.email)

    // ── 1. Check editor via direct query on support_editors ──────────────────
    try {
      const { data: editorData, error: editorErr } = await supabase
        .from('support_editors')
        .select('user_id, role')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      console.log('[auth] support_editors result:', editorData, '| error:', editorErr)

      if (!editorErr && editorData && ['editor', 'admin', 'owner'].includes(editorData.role)) {
        setRole('editor')
        setClientData(null)
        return
      }
    } catch (e) {
      console.warn('[auth] support_editors query threw:', e)
    }

    // ── 2. Check client via auth_user_id ─────────────────────────────────────
    try {
      const { data: clientRec, error: clientErr } = await supabase
        .from('support_clients')
        .select('*')
        .eq('auth_user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle()

      console.log('[auth] support_clients (auth_user_id) result:', clientRec, '| error:', clientErr)

      if (!clientErr && clientRec && typeof clientRec === 'object' && 'id' in clientRec) {
        setRole('client')
        setClientData(clientRec as SupportClientData)
        return
      }
    } catch (e) {
      console.warn('[auth] support_clients (auth_user_id) query threw:', e)
    }

    // ── 3. Fallback: check client by login_email ──────────────────────────────
    if (currentUser.email) {
      try {
        const { data: clientByEmail, error: emailErr } = await supabase
          .from('support_clients')
          .select('*')
          .eq('login_email', currentUser.email)
          .eq('is_active', true)
          .maybeSingle()

        console.log('[auth] support_clients (login_email) result:', clientByEmail, '| error:', emailErr)

        if (!emailErr && clientByEmail && typeof clientByEmail === 'object' && 'id' in clientByEmail) {
          setRole('client')
          setClientData(clientByEmail as SupportClientData)
          return
        }
      } catch (e) {
        console.warn('[auth] support_clients (login_email) query threw:', e)
      }
    }

    setRole('none')
    setClientData(null)
  }, [])

  const refreshRole = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const u = session?.user ?? null
    setUser(u)
    await resolveRole(u)
  }, [resolveRole])

  useEffect(() => {
    // Resolve role on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      resolveRole(u)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setRole('none')
        setClientData(null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const u = session?.user ?? null
        setUser(u)
        resolveRole(u)
      }
    })

    return () => subscription.unsubscribe()
  }, [resolveRole])

  return (
    <AuthContext.Provider value={{ user, role, clientData, refreshRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
