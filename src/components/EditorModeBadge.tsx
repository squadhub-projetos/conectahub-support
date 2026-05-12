import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './EditorModeBadge.css'

export default function EditorModeBadge() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/suporte')
  }

  return (
    <div className="editor-mode-banner">
      <div className="editor-mode-left">
        <Pencil size={13} strokeWidth={2.5} />
        <span className="editor-mode-label">Modo de Edição</span>
        <span className="editor-mode-hint">— alterações são visíveis apenas para editores</span>
      </div>
      <button type="button" className="editor-mode-signout" onClick={handleSignOut}>
        Sair
      </button>
    </div>
  )
}
