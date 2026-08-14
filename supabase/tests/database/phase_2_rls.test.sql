begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'learner-one@example.test'),
  ('20000000-0000-4000-8000-000000000002', 'learner-two@example.test'),
  ('30000000-0000-4000-8000-000000000003', 'learner-three@example.test');

insert into public.profiles (user_id, display_name)
values ('20000000-0000-4000-8000-000000000002', 'Learner Two');

insert into public.practice_sessions (
  id,
  user_id,
  course_id,
  activity_id,
  mode,
  status,
  content_version,
  started_at
) values
  (
    '11000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'foundation-lab',
    'learning-loop-check',
    'quiz',
    'active',
    '0.1.0',
    now()
  ),
  (
    '22000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'foundation-lab',
    'learning-loop-check',
    'quiz',
    'active',
    '0.1.0',
    now()
  );

insert into public.activity_attempts (
  id,
  event_id,
  session_id,
  user_id,
  course_id,
  activity_id,
  item_id,
  content_version,
  response,
  correct,
  score,
  max_score,
  validation,
  occurred_at
) values
  (
    '11100000-0000-4000-8000-000000000001',
    'event-one',
    '11000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'foundation-lab',
    'learning-loop-check',
    'learning-loop-order',
    '1.0.0',
    '{"answer":"practice"}',
    true,
    1,
    1,
    'local',
    now()
  ),
  (
    '22200000-0000-4000-8000-000000000002',
    'event-two',
    '22000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'foundation-lab',
    'learning-loop-check',
    'learning-loop-order',
    '1.0.0',
    '{"answer":"practice"}',
    true,
    1,
    1,
    'local',
    now()
  );

insert into public.attempt_skill_evidence (
  attempt_id,
  user_id,
  course_id,
  skill_id,
  weight
) values
  (
    '11100000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'foundation-lab',
    'recognize-patterns',
    1
  ),
  (
    '22200000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'foundation-lab',
    'recognize-patterns',
    1
  );

insert into public.skill_mastery (
  user_id,
  course_id,
  skill_id,
  evidence_count,
  mastery_score,
  calculation_version
) values
  (
    '10000000-0000-4000-8000-000000000001',
    'foundation-lab',
    'recognize-patterns',
    1,
    20,
    'test-v1'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'foundation-lab',
    'recognize-patterns',
    1,
    80,
    'test-v1'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$insert into public.profiles (user_id, display_name) values ('10000000-0000-4000-8000-000000000001', 'Learner One')$$,
  'a learner can create their own profile'
);
select results_eq(
  'select display_name from public.profiles order by display_name',
  array['Learner One'::text],
  'a learner sees only their own profile'
);
select results_eq(
  'select count(*) from public.practice_sessions',
  array[1::bigint],
  'a learner sees only their own session'
);
select results_eq(
  'select count(*) from public.activity_attempts',
  array[1::bigint],
  'a learner sees only their own attempts'
);
select results_eq(
  'select count(*) from public.attempt_skill_evidence',
  array[1::bigint],
  'a learner sees only their own skill evidence'
);
select results_eq(
  'select mastery_score from public.skill_mastery',
  array[20::numeric],
  'a learner sees only their own mastery projection'
);
select throws_ok(
  $$insert into public.profiles (user_id, display_name) values ('30000000-0000-4000-8000-000000000003', 'Wrong Owner')$$,
  '42501',
  'new row violates row-level security policy for table "profiles"',
  'a learner cannot create another user profile'
);
select is_empty(
  $$update public.profiles set display_name = 'Changed' where user_id = '20000000-0000-4000-8000-000000000002' returning 1$$,
  'a cross-user profile update changes no rows'
);
select throws_ok(
  $$
    insert into public.activity_attempts (
      event_id, session_id, user_id, course_id, activity_id, item_id,
      content_version, response, correct, score, max_score, validation, occurred_at
    ) values (
      'forged-trusted-event',
      '11000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      'foundation-lab',
      'learning-loop-check',
      'learning-loop-order',
      '1.0.0',
      '{"answer":"practice"}',
      true,
      1,
      1,
      'trusted',
      now()
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "activity_attempts"',
  'a browser client cannot forge trusted evidence'
);
select throws_ok(
  $$update public.activity_attempts set score = 0 where event_id = 'event-one'$$,
  '42501',
  'permission denied for table activity_attempts',
  'attempt evidence is immutable to the learner'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);

select results_eq(
  $$select id from public.courses where id = 'foundation-lab'$$,
  array['foundation-lab'::text],
  'anonymous visitors can read the published registry'
);

select * from finish();
rollback;
