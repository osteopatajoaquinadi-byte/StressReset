-- Stress Reset — Schema Supabase v2 (con monetización)
-- Ejecutar en el SQL Editor de Supabase. Idempotente.

-- ==========================================================
-- 1. TABLA DE PERFILES
-- ==========================================================
create table if not exists public.sr_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,

  -- Fenotipo (calculado tras el quiz)
  phenotype text check (phenotype in ('A', 'B', 'C')),
  secondary text check (secondary in ('A', 'B', 'C')),
  is_mixed boolean default false,
  percentages jsonb,
  scores jsonb,
  gut_subtype text check (gut_subtype in ('C1', 'C2')),

  -- Programa
  program_start_date date,

  -- Acceso comercial
  access_status text default 'free' check (access_status in ('free', 'paid', 'trial', 'expired', 'revoked')),
  access_expires_at timestamptz,
  purchase_source text,       -- 'hotmart', 'manual', 'gift', 'coupon'
  purchase_ref text,          -- ID de transacción externa
  purchase_amount numeric(10, 2),
  purchase_currency text default 'CLP',
  purchase_date timestamptz,

  -- Auditoría
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.sr_profiles enable row level security;

drop policy if exists "profile_select_own" on public.sr_profiles;
create policy "profile_select_own" on public.sr_profiles
  for select using (auth.uid() = id);

drop policy if exists "profile_upsert_own" on public.sr_profiles;
create policy "profile_upsert_own" on public.sr_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profile_update_own" on public.sr_profiles;
create policy "profile_update_own" on public.sr_profiles
  for update using (auth.uid() = id)
  with check (
    -- El usuario NO puede modificar campos de acceso comercial por sí solo.
    -- Solo el webhook (service role) puede escribir en esas columnas.
    auth.uid() = id
    and access_status is not distinct from (select access_status from public.sr_profiles where id = auth.uid())
    and access_expires_at is not distinct from (select access_expires_at from public.sr_profiles where id = auth.uid())
    and purchase_source is not distinct from (select purchase_source from public.sr_profiles where id = auth.uid())
    and purchase_ref is not distinct from (select purchase_ref from public.sr_profiles where id = auth.uid())
  );

-- ==========================================================
-- 2. TABLA DE COMPLETIONS DIARIAS
-- ==========================================================
create table if not exists public.sr_completions (
  user_id uuid references auth.users on delete cascade,
  date date not null,
  task_key text not null,
  completed_at timestamptz default now(),
  primary key (user_id, date, task_key)
);

alter table public.sr_completions enable row level security;

drop policy if exists "completions_own" on public.sr_completions;
create policy "completions_own" on public.sr_completions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists sr_completions_user_date_idx
  on public.sr_completions (user_id, date desc);

-- ==========================================================
-- 3. TABLA DE SESIONES DE RESPIRACIÓN
-- ==========================================================
create table if not exists public.sr_breathing_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  date date not null,
  pattern text,
  minutes integer,
  completed_at timestamptz default now()
);

alter table public.sr_breathing_log enable row level security;

drop policy if exists "breathing_own" on public.sr_breathing_log;
create policy "breathing_own" on public.sr_breathing_log
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists sr_breathing_user_date_idx
  on public.sr_breathing_log (user_id, date desc);

-- ==========================================================
-- 4. TABLA DE TRANSACCIONES (log de webhooks Hotmart)
-- ==========================================================
create table if not exists public.sr_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  email text not null,

  source text not null,           -- 'hotmart', 'manual', 'gift'
  external_ref text,              -- ID de transacción Hotmart
  event_type text,                -- 'purchase_approved', 'refund', 'chargeback'
  amount numeric(10, 2),
  currency text,
  raw_payload jsonb,              -- Payload completo del webhook

  processed_at timestamptz default now()
);

-- Solo service role escribe/lee esta tabla; sin RLS activa para simplificar
-- (accedida solo desde Edge Function con service_role_key)

create index if not exists sr_purchases_email_idx
  on public.sr_purchases (email);
create index if not exists sr_purchases_user_idx
  on public.sr_purchases (user_id);

-- ==========================================================
-- 5. FUNCIÓN AUXILIAR — helper para chequear acceso vigente
-- ==========================================================
create or replace function public.has_active_access(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sr_profiles
    where id = user_id
    and access_status in ('paid', 'trial')
    and (access_expires_at is null or access_expires_at > now())
  );
$$;

-- ==========================================================
-- 6. TRIGGER — actualizar updated_at automáticamente
-- ==========================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sr_profiles_updated_at on public.sr_profiles;
create trigger sr_profiles_updated_at
  before update on public.sr_profiles
  for each row execute function public.handle_updated_at();

-- ==========================================================
-- MIGRACIÓN v2.1 — Tier de acceso (free / week1 / full)
-- Ejecutar en Supabase SQL Editor. Idempotente.
-- ==========================================================

alter table public.sr_profiles
  add column if not exists access_tier text
  default 'free'
  check (access_tier in ('free', 'week1', 'full'));

update public.sr_profiles set access_tier = 'full'
  where access_status = 'paid' and access_tier = 'free';

update public.sr_profiles set access_tier = 'full'
  where access_status = 'trial' and access_tier = 'free';

-- La política de update debe también proteger access_tier
drop policy if exists "profile_update_own" on public.sr_profiles;
create policy "profile_update_own" on public.sr_profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and access_status is not distinct from (select access_status from public.sr_profiles where id = auth.uid())
    and access_expires_at is not distinct from (select access_expires_at from public.sr_profiles where id = auth.uid())
    and access_tier is not distinct from (select access_tier from public.sr_profiles where id = auth.uid())
    and purchase_source is not distinct from (select purchase_source from public.sr_profiles where id = auth.uid())
    and purchase_ref is not distinct from (select purchase_ref from public.sr_profiles where id = auth.uid())
  );
