import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const location = useLocation()
  const isSupport = location.pathname.startsWith('/suporte')

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/suporte" className="header-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">ConectaHub <span className="logo-sub">Support</span></span>
        </Link>

        {isSupport && (
          <nav className="header-nav">
            <Link to="/suporte" className="nav-link">Central de Ajuda</Link>
          </nav>
        )}

        <div className="header-actions">
          <Link to="/editor" className="editor-btn">
            Modo Editor
          </Link>
        </div>
      </div>
    </header>
  )
}
