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

    if (import.meta.env.DEV) console.log('[support] resolveRole for', currentUser.id, currentUser.email)

    try {
      const { data: editorRole } = await supabase.rpc('get_my_support_editor_role')
      if (editorRole === 'owner' || editorRole === 'editor') {
        setRole('editor')
        setClientData(null)
        return
      }
    } catch { /* ignore */ }

    try {
      const { data: clientRec } = await supabase.rpc('get_my_support_client')
      if (import.meta.env.DEV) console.log('[support] get_my_support_client raw:', clientRec)
      // RPC may return a single object or a one-element array depending on Supabase version
      const rec: unknown = Array.isArray(clientRec) ? (clientRec as unknown[])[0] : clientRec
      if (rec && typeof rec === 'object' && 'id' in (rec as object)) {
        if (import.meta.env.DEV) console.log('[support] resolved client via RPC:', (rec as SupportClientData).id)
        setRole('client')
        setClientData(rec as SupportClientData)
        return
      }
    } catch { /* ignore */ }

    // Fallback: direct query by login_email (handles records where auth_user_id is not linked)
    if (currentUser.email) {
      try {
        const { data: clientByEmail, error: emailErr } = await supabase
          .from('support_clients')
          .select('*')
          .eq('login_email', currentUser.email)
          .eq('is_active', true)
          .maybeSingle()
        if (import.meta.env.DEV) console.log('[support] fallback by login_email:', clientByEmail, emailErr)
        if (clientByEmail && typeof clientByEmail === 'object' && 'id' in (clientByEmail as object)) {
          setRole('client')
          setClientData(clientByEmail as unknown as SupportClientData)
          return
        }
      } catch { /* ignore */ }
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
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
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
