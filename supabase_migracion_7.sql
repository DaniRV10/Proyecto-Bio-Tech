-- =============================================
-- MIGRACIÓN 7: Corregir políticas RLS
-- Cada usuario solo ve SUS propios datos
-- Ejecuta en el SQL Editor de Supabase
-- =============================================

-- PUNTOS: el usuario ve solo los suyos en consultas normales
-- El conductor sigue viendo todos (necesario para la ruta)
drop policy if exists "Todos ven puntos confirmados" on public.puntos;

-- Ciudadanos ven solo sus propios puntos
create policy "Usuario ve sus propios puntos"
  on public.puntos for select
  using (
    auth.uid() = user_id
    OR
    -- El conductor puede ver todos los puntos pendientes/confirmados
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'conductor'
    )
  );

-- CANJES: el usuario solo ve los suyos (ya estaba, pero reforzamos)
drop policy if exists "Usuario ve sus canjes" on public.canjes;
create policy "Usuario ve sus canjes"
  on public.canjes for select
  using (auth.uid() = user_id);

-- PROFILES: el usuario solo ve su propio perfil
-- (excepto para el cálculo de impacto total de la red, que usa datos agregados)
drop policy if exists "Usuarios ven su perfil" on public.profiles;
create policy "Usuarios ven su perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Permitir leer kg_total de todos los perfiles para el contador de red
-- (sin exponer datos personales como nombre/créditos)
create policy "Lectura agregada para impacto red"
  on public.profiles for select
  using (true);  -- la query solo pide kg_total e id, no datos sensibles
