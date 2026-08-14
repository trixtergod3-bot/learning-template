-- Phase 2: authenticated ownership and the smallest durable learning-data model.
-- Course content remains in Git. The database stores only registry metadata,
-- immutable evidence, user-owned sessions, and server-owned projections.

do $migration$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$migration$;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = statement_timestamp();
  return new;
end
$function$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check check (
    display_name is null
    or (
      display_name = btrim(display_name)
      and char_length(display_name) between 1 and 80
    )
  ),
  constraint profiles_locale_check check (
    locale ~ '^[a-z]{2,3}(-[A-Z]{2})?$'
  )
);

create table public.courses (
  id text primary key,
  title text not null,
  description text not null,
  content_version text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_id_check check (
    id ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
    and char_length(id) <= 96
  ),
  constraint courses_title_check check (
    title = btrim(title)
    and char_length(title) between 1 and 120
  ),
  constraint courses_description_check check (
    description = btrim(description)
    and char_length(description) between 1 and 500
  ),
  constraint courses_content_version_check check (
    content_version = btrim(content_version)
    and char_length(content_version) between 1 and 40
  )
);

create table public.skills (
  course_id text not null references public.courses (id) on delete cascade,
  id text not null,
  parent_skill_id text,
  title text not null,
  description text not null,
  content_version text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, id),
  constraint skills_id_check check (
    id ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
    and char_length(id) <= 96
  ),
  constraint skills_parent_check check (parent_skill_id is null or parent_skill_id <> id),
  constraint skills_title_check check (
    title = btrim(title)
    and char_length(title) between 1 and 120
  ),
  constraint skills_description_check check (
    description = btrim(description)
    and char_length(description) between 1 and 500
  ),
  constraint skills_content_version_check check (
    content_version = btrim(content_version)
    and char_length(content_version) between 1 and 40
  ),
  constraint skills_parent_fkey foreign key (course_id, parent_skill_id)
    references public.skills (course_id, id) on delete restrict
);

create table public.practice_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete restrict,
  activity_id text not null,
  mode text not null,
  difficulty text,
  status text not null default 'active',
  content_version text not null,
  seed text,
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_sessions_identity_key unique (id, user_id, course_id, activity_id),
  constraint practice_sessions_activity_id_check check (
    activity_id ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
    and char_length(activity_id) <= 96
  ),
  constraint practice_sessions_mode_check check (mode in ('quiz', 'drill', 'flashcards')),
  constraint practice_sessions_difficulty_check check (
    difficulty is null or difficulty in ('easy', 'medium', 'hard')
  ),
  constraint practice_sessions_status_check check (
    status in ('active', 'completed', 'abandoned')
  ),
  constraint practice_sessions_content_version_check check (
    content_version = btrim(content_version)
    and char_length(content_version) between 1 and 40
  ),
  constraint practice_sessions_seed_check check (
    seed is null or char_length(seed) between 1 and 128
  ),
  constraint practice_sessions_completion_check check (
    (status = 'active' and completed_at is null)
    or (status in ('completed', 'abandoned') and completed_at is not null)
  ),
  constraint practice_sessions_timeline_check check (
    completed_at is null or completed_at >= started_at
  )
);

create table public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  session_id uuid not null,
  user_id uuid not null,
  course_id text not null,
  activity_id text not null,
  item_id text not null,
  content_version text not null,
  generator_id text,
  generator_version text,
  generator_seed text,
  generator_sequence integer,
  response jsonb not null,
  correct boolean not null,
  score numeric(12, 4) not null,
  max_score numeric(12, 4) not null,
  feedback text,
  validation text not null default 'local',
  response_time_ms integer,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint activity_attempts_event_key unique (user_id, event_id),
  constraint activity_attempts_identity_key unique (id, user_id, course_id),
  constraint activity_attempts_session_fkey foreign key (
    session_id,
    user_id,
    course_id,
    activity_id
  ) references public.practice_sessions (id, user_id, course_id, activity_id) on delete cascade,
  constraint activity_attempts_event_id_check check (
    event_id = btrim(event_id)
    and char_length(event_id) between 1 and 128
  ),
  constraint activity_attempts_item_id_check check (
    item_id ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
    and char_length(item_id) <= 96
  ),
  constraint activity_attempts_content_version_check check (
    content_version = btrim(content_version)
    and char_length(content_version) between 1 and 40
  ),
  constraint activity_attempts_generator_check check (
    (
      generator_id is null
      and generator_version is null
      and generator_seed is null
      and generator_sequence is null
    )
    or (
      generator_id is not null
      and generator_version is not null
      and generator_seed is not null
      and generator_sequence is not null
      and generator_sequence >= 0
    )
  ),
  constraint activity_attempts_score_check check (
    score >= 0 and max_score > 0 and score <= max_score
  ),
  constraint activity_attempts_feedback_check check (
    feedback is null or char_length(feedback) between 1 and 1000
  ),
  constraint activity_attempts_validation_check check (validation in ('local', 'trusted')),
  constraint activity_attempts_response_time_check check (
    response_time_ms is null or response_time_ms between 0 and 86400000
  )
);

