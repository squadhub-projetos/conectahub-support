import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './EditorLoginModal.css'

interface EditorLoginModalProps {
  onClose: () => void
}

export default function EditorLoginModal({ onClose }: EditorLoginModalProps) {
  const navigate = useNavigate()
  const { refreshRole } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => onClose(), 210)
  }, [onClose])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      setErrorMsg(null)

      try {
        // Build login email: if no "@", treat as username and construct technical email
        const raw = identifier.trim()
        const email = raw.includes('@')
          ? raw
          : `${raw.toLowerCase()}@clientes.conectahub.local`

        // ── Step 1: Authenticate ─────────────────────────────────────────────
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          console.warn('[login] auth error:', authError.message)
          setErrorMsg('E-mail ou senha inválidos.')
          return
        }

        // Use user from response; fall back to getUser() if not present
        let user: User | null = authData?.user ?? null
        if (!user) {
          const { data: { user: fetched } } = await supabase.auth.getUser()
          user = fetched ?? null
        }

        if (!user) {
          setErrorMsg('E-mail ou senha inválidos.')
          return
        }

        console.log('[login] user.id:', user.id)
        console.log('[login] user.email:', user.email)

        // ── Step 2: Check editor via support_editors ─────────────────────────
        const { data: editorData, error: editorErr } = await supabase
          .from('support_editors')
          .select('user_id, role')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('[login] support_editors result:', editorData, '| error:', editorErr)

        if (!editorErr && editorData && ['editor', 'admin', 'owner'].includes(editorData.role)) {
          await refreshRole()
          setPassword('')
          setIsClosing(true)
          setTimeout(() => { onClose(); navigate('/admin/guides') }, 210)
          return
        }

        // ── Step 3: Check client via auth_user_id ────────────────────────────
        const { data: clientRec, error: clientErr } = await supabase
          .from('support_clients')
          .select('*')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        console.log('[login] support_clients (auth_user_id) result:', clientRec, '| error:', clientErr)

        if (!clientErr && clientRec && typeof clientRec === 'object' && 'id' in clientRec) {
          await refreshRole()
          setPassword('')
          setIsClosing(true)
          setTimeout(() => onClose(), 210)
          return
        }

        // ── Step 4: Fallback — check client by login_email ───────────────────
        if (user.email) {
          const { data: clientByEmail, error: emailErr } = await supabase
            .from('support_clients')
            .select('id')
            .eq('login_email', user.email)
            .eq('is_active', true)
            .maybeSingle()

          console.log('[login] support_clients (login_email) result:', clientByEmail, '| error:', emailErr)

          if (!emailErr && clientByEmail && typeof clientByEmail === 'object' && 'id' in clientByEmail) {
            await refreshRole()
            setPassword('')
            setIsClosing(true)
            setTimeout(() => onClose(), 210)
            return
          }
        }

        // ── Step 5: Neither editor nor client ────────────────────────────────
        console.warn('[login] user is not editor or client — signing out')
        await supabase.auth.signOut()
        setErrorMsg('Acesso negado. Usuário não autorizado.')
      } catch (err) {
        console.error('[login] unexpected error:', err)
        setErrorMsg('Ocorreu um erro inesperado. Tente novamente.')
      } finally {
        setLoading(false)
      }
    },
    [identifier, password, navigate, onClose, refreshRole],
  )

  return (
    <div
      className={`login-modal-backdrop${isClosing ? ' is-closing' : ''}`}
    >
      <div
        className={`login-modal${isClosing ? ' is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={handleClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="login-modal-header">
          <span className="login-modal-icon">✦</span>
          <h2 className="login-modal-title">Acessar a Central</h2>
          <p className="login-modal-sub">Entre com suas credenciais para continuar.</p>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          {errorMsg && <p className="login-error">{errorMsg}</p>}

          <label className="login-label">
            Usuário ou e-mail
            <input
              type="text"
              className="login-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="seu.usuario ou email@empresa.com"
              required
              disabled={loading}
            />
          </label>

          <label className="login-label">
            Senha
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
