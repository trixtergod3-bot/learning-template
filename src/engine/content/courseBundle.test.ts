import { describe, expect, it } from 'vitest';

import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';
import { CourseBundleSchema } from '@/engine/content/courseBundle';

describe('CourseBundleSchema', () => {
  it('accepts the validated foundation fixture', () => {
    const result = CourseBundleSchema.safeParse(foundationLabCourse);

    expect(result.success).toBe(true);
  });

  it('rejects references to missing content', () => {
    const invalidCourse = structuredClone(foundationLabCourse);
    invalidCourse.course.moduleIds = [
      'missing-module' as (typeof invalidCourse.course.moduleIds)[number],
    ];

    const result = CourseBundleSchema.safeParse(invalidCourse);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some(({ message }) => message.includes('Unknown module ID'))).toBe(
      true,
    );
  });
});
