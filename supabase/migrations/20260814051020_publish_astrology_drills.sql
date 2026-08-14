-- Phase 7 publishes the Git-backed rapid-drill-enabled course version.
-- Drill definitions remain in the course bundle; the registry stores only metadata.

update public.courses
set content_version = '1.3.0'
where id = 'astrology';

update public.skills
set content_version = '1.3.0'
where course_id = 'astrology';
