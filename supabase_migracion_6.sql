-- =============================================
-- MIGRACIÓN 6: adaptar tabla canjes para comercios locales
-- (sin UUID externo, con nombre y id local como string)
-- Ejecuta en el SQL Editor de Supabase
-- =============================================

alter table public.canjes
  add column if not exists comercio_nombre text,
  add column if not exists comercio_id_local text;

-- Hacer comercio_id opcional (antes era requerido con FK a comercios)
alter table public.canjes
  alter column comercio_id drop not null;

-- RLS: usuarios ven sus propios canjes
drop policy if exists "Usuario ve sus canjes" on public.canjes;
create policy "Usuario ve sus canjes" on public.canjes
  for select using (auth.uid() = user_id);

drop policy if exists "Usuario crea canjes" on public.canjes;
create policy "Usuario crea canjes" on public.canjes
  for insert with check (auth.uid() = user_id);
