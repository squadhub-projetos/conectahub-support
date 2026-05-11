import type { Guide } from '../types/guide'

export const mockGuides: Guide[] = [
  {
    id: '1',
    slug: 'como-criar-novo-contato',
    title: 'Como criar um novo contato',
    description: 'Aprenda a adicionar contatos manualmente na plataforma, preenchendo as informações essenciais.',
    category: 'Contatos',
    tags: ['contato', 'criar', 'básico'],
    readTime: 3,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-01',
    content: `## Como criar um novo contato

Para adicionar um novo contato na plataforma, siga os passos abaixo.

### Passo 1: Acessar a seção de Contatos

Navegue até o menu lateral e clique em **Contatos**.

### Passo 2: Clicar em "Novo Contato"

No canto superior direito da tela, clique no botão **+ Novo Contato**.

### Passo 3: Preencher os dados

Preencha os campos obrigatórios:
- Nome completo
- E-mail ou telefone
- Fonte do contato
- Tags (opcional)

> **Observação:** O campo de e-mail ou telefone é obrigatório. Sem ao menos um deles, o contato não poderá ser salvo.

### Passo 4: Salvar

Clique em **Salvar contato** para finalizar o cadastro. O contato aparecerá imediatamente na lista.`,
  },
  {
    id: '2',
    slug: 'como-importar-contatos',
    title: 'Como importar contatos em massa',
    description: 'Importe uma lista de contatos usando arquivo CSV ou planilha Excel com mapeamento de colunas.',
    category: 'Contatos',
    tags: ['contato', 'importar', 'csv', 'planilha'],
    readTime: 5,
    hasVideo: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'published',
    updatedAt: '2026-05-02',
    content: `## Como importar contatos em massa

A importação em massa é ideal para quando você precisa adicionar muitos contatos de uma só vez a partir de uma planilha.

### Formatos suportados

- **CSV** (separado por vírgulas)
- **Excel** (.xlsx)

### Passo a passo

1. Acesse **Contatos > Importar**
2. Faça o download do modelo de planilha clicando em **Baixar modelo**
3. Preencha os dados no modelo sem alterar os cabeçalhos
4. Salve o arquivo e envie na plataforma
5. Mapeie as colunas para os campos corretos
6. Confirme a importação e aguarde o processamento

### Tratamento de duplicatas

> **Atenção:** Contatos com o mesmo e-mail ou telefone serão identificados automaticamente. Você poderá escolher entre **mesclar** os dados ou **ignorar** o duplicado.

### Limites

- Até **5.000 contatos** por importação
- Arquivos de até **10 MB**`,
  },
  {
    id: '3',
    slug: 'como-responder-conversas-whatsapp',
    title: 'Como responder conversas no WhatsApp',
    description: 'Veja como acessar, visualizar e responder mensagens de WhatsApp diretamente pela plataforma.',
    category: 'Conversas',
    tags: ['whatsapp', 'conversa', 'responder', 'mensagem'],
    readTime: 4,
    hasVideo: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'published',
    updatedAt: '2026-05-03',
    content: `## Como responder conversas no WhatsApp

Todas as mensagens recebidas pelo WhatsApp conectado chegam automaticamente à seção **Conversas** da plataforma.

### Acessando as conversas

1. No menu lateral, clique em **Conversas**
2. As conversas não lidas aparecem em destaque no topo
3. Clique em uma conversa para abri-la

### Respondendo uma mensagem

1. Com a conversa aberta, clique no campo de texto na parte inferior
2. Digite sua mensagem
3. Pressione **Enter** ou clique no botão de envio

### Usando respostas rápidas

> **Dica:** Use o atalho "/" (barra) para acessar respostas rápidas pré-cadastradas e agilizar o atendimento.

### Tipos de conteúdo que podem ser enviados

- Texto simples
- Imagens e documentos
- Áudio
- Emojis e stickers`,
  },
  {
    id: '4',
    slug: 'como-transferir-conversa',
    title: 'Como transferir uma conversa para outro atendente',
    description: 'Transfira atendimentos em andamento para outros membros da equipe de forma rápida.',
    category: 'Conversas',
    tags: ['conversa', 'transferir', 'atendente', 'equipe'],
    readTime: 3,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-03',
    content: `## Como transferir uma conversa

Transferir uma conversa é útil quando o atendente atual não é o mais indicado para resolver aquele caso.

### Passo a passo

1. Abra a conversa que deseja transferir
2. Clique no ícone de **opções** (três pontos) no canto superior direito
3. Selecione **Transferir conversa**
4. Escolha o atendente ou a equipe de destino
5. Adicione uma nota interna explicando o contexto (opcional, mas recomendado)
6. Clique em **Confirmar transferência**

### O que acontece após a transferência

- O novo atendente recebe uma notificação
- O histórico completo da conversa é mantido
- A nota interna fica visível apenas para a equipe

> **Observação:** Apenas atendentes com status **Disponível** aparecem na lista de transferência.`,
  },
  {
    id: '5',
    slug: 'como-criar-oportunidade',
    title: 'Como criar uma oportunidade',
    description: 'Registre novas oportunidades de negócio no pipeline e acompanhe o progresso de cada uma.',
    category: 'Oportunidades',
    tags: ['oportunidade', 'pipeline', 'criar', 'crm'],
    readTime: 4,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-04',
    content: `## Como criar uma oportunidade

As oportunidades representam negociações em andamento dentro do seu pipeline de vendas.

### Criando a partir do pipeline

1. Acesse **Oportunidades** no menu lateral
2. Escolha o pipeline desejado
3. Clique em **+ Nova oportunidade** na etapa inicial
4. Preencha os dados:
   - Nome da oportunidade
   - Valor estimado
   - Contato associado
   - Data prevista de fechamento
5. Clique em **Salvar**

### Criando a partir de um contato

Também é possível criar uma oportunidade diretamente a partir da ficha de um contato:

1. Abra o contato desejado
2. Clique na aba **Oportunidades**
3. Clique em **+ Nova oportunidade**

> **Dica:** Vincule sempre um contato à oportunidade para manter o histórico de negociação centralizado.`,
  },
  {
    id: '6',
    slug: 'como-mover-oportunidade-etapa',
    title: 'Como mover uma oportunidade de etapa no pipeline',
    description: 'Aprenda a avançar ou retroceder oportunidades entre as etapas do seu funil de vendas.',
    category: 'Oportunidades',
    tags: ['oportunidade', 'pipeline', 'etapa', 'funil'],
    readTime: 3,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-04',
    content: `## Como mover uma oportunidade de etapa

Manter o pipeline atualizado é essencial para ter uma visão clara do seu processo de vendas.

### Arrastar e soltar (drag and drop)

1. Acesse **Oportunidades** e abra o pipeline no modo **Kanban**
2. Localize o card da oportunidade
3. Clique e arraste o card para a etapa desejada
4. Solte o card na nova coluna

### Pelo menu de detalhes

1. Abra a oportunidade clicando no card
2. No campo **Etapa atual**, clique no dropdown
3. Selecione a nova etapa
4. As mudanças são salvas automaticamente

### Registrando o motivo da mudança

> **Boas práticas:** Ao mover uma oportunidade, adicione uma nota explicando o motivo. Isso ajuda no histórico e no acompanhamento gerencial.`,
  },
  {
    id: '7',
    slug: 'como-criar-automacao-simples',
    title: 'Como criar uma automação simples',
    description: 'Crie fluxos automáticos para executar ações com base em gatilhos definidos por você.',
    category: 'Automações',
    tags: ['automação', 'fluxo', 'gatilho', 'criar'],
    readTime: 6,
    hasVideo: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'published',
    updatedAt: '2026-05-05',
    content: `## Como criar uma automação simples

Automações permitem que ações sejam executadas automaticamente com base em eventos, eliminando tarefas repetitivas.

### Conceitos básicos

- **Gatilho:** O evento que inicia a automação (ex: novo contato criado, tag adicionada)
- **Condição:** Filtros opcionais para refinar quando a automação deve agir
- **Ação:** O que será executado (ex: enviar mensagem, adicionar tag, criar oportunidade)

### Criando sua primeira automação

1. Acesse **Automações** no menu lateral
2. Clique em **+ Nova automação**
3. Dê um nome descritivo para identificá-la facilmente
4. Escolha o **Gatilho** de início
5. Adicione **Condições** se necessário (opcional)
6. Adicione uma ou mais **Ações**
7. Clique em **Salvar e ativar**

### Exemplo prático

> **Exemplo:** Quando um novo contato é criado com a tag "Lead Site", enviar automaticamente uma mensagem de boas-vindas via WhatsApp.

### Testando antes de ativar

Sempre use o modo **Rascunho** para testar a automação antes de ativá-la para toda a base de contatos.`,
  },
  {
    id: '8',
    slug: 'como-pausar-automacao',
    title: 'Como pausar ou desativar uma automação',
    description: 'Aprenda a pausar temporariamente ou desativar permanentemente um fluxo de automação.',
    category: 'Automações',
    tags: ['automação', 'pausar', 'desativar'],
    readTime: 2,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-05',
    content: `## Como pausar ou desativar uma automação

Às vezes é necessário interromper uma automação sem excluí-la, seja para manutenção ou ajustes.

### Pausando uma automação

1. Acesse **Automações**
2. Localize a automação desejada na lista
3. Clique no toggle de status ao lado do nome
4. O status mudará de **Ativa** para **Pausada**

Enquanto pausada, nenhum novo contato entrará no fluxo, mas os contatos que já estão no meio do fluxo continuarão sendo processados.

### Desativando completamente

1. Abra a automação
2. Clique em **Configurações**
3. Selecione **Desativar automação**
4. Confirme a ação

> **Atenção:** Ao desativar, os contatos em andamento no fluxo também serão interrompidos. Use a opção **Pausar** se quiser preservar o andamento atual.`,
  },
  {
    id: '9',
    slug: 'como-criar-calendario',
    title: 'Como criar um calendário de agendamentos',
    description: 'Configure um calendário para receber agendamentos de clientes com horários disponíveis.',
    category: 'Calendários',
    tags: ['calendário', 'agendamento', 'criar', 'horários'],
    readTime: 5,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-06',
    content: `## Como criar um calendário de agendamentos

Calendários permitem que seus clientes agendem horários diretamente, sem precisar de troca de mensagens.

### Criando o calendário

1. Acesse **Calendários** no menu lateral
2. Clique em **+ Novo calendário**
3. Preencha as informações:
   - Nome do calendário (ex: "Consulta Inicial")
   - Descrição
   - Duração padrão de cada agendamento
   - Intervalo entre agendamentos

### Configurando os horários de disponibilidade

1. Na seção **Disponibilidade**, escolha os dias da semana ativos
2. Defina o horário de início e fim para cada dia
3. Configure o fuso horário correto

### Link de agendamento

Após salvar, o sistema gera um **link público** que pode ser compartilhado com clientes ou incorporado em uma página.

> **Dica:** Personalize a confirmação de agendamento com o nome do seu negócio e instruções adicionais.`,
  },
  {
    id: '10',
    slug: 'como-bloquear-horarios-agenda',
    title: 'Como bloquear horários na agenda',
    description: 'Bloqueie períodos específicos para evitar agendamentos em datas ou horários indisponíveis.',
    category: 'Calendários',
    tags: ['calendário', 'bloquear', 'horário', 'disponibilidade'],
    readTime: 3,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-06',
    content: `## Como bloquear horários na agenda

O bloqueio de horários impede que novos agendamentos sejam feitos em períodos específicos, como feriados ou compromissos pessoais.

### Bloqueio pontual

1. Acesse **Calendários** e abra o calendário desejado
2. Na visualização de calendário, clique sobre o horário que deseja bloquear
3. Selecione **Bloquear horário**
4. Defina o título do bloqueio (ex: "Reunião interna") — visível apenas para você
5. Escolha a duração
6. Salve

### Bloqueio recorrente

Para bloquear horários que se repetem toda semana:

1. Ao criar o bloqueio, ative a opção **Repetir**
2. Selecione a frequência (semanal, mensal)
3. Defina a data de término da recorrência

> **Observação:** Agendamentos já confirmados antes do bloqueio **não** são cancelados automaticamente. Você precisará reagendá-los manualmente se necessário.`,
  },
  {
    id: '11',
    slug: 'como-configurar-usuarios',
    title: 'Como configurar usuários na plataforma',
    description: 'Adicione membros da equipe, defina funções e gerencie o acesso de cada usuário.',
    category: 'Configurações',
    tags: ['usuários', 'equipe', 'configuração', 'acesso'],
    readTime: 4,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-07',
    content: `## Como configurar usuários na plataforma

Gerencie quem tem acesso à plataforma e quais áreas cada membro pode visualizar ou editar.

### Adicionando um novo usuário

1. Acesse **Configurações > Usuários**
2. Clique em **+ Convidar usuário**
3. Informe o e-mail do membro da equipe
4. Selecione a **função** (Admin, Atendente, Supervisor...)
5. Clique em **Enviar convite**

O usuário receberá um e-mail com o link de acesso.

### Funções disponíveis

- **Admin:** Acesso completo a todas as configurações
- **Supervisor:** Pode visualizar relatórios e gerenciar atendentes
- **Atendente:** Acesso às conversas e contatos atribuídos a ele

### Editando um usuário existente

1. Clique no nome do usuário na lista
2. Altere a função ou as permissões
3. Clique em **Salvar**

> **Atenção:** Apenas Admins podem adicionar ou remover outros usuários.`,
  },
  {
    id: '12',
    slug: 'como-alterar-permissoes',
    title: 'Como alterar permissões de usuários',
    description: 'Controle quais seções e funcionalidades cada usuário pode acessar ou modificar.',
    category: 'Configurações',
    tags: ['permissões', 'usuários', 'acesso', 'segurança'],
    readTime: 4,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-07',
    content: `## Como alterar permissões de usuários

O controle de permissões garante que cada membro da equipe acesse apenas o que é necessário para sua função.

### Acessando as permissões

1. Vá em **Configurações > Usuários**
2. Clique no usuário desejado
3. Selecione a aba **Permissões**

### Permissões por módulo

Você pode ativar ou desativar o acesso a cada módulo individualmente:
- Contatos: visualizar, criar, editar, excluir
- Conversas: visualizar, responder, transferir
- Oportunidades: visualizar, criar, editar
- Automações: visualizar, criar, ativar/pausar
- Relatórios: visualizar

### Aplicando as alterações

1. Marque ou desmarque as permissões desejadas
2. Clique em **Salvar permissões**
3. As alterações têm efeito imediato

> **Dica:** Use perfis pré-configurados para agilizar a configuração de novos membros com funções semelhantes.`,
  },
  {
    id: '13',
    slug: 'como-usar-central-suporte',
    title: 'Como usar a central de suporte',
    description: 'Guia rápido sobre como navegar, buscar e aproveitar ao máximo os materiais desta central.',
    category: 'Outros',
    tags: ['central', 'suporte', 'navegação', 'ajuda'],
    readTime: 2,
    hasVideo: false,
    status: 'published',
    updatedAt: '2026-05-08',
    content: `## Como usar a central de suporte

Esta central reúne guias, tutoriais e materiais de apoio para ajudar você a usar a plataforma com mais eficiência.

### Navegando pelos guias

Use os **cards de categoria** na página inicial para filtrar os guias por área. Clique em qualquer categoria para ver apenas os guias relacionados.

### Buscando um assunto

Use o campo de busca no topo da página para encontrar guias por:
- Título
- Palavras-chave
- Tags

### Estrutura de cada guia

Cada guia contém:
- Título e descrição
- Tempo estimado de leitura
- Indicação se possui vídeo
- Conteúdo passo a passo

> **Dica:** Se não encontrar o que precisa, entre em contato com o suporte pelo chat ou e-mail.`,
  },
]
