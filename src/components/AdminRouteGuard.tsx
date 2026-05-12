import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminRouteGuard.css'

type AuthState = 'loading' | 'authorized' | 'denied'

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          if (!cancelled) setState('denied')
          return
        }

        if (import.meta.env.DEV) {
          console.log('[AdminRouteGuard] user:', session.user.id)
        }

        const { data: role, error } = await supabase.rpc('get_my_support_editor_role')

        if (import.meta.env.DEV) {
          if (error) console.error('[AdminRouteGuard] RPC error:', error)
          else console.log('[AdminRouteGuard] role:', role)
        }

        if (!cancelled) {
          setState(role === 'owner' || role === 'editor' ? 'authorized' : 'denied')
        }
      } catch (err) {
        if (!cancelled) {
          if (import.meta.env.DEV) console.error('[AdminRouteGuard] error:', err)
          setState('denied')
        }
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  if (state === 'loading') {
    return (
      <div className="arg-screen">
        <div className="arg-spinner" />
        <p className="arg-msg">Verificando acesso…</p>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="arg-screen">
        <span className="arg-icon">🔒</span>
        <h2 className="arg-title">Acesso negado</h2>
        <p className="arg-msg">Você não tem permissão para acessar esta área.</p>
        <Link to="/suporte" className="arg-btn">← Voltar à central</Link>
      </div>
    )
  }

  return <>{children}</>
}
