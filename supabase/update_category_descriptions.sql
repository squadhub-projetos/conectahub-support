-- Atualizar descrições das categorias para aparecerem nos cards da home
-- Execute este SQL no Supabase SQL Editor após identificar os slugs corretos das suas categorias

-- Ajuste os slugs conforme existem na sua tabela support_categories
update public.support_categories set description = 'Cadastre, organize e gerencie contatos da sua operação.'
  where name ilike '%contato%';

update public.support_categories set description = 'Aprenda a responder, acompanhar e organizar atendimentos.'
  where name ilike '%conversa%';

update public.support_categories set description = 'Gerencie negociações, etapas do funil e pipeline comercial.'
  where name ilike '%oportunidade%';

update public.support_categories set description = 'Crie fluxos automáticos, gatilhos e ações inteligentes.'
  where name ilike '%automa%';

update public.support_categories set description = 'Configure agendas, horários e agendamentos.'
  where name ilike '%calendário%' or name ilike '%calendario%';

update public.support_categories set description = 'Ajuste usuários, permissões, preferências e integrações.'
  where name ilike '%configuração%' or name ilike '%configuracao%';

update public.support_categories set description = 'Acesse guias complementares, recursos extras e dúvidas gerais.'
  where name ilike '%outro%';

-- Verificar resultado:
select id, name, description from public.support_categories order by order_index;
