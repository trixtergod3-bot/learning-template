begin;

create extension if not exists pgtap with schema extensions;

select plan(27);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'courses', 'courses registry exists');
select has_table('public', 'skills', 'skills registry exists');
select has_table('public', 'practice_sessions', 'practice sessions table exists');
select has_table('public', 'activity_attempts', 'activity attempts table exists');
select has_table('public', 'attempt_skill_evidence', 'attempt evidence table exists');
select has_table('public', 'skill_mastery', 'skill mastery projection exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.courses'::regclass),
  'courses has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.skills'::regclass),
  'skills has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.practice_sessions'::regclass),
  'practice_sessions has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.activity_attempts'::regclass),
  'activity_attempts has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.attempt_skill_evidence'::regclass),
  'attempt_skill_evidence has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.skill_mastery'::regclass),
  'skill_mastery has RLS enabled'
);

select set_eq(
  $$
    select privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'courses'
      and grantee = 'anon'
  $$,
  $$values ('SELECT'::text)$$,
  'anonymous users can only read the course registry'
);
select is_empty(
  $$
    select privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'anon'
  $$,
  'anonymous users have no profile privileges'
);
select set_eq(
  $$
    select privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'activity_attempts'
      and grantee = 'authenticated'
  $$,
  $$values ('SELECT'::text)$$,
  'attempts are table-level read only for authenticated users'
);
select ok(
  has_column_privilege('authenticated', 'public.activity_attempts', 'event_id', 'INSERT'),
  'authenticated users can insert approved attempt columns'
);
select ok(
  not has_table_privilege('authenticated', 'public.activity_attempts', 'UPDATE'),
  'attempts are immutable to authenticated users'
);
select ok(
  not has_table_privilege('authenticated', 'public.activity_attempts', 'DELETE'),
  'attempts cannot be deleted by authenticated users'
);
select ok(
  has_column_privilege('authenticated', 'public.practice_sessions', 'status', 'UPDATE'),
  'authenticated users can complete their own session'
);
select ok(
  not has_column_privilege('authenticated', 'public.practice_sessions', 'user_id', 'UPDATE'),
  'session ownership cannot be reassigned by authenticated users'
);
select ok(
  not has_table_privilege('authenticated', 'public.skill_mastery', 'INSERT'),
  'mastery is not client writable'
);
select ok(
  not has_table_privilege('authenticated', 'public.skill_mastery', 'UPDATE'),
  'mastery cannot be forged by authenticated users'
);
select ok(
  case
    when to_regprocedure('public.rls_auto_enable()') is null then true
    else not has_function_privilege(
      'anon',
      to_regprocedure('public.rls_auto_enable()'),
      'EXECUTE'
    )
  end,
  'anonymous users cannot call the RLS event-trigger helper'
);
select ok(
  case
    when to_regprocedure('public.rls_auto_enable()') is null then true
    else not has_function_privilege(
      'authenticated',
      to_regprocedure('public.rls_auto_enable()'),
      'EXECUTE'
    )
  end,
  'authenticated users cannot call the RLS event-trigger helper'
);
select results_eq(
  $$select id from public.courses where id = 'foundation-lab' and is_published$$,
  array['foundation-lab'::text],
  'the Git-backed fixture is registered as published'
);

select * from finish();
rollback;
