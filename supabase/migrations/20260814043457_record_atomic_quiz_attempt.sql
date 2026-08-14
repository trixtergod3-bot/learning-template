-- Phase 5: atomically persist browser-validated quiz evidence.
-- The function remains SECURITY INVOKER, so the existing table grants and RLS
-- policies continue to enforce authenticated ownership.

create function public.record_local_attempt(
  p_event_id text,
  p_session_id uuid,
  p_item_id text,
  p_content_version text,
  p_response jsonb,
  p_correct boolean,
  p_score numeric,
  p_max_score numeric,
  p_skill_evidence jsonb,
  p_feedback text default null,
  p_response_time_ms integer default null,
  p_occurred_at timestamptz default now(),
  p_generator_id text default null,
  p_generator_version text default null,
  p_generator_seed text default null,
  p_generator_sequence integer default null
)
returns uuid
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_attempt_id uuid;
  v_session public.practice_sessions%rowtype;
begin
  if jsonb_typeof(p_skill_evidence) <> 'array'
    or jsonb_array_length(p_skill_evidence) = 0 then
    raise exception 'At least one skill-evidence entry is required.'
      using errcode = '22023';
  end if;

  select practice_sessions.*
  into v_session
  from public.practice_sessions
  where practice_sessions.id = p_session_id
    and practice_sessions.user_id = (select auth.uid());

  if not found then
    raise exception 'The practice session is unavailable.'
      using errcode = '42501';
  end if;

  insert into public.activity_attempts (
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
  ) values (
    p_event_id,
    v_session.id,
    v_session.user_id,
    v_session.course_id,
    v_session.activity_id,
    p_item_id,
    p_content_version,
    p_generator_id,
    p_generator_version,
    p_generator_seed,
    p_generator_sequence,
    p_response,
    p_correct,
    p_score,
    p_max_score,
    p_feedback,
    'local',
    p_response_time_ms,
    p_occurred_at
  )
  on conflict (user_id, event_id) do nothing
  returning id into v_attempt_id;

  if v_attempt_id is null then
    select activity_attempts.id
    into v_attempt_id
    from public.activity_attempts
    where activity_attempts.user_id = v_session.user_id
      and activity_attempts.event_id = p_event_id;

    return v_attempt_id;
  end if;

  insert into public.attempt_skill_evidence (
    attempt_id,
    user_id,
    course_id,
    skill_id,
    weight
  )
  select
    v_attempt_id,
    v_session.user_id,
    v_session.course_id,
    evidence.skill_id,
    evidence.weight
  from jsonb_to_recordset(p_skill_evidence) as evidence(skill_id text, weight numeric);

  return v_attempt_id;
end
$function$;

revoke execute on function public.record_local_attempt(
  text,
  uuid,
  text,
  text,
  jsonb,
  boolean,
  numeric,
  numeric,
  jsonb,
  text,
  integer,
  timestamptz,
  text,
  text,
  text,
  integer
) from public, anon;

grant execute on function public.record_local_attempt(
  text,
  uuid,
  text,
  text,
  jsonb,
  boolean,
  numeric,
  numeric,
  jsonb,
  text,
  integer,
  timestamptz,
  text,
  text,
  text,
  integer
) to authenticated;

update public.courses
set content_version = '1.1.0'
where id = 'astrology';

update public.skills
set content_version = '1.1.0'
where course_id = 'astrology';
