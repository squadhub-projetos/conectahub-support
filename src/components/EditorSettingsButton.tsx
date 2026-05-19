import { Settings } from 'lucide-react'
import './EditorSettingsButton.css'

interface EditorSettingsButtonProps {
  onClick: () => void
}

export default function EditorSettingsButton({ onClick }: EditorSettingsButtonProps) {
  return (
    <button
      type="button"
      className="fab-settings"
      onClick={onClick}
      aria-label="Configurações de acesso"
      title="Configurações de acesso"
    >
      <Settings size={18} strokeWidth={2} />
    </button>
  )
}
