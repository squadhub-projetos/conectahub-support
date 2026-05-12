import { Plus } from 'lucide-react'
import './FloatingCreateGuideButton.css'

interface FloatingCreateGuideButtonProps {
  onClick: () => void
}

export default function FloatingCreateGuideButton({ onClick }: FloatingCreateGuideButtonProps) {
  return (
    <button type="button" className="fab-create" onClick={onClick} aria-label="Criar novo guia">
      <Plus size={20} strokeWidth={2.5} />
      <span>Novo guia</span>
    </button>
  )
}
