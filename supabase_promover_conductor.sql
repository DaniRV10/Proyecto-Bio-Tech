-- =============================================
-- Convierte a JuanitoPerezCond en CONDUCTOR
-- Ejecuta esto DESPUÉS de haberlo registrado normalmente desde la app
-- (usuario: JuanitoPerezCond, contraseña: BioTech12345)
-- =============================================

update public.profiles
set rol = 'conductor'
where username_lower = 'juanitoperezcond';

-- Verifica que quedó bien:
select username, rol from public.profiles where username_lower = 'juanitoperezcond';
