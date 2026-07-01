-- =============================================
-- DIAGNÓSTICO: revisa si hay cuentas duplicadas o rotas
-- para juanitoperezcond
-- =============================================

-- 1. ¿Cuántas filas hay en auth.users con ese email?
select id, email, encrypted_password is not null as tiene_password,
       email_confirmed_at, created_at
from auth.users
where email = 'juanitoperezcond@bioruta.local';

-- 2. ¿Cuántas filas hay en profiles con ese username?
select id, username, username_lower, rol, created_at
from public.profiles
where username_lower = 'juanitoperezcond';
