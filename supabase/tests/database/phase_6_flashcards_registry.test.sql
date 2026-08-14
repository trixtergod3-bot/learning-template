begin;

create extension if not exists pgtap with schema extensions;

select plan(2);

select results_eq(
  $$select content_version from public.courses where id = 'astrology' and is_published$$,
  array['1.2.0'::text],
  'the published registry matches the flashcard-enabled Astrology bundle'
);

select is(
  (
    select count(*)::integer
    from public.skills
    where course_id = 'astrology'
      and content_version = '1.2.0'
      and is_published
  ),
  8,
  'all stable Astrology skills remain published at the current content version'
);

select * from finish();
rollback;
