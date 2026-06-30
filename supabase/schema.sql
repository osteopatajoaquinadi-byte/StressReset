-- ================================================================
-- StressReset — tablas en el proyecto Sakros Supabase
-- Prefijo sr_ para separarlo del sistema clínico de Sakros
-- Ejecutar en: supabase.com → proyecto Sakros → SQL Editor
-- ================================================================

-- Perfil de usuario: fenotipo calculado + inicio del programa
create table if not exists sr_profiles (
  id            uuid references auth.users on delete cascade primary key,
  phenotype     text not null check (phenotype in ('A', 'B', 'C')),
  secondary     text check (secondary in ('A', 'B', 'C')),
  is_mixed      boolean default false,
  percentages   jsonb,           -- {A: 58, B: 22, C: 20}
  scores        jsonb,           -- {A: 14, B: 5, C: 5}
  gut_subtype   text check (gut_subtype in ('C1', 'C2')),
  program_start_date date default current_date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Completaciones diarias de tareas
create table if not exists sr_completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  date        date not null,
  task_key    text not null,
  completed_at timestamptz default now(),
  unique (user_id, date, task_key)
);

-- RLS (row-level security)
alter table sr_profiles enable row level security;
alter table sr_completions enable row level security;

-- Cada usuario solo ve y modifica sus propios datos
create policy "sr_profiles: own rows" on sr_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "sr_completions: own rows" on sr_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger para updated_at
create or replace function sr_update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger sr_profiles_updated_at
  before update on sr_profiles
  for each row execute function sr_update_updated_at();
