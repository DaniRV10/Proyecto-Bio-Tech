-- =============================================
-- MIGRACIÓN 4: rol de usuario (ciudadano / conductor)
-- Ejecuta esto en el SQL Editor de Supabase
-- DESPUÉS de supabase_migracion_3.sql
-- =============================================

alter table public.profiles
  add column rol text not null default 'ciudadano' check (rol in ('ciudadano','conductor'));

-- Para convertir a un usuario en conductor (hazlo manualmente desde el SQL Editor):
-- update public.profiles set rol = 'conductor' where username_lower = 'nombredeusuario';
