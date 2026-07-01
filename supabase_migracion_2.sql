-- =============================================
-- MIGRACIÓN 2: Nodos de Acopio fijos (Sindempart)
-- + permitir eliminar puntos propios pendientes
-- Ejecuta esto en el SQL Editor de Supabase
-- DESPUÉS de supabase_schema.sql
-- =============================================

-- Tabla de NODOS DE ACOPIO (infraestructura fija, no la crean los usuarios)
create table public.nodos_acopio (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  sector text default 'Sindempart',
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  capacidad_kg numeric(6,2) default 50,
  activo boolean default true,
  created_at timestamptz default now()
);

alter table public.nodos_acopio enable row level security;
create policy "Todos ven nodos de acopio" on public.nodos_acopio for select using (activo = true);

-- 5 nodos iniciales en Sindempart, Coquimbo
-- Distribuidos para que ningún hogar esté a más de ~200m de un contenedor
insert into public.nodos_acopio (nombre, sector, lat, lng, capacidad_kg) values
  ('Nodo Sindempart 1', 'Sindempart', -29.97962033931435, -71.34702265341977, 50),
  ('Nodo Sindempart 2', 'Sindempart', -29.97893864703753, -71.34082904826285, 50),
  ('Nodo Sindempart 3', 'Sindempart', -29.98953205968219, -71.33898988818012, 50),
  ('Nodo Sindempart 4', 'Sindempart', -29.98430885639005, -71.34223843309584, 50),
  ('Nodo Sindempart 5', 'Sindempart', -29.98948014356756, -71.33896069747884, 50);

-- Permitir que el usuario elimine sus propios puntos mientras estén pendientes
create policy "Usuario elimina sus puntos pendientes"
  on public.puntos for delete
  using (auth.uid() = user_id and estado = 'pendiente');
