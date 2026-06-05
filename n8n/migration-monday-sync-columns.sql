-- Adiciona colunas de sincronização Monday ao support_tickets
-- Execute no Supabase SQL Editor (ou via migration)

alter table public.support_tickets
  add column if not exists monday_item_id       text,
  add column if not exists monday_sync_status   text default 'pending',
  add column if not exists monday_sync_error    text,
  add column if not exists monday_synced_at     timestamptz;

-- Índice para facilitar consulta por status de sync
create index if not exists idx_support_tickets_monday_sync_status
  on public.support_tickets (monday_sync_status);

-- Garante que status tem valor padrão para tickets novos
alter table public.support_tickets
  alter column monday_sync_status set default 'pending';

-- Coluna status (se não existir) — necessária para o flow n8n e o campo status='novo'
alter table public.support_tickets
  add column if not exists status text default 'novo';

comment on column public.support_tickets.monday_item_id     is 'ID do item criado na Monday.com';
comment on column public.support_tickets.monday_sync_status is 'pending | synced | error';
comment on column public.support_tickets.monday_sync_error  is 'Mensagem de erro da última tentativa de sync';
comment on column public.support_tickets.monday_synced_at   is 'Timestamp da última sincronização bem-sucedida';
