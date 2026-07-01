-- =============================================
-- LIMPIEZA: elimina el usuario conductor creado por SQL (si falló el login)
-- Ejecuta esto ANTES de registrar la cuenta desde la app
-- (usuario: JuanitoPerezCond)
-- =============================================

delete from public.profiles where username_lower = 'juanitoperezcond';
delete from auth.users where email = 'juanitoperezcond@bioruta.local';
