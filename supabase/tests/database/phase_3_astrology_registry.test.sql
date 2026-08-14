begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

select results_eq(
  $$
    select id
    from public.courses
    where id = 'astrology'
      and content_version = '1.0.0'
      and is_published
  $$,
  array['astrology'::text],
  'the Git-backed Astrology course is published at version 1.0.0'
);

select is(
  (
    select count(*)::integer
    from public.skills
    where course_id = 'astrology'
      and content_version = '1.0.0'
      and is_published
  ),
  8,
  'all eight Astrology skills are published'
);

select results_eq(
  $$
    select id
    from public.skills
    where course_id = 'astrology'
    order by id
  $$,
  array[
    'astrology.body-parts'::text,
    'astrology.date-ranges'::text,
    'astrology.elements'::text,
    'astrology.modalities'::text,
    'astrology.opposites'::text,
    'astrology.planetary-rulers'::text,
    'astrology.polarity'::text,
    'astrology.traits'::text
  ],
  'database skill IDs match the Git course bundle'
);

select ok(
  has_table_privilege('anon', 'public.courses', 'SELECT')
    and not has_table_privilege('anon', 'public.courses', 'INSERT')
    and not has_table_privilege('anon', 'public.courses', 'UPDATE')
    and not has_table_privilege('anon', 'public.courses', 'DELETE'),
  'anonymous users can read but cannot mutate course registry metadata'
);

select ok(
  has_table_privilege('authenticated', 'public.skills', 'SELECT')
    and not has_table_privilege('authenticated', 'public.skills', 'INSERT')
    and not has_table_privilege('authenticated', 'public.skills', 'UPDATE')
    and not has_table_privilege('authenticated', 'public.skills', 'DELETE'),
  'authenticated users can read but cannot mutate skill registry metadata'
);

select * from finish();
rollback;
