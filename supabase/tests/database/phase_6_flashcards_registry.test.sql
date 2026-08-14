begin;

create extension if not exists pgtap with schema extensions;

select plan(2);

select ok(
  (
    select string_to_array(content_version, '.')::integer[] >= array[1, 2, 0]
    from public.courses
    where id = 'astrology' and is_published
  ),
  'the published registry includes the flashcard milestone or a later compatible version'
);

select is(
  (
    select count(*)::integer
    from public.skills
    where course_id = 'astrology'
      and string_to_array(content_version, '.')::integer[] >= array[1, 2, 0]
      and is_published
  ),
  8,
  'all stable Astrology skills remain published at the current content version'
);

select * from finish();
rollback;
