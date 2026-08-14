begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

select ok(
  to_regprocedure(
    'public.record_local_attempt(text,uuid,text,text,jsonb,boolean,numeric,numeric,jsonb,text,integer,timestamp with time zone,text,text,text,integer)'
  ) is not null,
  'the atomic local-attempt function exists'
);

select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = to_regprocedure(
      'public.record_local_attempt(text,uuid,text,text,jsonb,boolean,numeric,numeric,jsonb,text,integer,timestamp with time zone,text,text,text,integer)'
    )
  ),
  'the attempt function is security invoker'
);

select ok(
  not has_function_privilege(
    'anon',
    to_regprocedure(
      'public.record_local_attempt(text,uuid,text,text,jsonb,boolean,numeric,numeric,jsonb,text,integer,timestamp with time zone,text,text,text,integer)'
    ),
    'EXECUTE'
  ),
  'anonymous visitors cannot call the attempt function'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure(
      'public.record_local_attempt(text,uuid,text,text,jsonb,boolean,numeric,numeric,jsonb,text,integer,timestamp with time zone,text,text,text,integer)'
    ),
    'EXECUTE'
  ),
  'authenticated learners can call the attempt function'
);

insert into auth.users (id, email)
values ('50000000-0000-4000-8000-000000000005', 'quiz-learner@example.test');

insert into public.practice_sessions (
  id,
  user_id,
  course_id,
  activity_id,
  mode,
  difficulty,
  status,
  content_version,
  started_at
) values (
  '55000000-0000-4000-8000-000000000005',
  '50000000-0000-4000-8000-000000000005',
  'astrology',
  'astrology.custom-quiz.easy',
  'quiz',
  'easy',
  'active',
  '1.1.0',
  now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-4000-8000-000000000005', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.record_local_attempt(
      p_event_id => 'quiz-event-one',
      p_session_id => '55000000-0000-4000-8000-000000000005',
      p_item_id => 'astrology.fire-signs.easy',
      p_content_version => '1.0.0',
      p_response => '["aries", "leo", "sagittarius"]'::jsonb,
      p_correct => true,
      p_score => 1,
      p_max_score => 1,
      p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb,
      p_response_time_ms => 1200
    )
  $$,
  'a learner can atomically record a local quiz attempt'
);

select results_eq(
  $$select count(*) from public.activity_attempts where event_id = 'quiz-event-one'$$,
  array[1::bigint],
  'the function records one immutable attempt'
);

select results_eq(
  $$select count(*) from public.attempt_skill_evidence where skill_id = 'astrology.elements'$$,
  array[1::bigint],
  'the function records the connected skill evidence'
);

select throws_ok(
  $$
    select public.record_local_attempt(
      p_event_id => 'quiz-event-invalid-skill',
      p_session_id => '55000000-0000-4000-8000-000000000005',
      p_item_id => 'astrology.fire-signs.easy',
      p_content_version => '1.0.0',
      p_response => '["aries"]'::jsonb,
      p_correct => false,
      p_score => 0,
      p_max_score => 1,
      p_skill_evidence => '[{"skill_id":"astrology.not-a-skill","weight":1}]'::jsonb
    )
  $$,
  '23503',
  null,
  'invalid skill evidence rejects the whole operation'
);

select results_eq(
  $$select count(*) from public.activity_attempts where event_id = 'quiz-event-invalid-skill'$$,
  array[0::bigint],
  'a rejected evidence row leaves no partial attempt'
);

select * from finish();
rollback;
