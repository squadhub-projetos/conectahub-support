import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
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

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.user) {
          setErrorMsg('Usuário ou senha inválidos.')
          return
        }

        // Check editor role
        const { data: editorRole, error: editorErr } = await supabase.rpc('get_my_support_editor_role')
        if (!editorErr && (editorRole === 'owner' || editorRole === 'editor')) {
          await refreshRole()
          setPassword('')
          setIsClosing(true)
          setTimeout(() => { onClose(); navigate('/admin/guides') }, 210)
          return
        }

        // Check client role via RPC (may return single object or one-element array)
        const { data: clientRec, error: clientErr } = await supabase.rpc('get_my_support_client')
        const clientRecNorm: unknown = Array.isArray(clientRec) ? (clientRec as unknown[])[0] : clientRec
        if (!clientErr && clientRecNorm && typeof clientRecNorm === 'object' && 'id' in (clientRecNorm as object)) {
          await refreshRole()
          setPassword('')
          setIsClosing(true)
          setTimeout(() => onClose(), 210)
          return
        }

        // Fallback: direct query by login_email (handles unlinked auth_user_id)
        if (data.user.email) {
          const { data: clientByEmail } = await supabase
            .from('support_clients')
            .select('id')
            .eq('login_email', data.user.email)
            .eq('is_active', true)
            .maybeSingle()
          if (clientByEmail) {
            await refreshRole()
            setPassword('')
            setIsClosing(true)
            setTimeout(() => onClose(), 210)
            return
          }
        }

        // Neither editor nor client
        await supabase.auth.signOut()
        setErrorMsg('Acesso negado. Usuário não autorizado.')
      } catch {
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
