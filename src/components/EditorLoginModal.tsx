import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './EditorLoginModal.css'

interface EditorLoginModalProps {
  onClose: () => void
}

export default function EditorLoginModal({ onClose }: EditorLoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      setErrorMsg(null)

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.user) {
          setErrorMsg('E-mail ou senha incorretos.')
          return
        }

        if (import.meta.env.DEV) {
          console.log('[EditorLogin] user.id:', data.user.id)
        }

        const { data: role, error: rpcError } = await supabase.rpc('get_my_support_editor_role')

        if (import.meta.env.DEV) {
          if (rpcError) console.error('[EditorLogin] RPC error:', rpcError)
          else console.log('[EditorLogin] role:', role)
        }

        if (rpcError || (role !== 'owner' && role !== 'editor')) {
          await supabase.auth.signOut()
          setErrorMsg('Acesso negado. Usuário não autorizado como editor.')
          return
        }

        navigate('/admin/guides')
      } catch {
        setErrorMsg('Ocorreu um erro inesperado. Tente novamente.')
      } finally {
        setLoading(false)
      }
    },
    [email, password, navigate]
  )

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="login-modal-header">
          <span className="login-modal-icon">✦</span>
          <h2 className="login-modal-title">Acesso ao Editor</h2>
          <p className="login-modal-sub">Área restrita a editores autorizados.</p>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          {errorMsg && <p className="login-error">{errorMsg}</p>}

          <label className="login-label">
            E-mail
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
