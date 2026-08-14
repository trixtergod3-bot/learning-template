-- Phase 8: maintain a server-owned, reproducible mastery projection.
-- Learners still receive SELECT only on skill_mastery; valid immutable evidence
-- invokes the private trigger after ownership and foreign-key checks succeed.

create function private.recalculate_skill_mastery(
  p_user_id uuid,
  p_course_id text,
  p_skill_id text
)
returns void
language sql
volatile
security invoker
set search_path = ''
as $function$
  insert into public.skill_mastery (
    user_id,
    course_id,
    skill_id,
    evidence_count,
    mastery_score,
    last_practiced_at,
    calculation_version
  )
  select
    p_user_id,
    p_course_id,
    p_skill_id,
    count(*)::integer,
    round(
      (
        sum((attempt.score / attempt.max_score) * evidence.weight)
        / nullif(sum(evidence.weight), 0)
      )
      * (0.55 + 0.45 * least(count(*)::numeric, 5) / 5)
      * 100,
      4
    ),
    max(attempt.occurred_at),
    'mastery-v1'
  from public.attempt_skill_evidence as evidence
  join public.activity_attempts as attempt
    on attempt.id = evidence.attempt_id
    and attempt.user_id = evidence.user_id
    and attempt.course_id = evidence.course_id
  where evidence.user_id = p_user_id
    and evidence.course_id = p_course_id
    and evidence.skill_id = p_skill_id
  on conflict (user_id, course_id, skill_id) do update
  set evidence_count = excluded.evidence_count,
      mastery_score = excluded.mastery_score,
      last_practiced_at = excluded.last_practiced_at,
      calculation_version = excluded.calculation_version,
      updated_at = now();
$function$;

create function private.refresh_skill_mastery_projection()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  perform private.recalculate_skill_mastery(new.user_id, new.course_id, new.skill_id);
  return new;
end
$function$;

revoke execute on function private.recalculate_skill_mastery(uuid, text, text)
from public, anon, authenticated;
revoke execute on function private.refresh_skill_mastery_projection()
from public, anon, authenticated;

create trigger attempt_skill_evidence_refresh_mastery
after insert on public.attempt_skill_evidence
for each row execute function private.refresh_skill_mastery_projection();

-- Backfill any evidence recorded before this projection existed.
select private.recalculate_skill_mastery(user_id, course_id, skill_id)
from (
  select distinct user_id, course_id, skill_id
  from public.attempt_skill_evidence
) as existing_evidence;

comment on function private.recalculate_skill_mastery(uuid, text, text) is
  'Rebuilds one mastery row from immutable weighted attempt evidence using mastery-v1.';
comment on function private.refresh_skill_mastery_projection() is
  'Private trigger boundary that updates read-only mastery after valid evidence insertion.';
