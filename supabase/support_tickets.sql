-- Tabela para tickets de suporte abertos pelos clientes
create table if not exists public.support_tickets (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  company     text,
  subject     text        not null,
  category    text        not null,
  priority    text        not null,
  description text        not null,
  status      text        not null default 'novo',
  created_at  timestamptz not null default now(),

  constraint chk_priority check (priority in ('baixa', 'media', 'alta', 'urgente')),
  constraint chk_status   check (status   in ('novo', 'em_analise', 'em_andamento', 'resolvido', 'fechado'))
);

-- Habilitar RLS
alter table public.support_tickets enable row level security;

-- Qualquer pessoa (anon ou autenticado) pode abrir um ticket
create policy "Qualquer pessoa pode abrir um ticket"
  on public.support_tickets
  for insert
  with check (true);

-- Apenas usuários autenticados podem ler tickets
create policy "Apenas autenticados podem ler tickets"
  on public.support_tickets
  for select
  using (auth.role() = 'authenticated');
