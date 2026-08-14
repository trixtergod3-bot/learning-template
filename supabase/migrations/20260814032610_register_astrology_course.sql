-- Phase 3: mirror stable metadata from the Git-backed Astrology course bundle.
-- Questions, answers, activities, and lessons remain versioned in Git.

insert into public.courses (
  id,
  title,
  description,
  content_version,
  is_published
) values (
  'astrology',
  'Astrology Foundations',
  'Learn the zodiac through focused lessons and rapid recognition practice inspired by Astro11.',
  '1.0.0',
  true
)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  content_version = excluded.content_version,
  is_published = excluded.is_published;

insert into public.skills (
  course_id,
  id,
  title,
  description,
  content_version,
  is_published
) values
  (
    'astrology',
    'astrology.elements',
    'Identify zodiac elements',
    'Classify zodiac signs by their traditional elemental family.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.modalities',
    'Identify zodiac modalities',
    'Classify zodiac signs by their Cardinal, Fixed, or Mutable modality.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.date-ranges',
    'Recall zodiac date ranges',
    'Match common tropical zodiac date ranges to their signs.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.body-parts',
    'Recall traditional body correspondences',
    'Match signs with body correspondences found in astrological tradition.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.traits',
    'Recognize zodiac archetypes',
    'Identify signs from their commonly taught archetypal traits.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.planetary-rulers',
    'Recall planetary rulers',
    'Match zodiac signs to their traditional planetary rulers.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.polarity',
    'Classify zodiac polarity',
    'Classify signs by the traditional Yin and Yang polarities.',
    '1.0.0',
    true
  ),
  (
    'astrology',
    'astrology.opposites',
    'Identify opposite signs',
    'Match each zodiac sign with the sign opposite it on the wheel.',
    '1.0.0',
    true
  )
on conflict (course_id, id) do update
set
  title = excluded.title,
  description = excluded.description,
  content_version = excluded.content_version,
  is_published = excluded.is_published;
