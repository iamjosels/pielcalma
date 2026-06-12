-- ============================================================
-- PielCalma — esquema Supabase
-- Pégalo en Supabase → SQL Editor → Run.
-- Modelo: auth anónima (cada dispositivo = un usuario). RLS por auth.uid().
-- Antes de usar: Authentication → Providers → habilita "Anonymous sign-ins".
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  user_id         uuid not null default auth.uid(),
  id              text not null,
  caregiver_name  text,
  child_name      text,
  child_age       int,
  condition_label text,
  created_at      bigint,
  primary key (user_id, id)
);

-- ---------- flare_logs ----------
create table if not exists public.flare_logs (
  user_id           uuid not null default auth.uid(),
  id                text not null,
  profile_id        text,
  date              date,
  itch_level        int,
  sleep_quality     text,
  routine_status    text,
  caregiver_emotion text,
  areas             jsonb default '[]'::jsonb,
  triggers          jsonb default '[]'::jsonb,
  notes             text,
  created_at        bigint,
  primary key (user_id, id)
);

-- ---------- observations ----------
create table if not exists public.observations (
  user_id              uuid not null default auth.uid(),
  id                   text not null,
  profile_id           text,
  date                 date,
  image_name           text,
  redness              real,
  brightness           real,
  thumb                text,
  observacion_visual   text,
  comparacion_anterior text,
  indice_visual_cambio text,
  limitaciones         text,
  created_at           bigint,
  primary key (user_id, id)
);

-- ---------- calma_events ----------
create table if not exists public.calma_events (
  user_id    uuid not null default auth.uid(),
  id         text not null,
  profile_id text,
  emotion    text,
  date       date,
  created_at bigint,
  primary key (user_id, id)
);

-- ---------- hábitos (re-ejecutable: añade columnas si faltan) ----------
alter table public.flare_logs add column if not exists nutrition         text;
alter table public.flare_logs add column if not exists physical_activity text;
alter table public.flare_logs add column if not exists stress            text;

-- ---------- RLS ----------
alter table public.profiles      enable row level security;
alter table public.flare_logs    enable row level security;
alter table public.observations  enable row level security;
alter table public.calma_events  enable row level security;

-- Una política "todo" por tabla: cada usuario solo ve/escribe sus filas.
do $$
declare t text;
begin
  foreach t in array array['profiles','flare_logs','observations','calma_events'] loop
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I
         for all
         using (user_id = auth.uid())
         with check (user_id = auth.uid());', t);
  end loop;
end $$;
