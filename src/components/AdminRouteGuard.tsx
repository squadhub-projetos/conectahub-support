import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AdminRouteGuard.css'

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { role } = useAuth()

  if (role === 'loading') {
    return (
      <div className="arg-screen">
        <div className="arg-spinner" />
        <p className="arg-msg">Verificando acesso…</p>
      </div>
    )
  }

  if (role !== 'editor') {
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
