export interface SupportGroup {
  slug: string
  label: string
}

export const GROUPS_BY_CATEGORY: Record<string, SupportGroup[]> = {
  contatos: [
    { slug: 'primeiros-passos', label: 'Primeiros passos' },
    { slug: 'cadastro-e-edicao', label: 'Cadastro e edição' },
    { slug: 'importacao-e-exportacao', label: 'Importação e exportação' },
    { slug: 'listas-filtros-smart-lists', label: 'Listas, filtros e Smart Lists' },
    { slug: 'tags-e-segmentacao', label: 'Tags e segmentação' },
    { slug: 'problemas-comuns', label: 'Problemas comuns' },
  ],
  conversas: [
    { slug: 'visao-geral-caixa-entrada', label: 'Visão geral da caixa de entrada' },
    { slug: 'whatsapp', label: 'WhatsApp' },
    { slug: 'sms-e-telefone', label: 'SMS e telefone' },
    { slug: 'email', label: 'E-mail' },
    { slug: 'atribuicao-e-atendimento', label: 'Atribuição e atendimento' },
    { slug: 'disparos-e-modelos', label: 'Disparos e modelos' },
    { slug: 'problemas-comuns', label: 'Problemas comuns' },
  ],
  oportunidades: [
    { slug: 'primeiros-passos-no-funil', label: 'Primeiros passos no funil' },
    { slug: 'etapas-e-movimentacao', label: 'Etapas e movimentação' },
    { slug: 'valores-responsaveis-filtros', label: 'Valores, responsáveis e filtros' },
    { slug: 'ganho-perdido-e-motivos', label: 'Ganho, perdido e motivos' },
    { slug: 'relatorios-de-pipeline', label: 'Relatórios de pipeline' },
    { slug: 'problemas-comuns', label: 'Problemas comuns' },
  ],
  automacoes: [
    { slug: 'gatilhos', label: 'Gatilhos' },
    { slug: 'acoes', label: 'Ações' },
    { slug: 'condicoes-e-ramificacoes', label: 'Condições e ramificações' },
    { slug: 'esperas-timeouts-agendamentos', label: 'Esperas, timeouts e agendamentos' },
    { slug: 'exemplos-praticos', label: 'Exemplos práticos' },
    { slug: 'diagnostico-e-testes', label: 'Diagnóstico e testes' },
  ],
  calendarios: [
    { slug: 'tipos-de-calendario', label: 'Tipos de calendário' },
    { slug: 'disponibilidade-e-horarios', label: 'Disponibilidade e horários' },
    { slug: 'agendamentos-e-atribuicao', label: 'Agendamentos e atribuição' },
    { slug: 'convites-links-lembretes', label: 'Convites, links e lembretes' },
    { slug: 'integracoes-e-bloqueios', label: 'Integrações e bloqueios' },
    { slug: 'problemas-comuns', label: 'Problemas comuns' },
  ],
  configuracoes: [
    { slug: 'usuarios-e-permissoes', label: 'Usuários e permissões' },
    { slug: 'preferencias-e-personalizacao', label: 'Preferências e personalização' },
    { slug: 'campos-personalizados-e-objetos', label: 'Campos personalizados e objetos' },
    { slug: 'funis-etapas-e-calendarios', label: 'Funis, etapas e calendários' },
    { slug: 'integracoes-e-canais', label: 'Integrações e canais' },
    { slug: 'seguranca-e-cobranca', label: 'Segurança e cobrança' },
  ],
  marketing: [
    { slug: 'campanhas-e-disparos', label: 'Campanhas e disparos' },
    { slug: 'email-marketing', label: 'E-mail marketing' },
    { slug: 'sms-whatsapp-multicanal', label: 'SMS, WhatsApp e multicanal' },
    { slug: 'templates-e-conteudo', label: 'Templates e conteúdo' },
    { slug: 'segmentacao-e-smart-lists', label: 'Segmentação e Smart Lists' },
    { slug: 'performance-e-metricas', label: 'Performance e métricas' },
    { slug: 'problemas-comuns', label: 'Problemas comuns' },
  ],
  outros: [
    { slug: 'primeiros-passos', label: 'Primeiros passos' },
    { slug: 'glossario-e-conceitos', label: 'Glossário e conceitos' },
    { slug: 'boas-praticas', label: 'Boas práticas' },
    { slug: 'duvidas-frequentes', label: 'Dúvidas frequentes' },
    { slug: 'solicitacoes-e-suporte', label: 'Solicitações e suporte' },
  ],
}

export const DEFAULT_GROUPS: SupportGroup[] = [
  { slug: 'primeiros-passos', label: 'Primeiros passos' },
  { slug: 'rotina-operacional', label: 'Rotina operacional' },
  { slug: 'recursos-avancados', label: 'Recursos avançados' },
  { slug: 'solucao-de-problemas', label: 'Solução de problemas' },
]

export function getGroupsByCategory(slug: string | null | undefined): SupportGroup[] {
  if (!slug) return DEFAULT_GROUPS
  return GROUPS_BY_CATEGORY[slug] ?? DEFAULT_GROUPS
}
