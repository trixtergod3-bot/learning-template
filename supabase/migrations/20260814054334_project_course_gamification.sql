-- Phase 9: optional personal gamification derived from immutable evidence.
-- XP and achievements are read-only projections; local evidence is never
-- promoted to trusted competitive data.

create table public.user_course_gamification (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  xp_total integer not null,
  attempt_count integer not null,
  accuracy_percentage numeric(7, 4) not null,
  active_streak_days integer not null,
  longest_streak_days integer not null,
  last_practiced_at timestamptz,
  calculation_version text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id),
  constraint user_course_gamification_xp_check check (xp_total >= 0),
  constraint user_course_gamification_attempt_count_check check (attempt_count >= 0),
  constraint user_course_gamification_accuracy_check check (accuracy_percentage between 0 and 100),
  constraint user_course_gamification_streak_check check (
    active_streak_days >= 0
    and longest_streak_days >= active_streak_days
  ),
  constraint user_course_gamification_version_check check (
    calculation_version = btrim(calculation_version)
    and char_length(calculation_version) between 1 and 40
  )
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null,
  calculation_version text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id, achievement_id),
  constraint user_achievements_id_check check (
    achievement_id in (
      'first-steps',
      'focused-ten',
      'three-day-rhythm',
      'high-accuracy',
      'course-strong'
    )
  ),
  constraint user_achievements_version_check check (
    calculation_version = btrim(calculation_version)
    and char_length(calculation_version) between 1 and 40
  )
);

create index user_achievements_user_course_idx
  on public.user_achievements (user_id, course_id, earned_at desc);

alter table public.user_course_gamification enable row level security;
alter table public.user_achievements enable row level security;

revoke all on table public.user_course_gamification from anon, authenticated;
revoke all on table public.user_achievements from anon, authenticated;
grant select on table public.user_course_gamification to authenticated;
grant select on table public.user_achievements to authenticated;

create policy user_course_gamification_read_own
on public.user_course_gamification
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy user_achievements_read_own
on public.user_achievements
for select
to authenticated
using ((select auth.uid()) = user_id);

create function private.recalculate_course_gamification(
  p_user_id uuid,
  p_course_id text
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_xp_total integer;
  v_attempt_count integer;
  v_accuracy numeric;
  v_active_streak integer;
  v_longest_streak integer;
  v_last_practiced_at timestamptz;
begin
  with attempt_rows as (
    select
      attempt.score / attempt.max_score as score_ratio,
      attempt.response_time_ms,
      attempt.occurred_at,
      (attempt.occurred_at at time zone 'UTC')::date as practice_day
    from public.activity_attempts as attempt
    where attempt.user_id = p_user_id
      and attempt.course_id = p_course_id
  ),
  summary as (
    select
      coalesce(sum(
        10
        + round(10 * score_ratio)::integer
        + case when response_time_ms between 1 and 3000 then 2 else 0 end
      ), 0)::integer as xp_total,
      count(*)::integer as attempt_count,
      coalesce(round(avg(score_ratio) * 100, 4), 0) as accuracy,
      max(occurred_at) as last_practiced_at
    from attempt_rows
  ),
  practice_days as (
    select distinct practice_day from attempt_rows
  ),
  numbered_days as (
    select
      practice_day,
      practice_day - row_number() over (order by practice_day)::integer as streak_group
    from practice_days
  ),
  streaks as (
    select
      min(practice_day) as streak_start,
      max(practice_day) as streak_end,
      count(*)::integer as streak_length
    from numbered_days
    group by streak_group
  ),
  streak_summary as (
    select
      coalesce(max(streak_length), 0)::integer as longest_streak,
      coalesce(
        max(streak_length) filter (
          where streak_end = (select max(practice_day) from practice_days)
        ),
        0
      )::integer as active_streak
    from streaks
  )
  select
    summary.xp_total,
    summary.attempt_count,
    summary.accuracy,
    streak_summary.active_streak,
    streak_summary.longest_streak,
    summary.last_practiced_at
  into
    v_xp_total,
    v_attempt_count,
    v_accuracy,
    v_active_streak,
    v_longest_streak,
    v_last_practiced_at
  from summary
  cross join streak_summary;

  insert into public.user_course_gamification (
    user_id,
    course_id,
    xp_total,
    attempt_count,
    accuracy_percentage,
    active_streak_days,
    longest_streak_days,
    last_practiced_at,
    calculation_version
  ) values (
    p_user_id,
    p_course_id,
    v_xp_total,
    v_attempt_count,
    v_accuracy,
    v_active_streak,
    v_longest_streak,
    v_last_practiced_at,
    'gamification-v1'
  )
  on conflict (user_id, course_id) do update
  set xp_total = excluded.xp_total,
      attempt_count = excluded.attempt_count,
      accuracy_percentage = excluded.accuracy_percentage,
      active_streak_days = excluded.active_streak_days,
      longest_streak_days = excluded.longest_streak_days,
      last_practiced_at = excluded.last_practiced_at,
      calculation_version = excluded.calculation_version,
      updated_at = now();

  insert into public.user_achievements (
    user_id,
    course_id,
    achievement_id,
    earned_at,
    calculation_version
  )
  select p_user_id, p_course_id, achievement_id, v_last_practiced_at, 'gamification-v1'
  from (
    select 'first-steps'::text as achievement_id where v_attempt_count >= 1
    union all
    select 'focused-ten' where v_attempt_count >= 10
    union all
    select 'three-day-rhythm' where v_longest_streak >= 3
    union all
    select 'high-accuracy' where v_attempt_count >= 10 and v_accuracy >= 80
    union all
    select 'course-strong'
    where exists (
      select 1 from public.skills
      where course_id = p_course_id and is_published
    )
    and not exists (
      select 1
      from public.skills as skill
      left join public.skill_mastery as mastery
        on mastery.user_id = p_user_id
        and mastery.course_id = skill.course_id
        and mastery.skill_id = skill.id
      where skill.course_id = p_course_id
        and skill.is_published
        and coalesce(mastery.mastery_score, 0) < 75
    )
  ) as unlocked
  on conflict (user_id, course_id, achievement_id) do nothing;
end
$function$;

revoke execute on function private.recalculate_course_gamification(uuid, text)
from public, anon, authenticated;

create or replace function private.refresh_skill_mastery_projection()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  perform private.recalculate_skill_mastery(new.user_id, new.course_id, new.skill_id);
  perform private.recalculate_course_gamification(new.user_id, new.course_id);
  return new;
end
$function$;

select private.recalculate_course_gamification(user_id, course_id)
from (
  select distinct user_id, course_id
  from public.activity_attempts
) as existing_activity;

comment on table public.user_course_gamification is
  'Server-owned personal XP and streak projection derived from immutable attempts.';
comment on table public.user_achievements is
  'Server-owned personal achievement unlocks; local evidence is not competitive trust.';
