-- Phase 6 publishes the Git-backed flashcard-enabled course version.
-- Card content remains in the course bundle; the registry stores only metadata.

update public.courses
set content_version = '1.2.0'
where id = 'astrology';

update public.skills
set content_version = '1.2.0'
where course_id = 'astrology';
