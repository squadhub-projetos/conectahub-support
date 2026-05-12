-- Tabela para solicitações de novos tutoriais enviadas pelos usuários
create table if not exists public.support_requests (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  topic       text        not null,
  description text,
  status      text        not null default 'novo',
  created_at  timestamptz not null default now()
);

-- Habilitar RLS
alter table public.support_requests enable row level security;

-- Qualquer pessoa pode inserir (formulário público)
create policy "Qualquer pessoa pode enviar uma solicitação"
  on public.support_requests
  for insert
  with check (true);

-- Apenas usuários autenticados podem ler
create policy "Apenas autenticados podem ler solicitações"
  on public.support_requests
  for select
  using (auth.role() = 'authenticated');
