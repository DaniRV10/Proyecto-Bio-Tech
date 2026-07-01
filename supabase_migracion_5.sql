-- =============================================
-- MIGRACIÓN 5: crear cuenta fija del conductor
-- Usuario: JuanitoPerezConductor
-- Contraseña: BioTech12345
-- Ejecuta esto en el SQL Editor de Supabase
-- DESPUÉS de supabase_migracion_4.sql
-- =============================================

-- Necesario para encriptar la contraseña
create extension if not exists pgcrypto;

-- Crea el usuario directamente en auth.users (sin pasar por el formulario de registro)
-- Email interno: juanitoperezconductor@bioruta.local (igual lógica que el resto de usuarios)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'juanitoperezconductor@bioruta.local',
  crypt('BioTech12345', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Juanito Perez","username":"JuanitoPerezConductor"}',
  now(), now(), '', ''
);

-- El trigger on_auth_user_created ya crea el perfil automáticamente.
-- Ahora le asignamos el rol de conductor:
update public.profiles
set rol = 'conductor'
where username_lower = 'juanitoperezconductor';
