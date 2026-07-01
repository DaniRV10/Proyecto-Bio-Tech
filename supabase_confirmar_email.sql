-- =============================================
-- Confirma manualmente el email del conductor
-- (necesario si "Confirm email" estaba activado en
-- Authentication > Providers > Email al registrarse)
-- =============================================

update auth.users
set email_confirmed_at = now()
where email = 'juanitoperezcond@bioruta.local';

-- Verifica:
select email, email_confirmed_at
from auth.users
where email = 'juanitoperezcond@bioruta.local';
