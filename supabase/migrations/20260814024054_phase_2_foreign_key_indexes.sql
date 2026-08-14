-- Cover every foreign key with an index whose leading columns match the key.
-- This keeps ownership cascades and registry maintenance predictable as data grows.

create index skills_parent_idx
  on public.skills (course_id, parent_skill_id);

create index practice_sessions_course_idx
  on public.practice_sessions (course_id);

drop index public.activity_attempts_session_occurred_idx;
create index activity_attempts_session_context_idx
  on public.activity_attempts (
    session_id,
    user_id,
    course_id,
    activity_id,
    occurred_at,
    created_at
  );

create index attempt_skill_evidence_attempt_idx
  on public.attempt_skill_evidence (attempt_id, user_id, course_id);

create index attempt_skill_evidence_skill_idx
  on public.attempt_skill_evidence (course_id, skill_id);

create index skill_mastery_skill_idx
  on public.skill_mastery (course_id, skill_id);
