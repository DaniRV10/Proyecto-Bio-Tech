-- =============================================
-- ECORUTAS COQUIMBO — Supabase SQL Schema
-- Ejecuta esto en el SQL Editor de Supabase
-- =============================================

-- USUARIOS (extiende auth.users de Supabase)
-- Login por NOMBRE DE USUARIO (no email). Internamente Supabase Auth
-- requiere un "email", así que generamos uno interno a partir del username
-- (username.toLowerCase() + '@bioruta.local'), pero el campo `username`
-- guarda el valor EXACTO que escribió el usuario (respeta mayúsculas/minúsculas
-- para mostrarlo en pantalla).
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  username text unique not null,
  username_lower text unique not null,
  creditos integer default 0,
  kg_total numeric(8,2) default 0,
  entregas integer default 0,
  created_at timestamptz default now()
);

-- RLS para profiles
alter table public.profiles enable row level security;
create policy "Usuarios ven su perfil" on public.profiles for select using (auth.uid() = id);
create policy "Usuarios actualizan su perfil" on public.profiles for update using (auth.uid() = id);
create policy "Insertar perfil propio" on public.profiles for insert with check (auth.uid() = id);

-- Vista de solo-lectura para resolver username -> email interno (para el login)
-- Solo expone lo mínimo necesario, no datos sensibles.
create or replace view public.username_lookup as
  select username_lower, (username_lower || '@bioruta.local') as login_email
  from public.profiles;

grant select on public.username_lookup to anon, authenticated;

-- PUNTOS DE RECOLECCIÓN
create table public.puntos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  direccion text,
  kg_estimado numeric(5,2) not null,
  tipo_residuo text[] default '{}',
  estado text default 'pendiente' check (estado in ('pendiente','confirmado','recogido','cancelado')),
  kg_real numeric(5,2),
  creditos_otorgados integer,
  notas text,
  created_at timestamptz default now(),
  recogido_at timestamptz
);

-- RLS para puntos
alter table public.puntos enable row level security;
create policy "Todos ven puntos confirmados" on public.puntos for select using (true);
create policy "Usuario crea sus puntos" on public.puntos for insert with check (auth.uid() = user_id);
create policy "Usuario edita sus puntos pendientes" on public.puntos for update using (auth.uid() = user_id);

-- COMERCIOS (módulo "Próximamente" en esta versión del prototipo)
create table public.comercios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  categoria text,
  direccion text,
  lat numeric(10,7),
  lng numeric(10,7),
  descuento_porcentaje integer not null,
  creditos_minimos integer not null,
  descripcion text,
  activo boolean default true,
  created_at timestamptz default now()
);

alter table public.comercios enable row level security;
create policy "Todos ven comercios" on public.comercios for select using (activo = true);

-- CANJES
create table public.canjes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  comercio_id uuid references public.comercios(id) not null,
  creditos_usados integer not null,
  codigo_canje text unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  usado boolean default false,
  created_at timestamptz default now(),
  usado_at timestamptz
);

alter table public.canjes enable row level security;
create policy "Usuario ve sus canjes" on public.canjes for select using (auth.uid() = user_id);
create policy "Usuario crea canjes" on public.canjes for insert with check (auth.uid() = user_id);

-- TRIGGER: al crear usuario, crear perfil automáticamente
-- Espera que el signUp incluya en raw_user_meta_data: { nombre, username }
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, username, username_lower)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'username', 'usuario'),
    lower(coalesce(new.raw_user_meta_data->>'username', 'usuario'))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- FUNCIÓN: otorgar créditos al recoger un punto (llamar desde backend/admin)
create or replace function public.confirmar_recojo(
  p_punto_id uuid,
  p_kg_real numeric
)
returns void language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_creditos integer;
begin
  v_creditos := floor(p_kg_real * 20)::integer; -- 20 pts por kg

  update public.puntos
  set estado = 'recogido',
      kg_real = p_kg_real,
      creditos_otorgados = v_creditos,
      recogido_at = now()
  where id = p_punto_id
  returning user_id into v_user_id;

  update public.profiles
  set creditos = creditos + v_creditos,
      kg_total = kg_total + p_kg_real,
      entregas = entregas + 1
  where id = v_user_id;
end;
$$;

-- DATOS DE EJEMPLO: comercios en Coquimbo (se usarán cuando se active el módulo)
insert into public.comercios (nombre, categoria, direccion, lat, lng, descuento_porcentaje, creditos_minimos, descripcion) values
  ('Frutería El Sol', 'frutas', 'Av. Del Mar 120, Coquimbo', -29.9615, -71.3390, 15, 100, 'Frutas y verduras frescas de la región'),
  ('Café Natura', 'cafeteria', 'Balmaceda 330, Coquimbo', -29.9583, -71.3432, 10, 80, 'Café de especialidad y snacks saludables'),
  ('Panadería Trigo', 'panaderia', 'Henríquez 88, Coquimbo', -29.9540, -71.3465, 20, 150, 'Pan artesanal horneado cada mañana'),
  ('Verde Market', 'supermercado', 'Alcalde 210, Coquimbo', -29.9671, -71.3488, 25, 200, 'Productos orgánicos y naturales'),
  ('Restobar La Barca', 'restaurante', 'Costanera 590, Coquimbo', -29.9530, -71.3412, 15, 100, 'Cocina local frente al mar');
