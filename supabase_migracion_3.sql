-- =============================================
-- MIGRACIÓN 3: vincular puntos a un nodo de acopio
-- Ejecuta esto en el SQL Editor de Supabase
-- DESPUÉS de supabase_migracion_2.sql
-- =============================================

alter table public.puntos
  add column nodo_acopio_id uuid references public.nodos_acopio(id);
