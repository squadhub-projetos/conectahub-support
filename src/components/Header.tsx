import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import PageCornerLoginTrigger from './PageCornerLoginTrigger'
import EditorLoginModal from './EditorLoginModal'
import './Header.css'

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/suporte" className="header-logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">
              ConectaHub <span className="logo-sub">Support</span>
            </span>
          </Link>

          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <PageCornerLoginTrigger onClick={() => setShowLogin(true)} />

      {showLogin && <EditorLoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
