import type { DbGuideWithCategory } from '../types/database'
import { getGroupsByCategory } from '../data/supportGroups'

export type Subcategory =
  | 'Primeiros passos'
  | 'Configuração e ajustes'
  | 'Rotina operacional'
  | 'Recursos avançados'
  | 'Solução de problemas'

const SUBCATEGORY_PATTERNS: Array<{ sub: Subcategory; pattern: RegExp }> = [
  {
    sub: 'Primeiros passos',
    pattern:
      /\b(criar|primeiro|nova?|come[çc]ar|in[íi]cio|introdução|setup|instala[çc]|ativar|cadastrar|bem.?vindo|onboarding|getting.?started|primeiros.?passos)\b/i,
  },
  {
    sub: 'Solução de problemas',
    pattern:
      /\b(erro|problema|falha|bug|n[ãa]o funciona|solucionar|resolver|troubleshoot|corrigir|fix|debug|suporte|dificuldade|ajuda)\b/i,
  },
  {
    sub: 'Recursos avançados',
    pattern:
      /\b(avan[çc]ado|integra[çc]|api|webhook|automa[çc]|workflow|pipeline|gatilho|script|personalizar|customizar|avan[çc]ada|métricas|relatório)\b/i,
  },
  {
    sub: 'Configuração e ajustes',
    pattern:
      /\b(configurar|configura[çc]|ajuste|ajustar|definir|defini[çc]|op[çc][õo]es|prefer[êe]ncias|settings|permiss[ãa]o|usu[áa]rio|perfil|acesso)\b/i,
  },
  {
    sub: 'Rotina operacional',
    pattern:
      /\b(responder|mover|importar|bloquear|usar|enviar|abrir|fechar|ger[ae]nciar|acompanhar|visualizar|atender|registrar|atualizar)\b/i,
  },
]

export function classifyGuide(guide: DbGuideWithCategory): string {
  const text = [guide.title, guide.excerpt ?? '', ...(guide.tags ?? [])].join(' ')
  for (const { sub, pattern } of SUBCATEGORY_PATTERNS) {
    if (pattern.test(text)) return sub
  }
  return 'Outros guias'
}

export interface SubcategoryGroup {
  name: string
  guides: DbGuideWithCategory[]
}

// Kept for backward compatibility — prefer getGroupsByCategory() from data/supportGroups
export const SUPPORT_GROUPS: Array<{ slug: string; label: string }> = [
  { slug: 'primeiros-passos', label: 'Primeiros passos' },
  { slug: 'configuracao-e-ajustes', label: 'Configuração e ajustes' },
  { slug: 'rotina-operacional', label: 'Rotina operacional' },
  { slug: 'recursos-avancados', label: 'Recursos avançados' },
  { slug: 'solucao-de-problemas', label: 'Solução de problemas' },
]

export function groupBySubcategory(
  guides: DbGuideWithCategory[],
  categorySlug?: string
): SubcategoryGroup[] {
  const categoryGroups = getGroupsByCategory(categorySlug)
  const map = new Map<string, DbGuideWithCategory[]>()

  for (const guide of guides) {
    const label =
      (guide.metadata?.support_group_label as string | undefined) ||
      (guide.metadata?.support_group as string | undefined) ||
      'Outros guias'
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(guide)
  }

  // Sort guides within each group: order_index asc (null last), then title asc
  for (const gs of map.values()) {
    gs.sort((a, b) => {
      const ai = a.order_index ?? Infinity
      const bi = b.order_index ?? Infinity
      if (ai !== bi) return ai - bi
      return a.title.localeCompare(b.title, 'pt-BR')
    })
  }

  const result: SubcategoryGroup[] = []
  const seen = new Set<string>()

  // Add groups in category-defined order first
  for (const group of categoryGroups) {
    if (map.has(group.label)) {
      result.push({ name: group.label, guides: map.get(group.label)! })
      seen.add(group.label)
    }
    // Fallback: old data may have stored slug as the label
    if (!seen.has(group.slug) && map.has(group.slug)) {
      result.push({ name: group.label, guides: map.get(group.slug)! })
      seen.add(group.slug)
    }
  }

  // Any remaining groups not covered by the category order
  for (const [name, gs] of map) {
    if (!seen.has(name)) {
      result.push({ name, guides: gs })
    }
  }

  return result
}
