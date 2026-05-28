import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import EditorLoginModal from './EditorLoginModal'
import EditorSettingsModal from './EditorSettingsModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import squadhubIcon from '../assets/squadhub-icon.svg'
import './Header.css'

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { user, role, clientData } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/suporte')
  }

  const isLoggedIn = user != null && (role === 'editor' || role === 'client')

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="header-left">
            <Link to="/suporte" className="header-logo">
              <span className="logo-icon-wrap">
                <img src={squadhubIcon} alt="" className="logo-icon-img" aria-hidden="true" />
              </span>
              <span className="logo-text-block">
                <span className="logo-brand">SquadHub</span>
                <span className="logo-product">Central de Ajuda</span>
              </span>
            </Link>
            {role === 'editor' && (
              <span className="header-user-badge">Editor</span>
            )}
            {role === 'client' && clientData && (
              <span className="header-user-badge header-user-badge--client">
                {clientData.company_name || clientData.display_name}
              </span>
            )}
          </div>

          <div className="header-actions">
            {role === 'editor' && (
              <button
                type="button"
                className="header-manage-btn"
                onClick={() => setShowSettings(true)}
              >
                <Settings size={14} strokeWidth={2} />
                <span>Gerenciar</span>
              </button>
            )}
            {isLoggedIn ? (
              <button
                type="button"
                className="header-auth-btn header-auth-btn--out"
                onClick={handleSignOut}
              >
                <LogOut size={15} strokeWidth={2} />
                <span>Sair</span>
              </button>
            ) : (
              <button
                type="button"
                className="header-auth-btn header-auth-btn--in"
                onClick={() => setShowLogin(true)}
              >
                <LogIn size={15} strokeWidth={2} />
                <span>Entrar</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {showLogin && <EditorLoginModal onClose={() => setShowLogin(false)} />}
      {showSettings && <EditorSettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
