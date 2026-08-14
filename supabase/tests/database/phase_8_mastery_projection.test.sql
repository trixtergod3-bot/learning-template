begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select ok(
  to_regprocedure('private.recalculate_skill_mastery(uuid,text,text)') is not null,
  'the deterministic mastery rebuild function exists'
);
select ok(
  to_regprocedure('private.refresh_skill_mastery_projection()') is not null,
  'the private mastery trigger function exists'
);
select has_trigger(
  'public',
  'attempt_skill_evidence',
  'attempt_skill_evidence_refresh_mastery',
  'valid evidence automatically refreshes mastery'
);
select ok(
  (
    select prosecdef
    from pg_proc
    where oid = to_regprocedure('private.refresh_skill_mastery_projection()')
  ),
  'the trigger can write the otherwise read-only projection'
);
select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('private.refresh_skill_mastery_projection()'),
    'EXECUTE'
  ),
  'browser clients cannot execute the privileged trigger function'
);

insert into auth.users (id, email)
values ('60000000-0000-4000-8000-000000000006', 'mastery-learner@example.test');

insert into public.practice_sessions (
  id, user_id, course_id, activity_id, mode, difficulty,
  status, content_version, started_at
) values (
  '66000000-0000-4000-8000-000000000006',
  '60000000-0000-4000-8000-000000000006',
  'astrology',
  'astrology.custom-quiz.easy',
  'quiz',
  'easy',
  'active',
  '1.3.0',
  now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000006', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.record_local_attempt(
      p_event_id => 'mastery-correct',
      p_session_id => '66000000-0000-4000-8000-000000000006',
      p_item_id => 'astrology.fire-signs.easy',
      p_content_version => '1.0.0',
      p_response => '["aries", "leo", "sagittarius"]'::jsonb,
      p_correct => true,
      p_score => 1,
      p_max_score => 1,
      p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb
    )
  $$,
  'a valid attempt creates its first mastery projection'
);
select is(
  (select mastery_score from public.skill_mastery where skill_id = 'astrology.elements'),
  64::numeric,
  'one correct event is accuracy discounted by initial confidence'
);

select lives_ok(
  $$
    select public.record_local_attempt(
      p_event_id => 'mastery-incorrect',
      p_session_id => '66000000-0000-4000-8000-000000000006',
      p_item_id => 'astrology.fire-signs.easy',
      p_content_version => '1.0.0',
      p_response => '["aries"]'::jsonb,
      p_correct => false,
      p_score => 0,
      p_max_score => 1,
      p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb
    )
  $$,
  'later evidence recalculates the same projection'
);
select is(
  (select evidence_count from public.skill_mastery where skill_id = 'astrology.elements'),
  2,
  'mastery records the complete evidence count'
);
select is(
  (select mastery_score from public.skill_mastery where skill_id = 'astrology.elements'),
  36.5::numeric,
  'mastery combines weighted accuracy and two-event confidence'
);
select is(
  (select calculation_version from public.skill_mastery where skill_id = 'astrology.elements'),
  'mastery-v1',
  'the projection records its calculation version'
);
select throws_ok(
  $$update public.skill_mastery set mastery_score = 100 where skill_id = 'astrology.elements'$$,
  '42501',
  'permission denied for table skill_mastery',
  'a learner cannot award mastery directly'
);

select * from finish();
rollback;
