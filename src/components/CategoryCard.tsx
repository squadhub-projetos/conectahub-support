import type { DbCategory } from '../types/database'
import CategoryIcon from './CategoryIcon'
import './CategoryCard.css'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  contatos: 'Cadastre, importe, filtre, organize e gerencie sua base de contatos.',
  conversas: 'Acompanhe atendimentos, canais, mensagens e rotinas de comunicação.',
  oportunidades: 'Gerencie funis, etapas, negociações, ganhos e perdas comerciais.',
  automacoes: 'Configure gatilhos, ações, condições e fluxos automáticos.',
  calendarios: 'Controle disponibilidade, agendamentos, lembretes e convites.',
  configuracoes: 'Ajuste usuários, permissões, personalizações, integrações e recursos.',
  marketing: 'Crie campanhas, disparos, segmentações e acompanhe métricas de marketing.',
  outros: 'Acesse guias gerais, recursos complementares e conteúdos de apoio.',
}

interface CategoryCardProps {
  category: DbCategory
  onClick: () => void
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const description = CATEGORY_DESCRIPTIONS[category.slug] ?? category.description

  return (
    <button type="button" className="category-card" onClick={onClick}>
      <div className="category-card-top">
        <span className="category-icon">
          <CategoryIcon icon={category.icon} size={20} />
        </span>
        <span className="category-name">{category.name}</span>
      </div>
      {description && (
        <span className="category-desc">{description}</span>
      )}
    </button>
  )
}
