import type { DbGuideWithCategory } from '../types/database'

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

const SUBCATEGORY_ORDER: Subcategory[] = [
  'Primeiros passos',
  'Configuração e ajustes',
  'Rotina operacional',
  'Recursos avançados',
  'Solução de problemas',
]

export function classifyGuide(guide: DbGuideWithCategory): Subcategory {
  const text = [guide.title, guide.excerpt ?? '', ...(guide.tags ?? [])].join(' ')
  for (const { sub, pattern } of SUBCATEGORY_PATTERNS) {
    if (pattern.test(text)) return sub
  }
  return 'Rotina operacional'
}

export interface SubcategoryGroup {
  name: Subcategory
  guides: DbGuideWithCategory[]
}

export const SUPPORT_GROUPS: Array<{ slug: string; label: string }> = [
  { slug: 'primeiros-passos', label: 'Primeiros passos' },
  { slug: 'configuracao-e-ajustes', label: 'Configuração e ajustes' },
  { slug: 'rotina-operacional', label: 'Rotina operacional' },
  { slug: 'recursos-avancados', label: 'Recursos avançados' },
  { slug: 'solucao-de-problemas', label: 'Solução de problemas' },
]

export function groupBySubcategory(guides: DbGuideWithCategory[]): SubcategoryGroup[] {
  const map = new Map<Subcategory, DbGuideWithCategory[]>()
  for (const guide of guides) {
    const sub = classifyGuide(guide)
    if (!map.has(sub)) map.set(sub, [])
    map.get(sub)!.push(guide)
  }
  return SUBCATEGORY_ORDER.filter((sub) => map.has(sub)).map((sub) => ({
    name: sub,
    guides: map.get(sub)!,
  }))
}
