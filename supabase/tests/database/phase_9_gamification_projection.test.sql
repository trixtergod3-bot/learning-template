begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select has_table('public', 'user_course_gamification', 'the course gamification projection exists');
select has_table('public', 'user_achievements', 'the achievement projection exists');
select ok(
  to_regprocedure('private.recalculate_course_gamification(uuid,text)') is not null,
  'the private course projection function exists'
);
select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('private.recalculate_course_gamification(uuid,text)'),
    'EXECUTE'
  ),
  'browser clients cannot invoke the projection function'
);
select ok(
  has_table_privilege('authenticated', 'public.user_course_gamification', 'SELECT')
    and not has_table_privilege('authenticated', 'public.user_course_gamification', 'INSERT')
    and not has_table_privilege('authenticated', 'public.user_course_gamification', 'UPDATE'),
  'learners can read but cannot mutate projected gamification'
);

insert into auth.users (id, email)
values ('70000000-0000-4000-8000-000000000007', 'gamification-learner@example.test');

insert into public.practice_sessions (
  id, user_id, course_id, activity_id, mode, difficulty,
  status, content_version, started_at
) values (
  '77000000-0000-4000-8000-000000000007',
  '70000000-0000-4000-8000-000000000007',
  'astrology',
  'astrology.custom-drill.easy',
  'drill',
  'easy',
  'active',
  '1.3.0',
  '2026-08-12T09:00:00Z'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000007', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$select public.record_local_attempt(
    p_event_id => 'game-one',
    p_session_id => '77000000-0000-4000-8000-000000000007',
    p_item_id => 'astrology.fire-signs.easy',
    p_content_version => '1.0.0',
    p_response => '["aries", "leo", "sagittarius"]'::jsonb,
    p_correct => true, p_score => 1, p_max_score => 1,
    p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb,
    p_response_time_ms => 2500,
    p_occurred_at => '2026-08-12T10:00:00Z'
  )$$,
  'the first attempt creates the personal projection'
);
select lives_ok(
  $$select public.record_local_attempt(
    p_event_id => 'game-two',
    p_session_id => '77000000-0000-4000-8000-000000000007',
    p_item_id => 'astrology.fire-signs.easy',
    p_content_version => '1.0.0',
    p_response => '["aries"]'::jsonb,
    p_correct => false, p_score => 0.5, p_max_score => 1,
    p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb,
    p_response_time_ms => 5000,
    p_occurred_at => '2026-08-13T10:00:00Z'
  )$$,
  'partial evidence contributes bounded XP'
);
select lives_ok(
  $$select public.record_local_attempt(
    p_event_id => 'game-three',
    p_session_id => '77000000-0000-4000-8000-000000000007',
    p_item_id => 'astrology.fire-signs.easy',
    p_content_version => '1.0.0',
    p_response => '["aries", "leo", "sagittarius"]'::jsonb,
    p_correct => true, p_score => 1, p_max_score => 1,
    p_skill_evidence => '[{"skill_id":"astrology.elements","weight":1}]'::jsonb,
    p_response_time_ms => 2500,
    p_occurred_at => '2026-08-14T10:00:00Z'
  )$$,
  'a third consecutive day refreshes the streak'
);

select is(
  (select xp_total from public.user_course_gamification where course_id = 'astrology'),
  59,
  'XP is base effort plus bounded performance and speed bonuses'
);
select results_eq(
  $$
    select attempt_count, round(accuracy_percentage, 2), active_streak_days, longest_streak_days
    from public.user_course_gamification
    where course_id = 'astrology'
  $$,
  $$values (3, 83.33::numeric, 3, 3)$$,
  'attempt, accuracy, and streak projections are reproducible'
);
select results_eq(
  $$select achievement_id from public.user_achievements order by achievement_id$$,
  array['first-steps'::text, 'three-day-rhythm'::text],
  'only satisfied achievements unlock'
);
select throws_ok(
  $$update public.user_course_gamification set xp_total = 9999 where course_id = 'astrology'$$,
  '42501',
  'permission denied for table user_course_gamification',
  'a learner cannot award XP directly'
);

select * from finish();
rollback;