create table public.attempt_skill_evidence (
  attempt_id uuid not null,
  user_id uuid not null,
  course_id text not null,
  skill_id text not null,
  weight numeric(8, 4) not null default 1,
  created_at timestamptz not null default now(),
  primary key (attempt_id, skill_id),
  constraint attempt_skill_evidence_attempt_fkey foreign key (attempt_id, user_id, course_id)
    references public.activity_attempts (id, user_id, course_id) on delete cascade,
  constraint attempt_skill_evidence_skill_fkey foreign key (course_id, skill_id)
    references public.skills (course_id, id) on delete restrict,
  constraint attempt_skill_evidence_weight_check check (weight > 0 and weight <= 10)
);

create table public.skill_mastery (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  skill_id text not null,
  evidence_count integer not null,
  mastery_score numeric(7, 4) not null,
  last_practiced_at timestamptz,
  calculation_version text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, skill_id),
  constraint skill_mastery_skill_fkey foreign key (course_id, skill_id)
    references public.skills (course_id, id) on delete cascade,
  constraint skill_mastery_evidence_count_check check (evidence_count >= 0),
  constraint skill_mastery_score_check check (mastery_score between 0 and 100),
  constraint skill_mastery_calculation_version_check check (
    calculation_version = btrim(calculation_version)
    and char_length(calculation_version) between 1 and 40
  )
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row execute function private.set_updated_at();

create trigger skills_set_updated_at
before update on public.skills
for each row execute function private.set_updated_at();

create trigger practice_sessions_set_updated_at
before update on public.practice_sessions
for each row execute function private.set_updated_at();

create index practice_sessions_user_started_idx
  on public.practice_sessions (user_id, started_at desc);
create index practice_sessions_user_course_idx
  on public.practice_sessions (user_id, course_id, started_at desc);
create index activity_attempts_user_occurred_idx
  on public.activity_attempts (user_id, occurred_at desc);
create index activity_attempts_session_occurred_idx
  on public.activity_attempts (session_id, occurred_at, created_at);
create index attempt_skill_evidence_user_skill_idx
  on public.attempt_skill_evidence (user_id, course_id, skill_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.skills enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.attempt_skill_evidence enable row level security;
alter table public.skill_mastery enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.courses from anon, authenticated;
revoke all on table public.skills from anon, authenticated;
revoke all on table public.practice_sessions from anon, authenticated;
revoke all on table public.activity_attempts from anon, authenticated;
revoke all on table public.attempt_skill_evidence from anon, authenticated;
revoke all on table public.skill_mastery from anon, authenticated;

grant select on table public.courses to anon, authenticated;
grant select on table public.skills to anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (user_id, display_name, locale) on table public.profiles to authenticated;
grant update (display_name, locale) on table public.profiles to authenticated;

grant select on table public.practice_sessions to authenticated;
grant insert (
  id,
  user_id,
  course_id,
  activity_id,
  mode,
  difficulty,
  status,
  content_version,
  seed,
  started_at,
  completed_at
) on table public.practice_sessions to authenticated;
grant update (status, completed_at) on table public.practice_sessions to authenticated;

grant select on table public.activity_attempts to authenticated;
grant insert (
  event_id,
  session_id,
  user_id,
  course_id,
  activity_id,
  item_id,
  content_version,
  generator_id,
  generator_version,
  generator_seed,
  generator_sequence,
  response,
  correct,
  score,
  max_score,
  feedback,
  validation,
  response_time_ms,
  occurred_at
) on table public.activity_attempts to authenticated;

grant select on table public.attempt_skill_evidence to authenticated;
grant insert (
  attempt_id,
  user_id,
  course_id,
  skill_id,
  weight
) on table public.attempt_skill_evidence to authenticated;

grant select on table public.skill_mastery to authenticated;

create policy courses_read_published
on public.courses
for select
to anon, authenticated
using (is_published);

create policy skills_read_published
on public.skills
for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1
    from public.courses
    where courses.id = skills.course_id
      and courses.is_published
  )
);

create policy profiles_read_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy practice_sessions_read_own
on public.practice_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy practice_sessions_insert_own
on public.practice_sessions
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.courses
    where courses.id = practice_sessions.course_id
      and courses.is_published
  )
);

create policy practice_sessions_update_own
on public.practice_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy activity_attempts_read_own
on public.activity_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy activity_attempts_insert_local_own
on public.activity_attempts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and validation = 'local'
);

create policy attempt_skill_evidence_read_own
on public.attempt_skill_evidence
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy attempt_skill_evidence_insert_own
on public.attempt_skill_evidence
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy skill_mastery_read_own
on public.skill_mastery
for select
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.courses is
  'Read-only registry metadata for course bundles whose content remains versioned in Git.';
comment on table public.skills is
  'Read-only registry metadata for stable skill identifiers defined by Git-backed course bundles.';
comment on table public.activity_attempts is
  'Append-only answer evidence. Client-authored rows are always marked local and are not trusted for competitive systems.';
comment on table public.skill_mastery is
  'Server-owned, recomputable projection. Browser roles receive SELECT only.';

insert into public.courses (
  id,
  title,
  description,
  content_version,
  is_published
) values (
  'foundation-lab',
  'Foundation Lab',
  'Development fixture proving that lessons, static questions, and deterministic generators share one engine.',
  '0.1.0',
  true
);

insert into public.skills (
  course_id,
  id,
  title,
  description,
  content_version,
  is_published
) values (
  'foundation-lab',
  'recognize-patterns',
  'Recognize patterns',
  'Identify and apply a learned relationship in a new prompt.',
  '0.1.0',
  true
);
