import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import PageCornerLoginTrigger from './PageCornerLoginTrigger'
import EditorLoginModal from './EditorLoginModal'
import squadhubIcon from '../assets/squadhub-icon.svg'
import './Header.css'

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/suporte" className="header-logo">
            <span className="logo-icon-wrap">
              <img src={squadhubIcon} alt="" className="logo-icon-img" aria-hidden="true" />
            </span>
            <span className="logo-text-block">
              <span className="logo-brand">SquadHub</span>
              <span className="logo-product">Central de Ajuda</span>
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
