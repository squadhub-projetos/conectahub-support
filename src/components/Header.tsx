import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import ThemeToggle from './ThemeToggle'
import EditorLoginModal from './EditorLoginModal'
import { supabase } from '../lib/supabase'
import squadhubIcon from '../assets/squadhub-icon.svg'
import './Header.css'

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/suporte')
  }

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
            {user && (
              <span className="header-user-badge">Editor</span>
            )}
          </div>

          <div className="header-actions">
            {user ? (
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
    </>
  )
}
