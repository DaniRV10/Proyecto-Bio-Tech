-- =============================================
-- Actualizar coordenadas reales de los Nodos de Acopio
-- Sector Sindempart, Coquimbo
-- Ejecuta esto en el SQL Editor de Supabase
-- =============================================

update public.nodos_acopio set lat = -29.97962033931435, lng = -71.34702265341977 where nombre = 'Nodo Sindempart 1';
update public.nodos_acopio set lat = -29.97893864703753, lng = -71.34082904826285 where nombre = 'Nodo Sindempart 2';
update public.nodos_acopio set lat = -29.98953205968219, lng = -71.33898988818012 where nombre = 'Nodo Sindempart 3';
update public.nodos_acopio set lat = -29.98430885639005, lng = -71.34223843309584 where nombre = 'Nodo Sindempart 4';
update public.nodos_acopio set lat = -29.987895730494117, lng = -71.33182269628766 where nombre = 'Nodo Sindempart 5';

-- Verificar:
select nombre, lat, lng from public.nodos_acopio order by nombre;
