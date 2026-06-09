-- ============================================================
--  FUNERARIA ADMIN — Schema SQL para Supabase
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Registros de fallecidos
create table if not exists deceased_records (
  id                    text primary key,
  full_name             text not null,
  rut                   text,
  birth_date            text,
  nationality           text default 'Chilena',
  death_date            text not null,
  death_time            text,
  death_place           text,
  death_cause           text,
  service_type          text not null default 'servicio_completo',
  status                text not null default 'recepcion',
  velatorio             text,
  velatorio_address     text,
  cemetery              text,
  cemetery_address      text,
  crematorium           text,
  crematorium_address   text,
  religious_preference  text default 'ninguna',
  religious_notes       text,
  urgencies             text,
  restrictions          text,
  sensitive_observations text,
  assigned_staff        text,
  family_contact        jsonb default '{}'::jsonb,
  documents             jsonb default '[]'::jsonb,
  budgets               jsonb default '[]'::jsonb,
  payments              jsonb default '[]'::jsonb,
  tasks                 jsonb default '[]'::jsonb,
  created_at            text,
  updated_at            text
);

-- 2. Servicios del calendario
create table if not exists funeral_services (
  id            text primary key,
  deceased_id   text,
  deceased_name text,
  service_type  text,
  start_date    text,
  end_date      text,
  location      text,
  notes         text,
  status        text default 'programado',
  color         text
);

-- 3. Usuarios / personal
create table if not exists staff_users (
  id         text primary key,
  full_name  text not null,
  email      text unique,
  phone      text,
  role       text,
  sucursal   text,
  active     boolean default true,
  created_at text
);

-- 4. Convenios
create table if not exists convenios (
  id            text primary key,
  name          text not null,
  entity        text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  discount_pct  numeric default 0,
  description   text,
  start_date    text,
  end_date      text,
  active        boolean default true
);

-- 5. Catálogo de servicios (categorías con ítems embebidos como JSONB)
create table if not exists catalog_categories (
  id          text primary key,
  name        text not null,
  items       jsonb default '[]'::jsonb,
  order_index integer default 0
);

-- ============================================================
--  ROW LEVEL SECURITY — acceso público (sin login por ahora)
--  Cuando agregues autenticación, restringe estas políticas.
-- ============================================================

alter table deceased_records    enable row level security;
alter table funeral_services    enable row level security;
alter table staff_users         enable row level security;
alter table convenios           enable row level security;
alter table catalog_categories  enable row level security;

create policy "public_all" on deceased_records   for all using (true) with check (true);
create policy "public_all" on funeral_services   for all using (true) with check (true);
create policy "public_all" on staff_users        for all using (true) with check (true);
create policy "public_all" on convenios          for all using (true) with check (true);
create policy "public_all" on catalog_categories for all using (true) with check (true);
