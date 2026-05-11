import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './EditorLayout.css'

interface EditorLayoutProps {
  children: ReactNode
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  const location = useLocation()

  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="editor-header-inner">
          <Link to="/editor" className="editor-logo">
            <span className="editor-logo-icon">✦</span>
            <span>ConectaHub <strong>Editor</strong></span>
          </Link>

          <nav className="editor-nav">
            <Link
              to="/editor"
              className={`editor-nav-link${location.pathname === '/editor' ? ' active' : ''}`}
            >
              Guias
            </Link>
            <Link
              to="/editor/novo"
              className={`editor-nav-link${location.pathname === '/editor/novo' ? ' active' : ''}`}
            >
              + Novo guia
            </Link>
          </nav>

          <Link to="/suporte" className="editor-back-link">
            ← Voltar ao suporte
          </Link>
        </div>
      </header>

      <div className="editor-auth-banner">
        🔒 Área administrativa — futuramente protegida por autenticação
      </div>

      <main className="editor-main">
        {children}
      </main>
    </div>
  )
}
