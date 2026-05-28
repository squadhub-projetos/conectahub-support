import { X, Trash2 } from 'lucide-react'
import type { DbGuideWithCategory } from '../types/database'
import './DeleteGuideModal.css'

interface DeleteGuideModalProps {
  guide: DbGuideWithCategory
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteGuideModal({ guide, deleting, onCancel, onConfirm }: DeleteGuideModalProps) {
  return (
    <div className="dgm-backdrop" onClick={onCancel}>
      <div className="dgm-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dgm-close" onClick={onCancel} aria-label="Fechar" disabled={deleting}>
          <X size={18} />
        </button>

        <div className="dgm-icon-wrap">
          <Trash2 size={28} strokeWidth={1.5} />
        </div>

        <h2 className="dgm-title">Excluir guia</h2>
        <p className="dgm-guide-name">"{guide.title}"</p>
        <p className="dgm-warning">
          Essa ação não pode ser desfeita. O guia será removido permanentemente, incluindo todas as associações de acesso de clientes.
        </p>

        <div className="dgm-actions">
          <button type="button" className="dgm-btn dgm-btn--confirm" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Excluindo…' : 'Sim, excluir'}
          </button>
          <button type="button" className="dgm-btn dgm-btn--cancel" onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
