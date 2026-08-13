import type { CourseId } from '../domain/identifiers';
import { CourseBundleSchema, type CourseBundle } from './courseBundle';

export class CourseRegistry {
  readonly #courses = new Map<CourseId, CourseBundle>();

  register(input: unknown): CourseBundle {
    const bundle = CourseBundleSchema.parse(input);

    if (this.#courses.has(bundle.course.id)) {
      throw new Error(`Course is already registered: ${bundle.course.id}`);
    }

    this.#courses.set(bundle.course.id, bundle);
    return bundle;
  }

  get(courseId: CourseId): CourseBundle {
    const bundle = this.#courses.get(courseId);

    if (!bundle) {
      throw new Error(`Unknown course: ${courseId}`);
    }

    return bundle;
  }

  has(courseId: CourseId): boolean {
    return this.#courses.has(courseId);
  }

  list(): readonly CourseBundle[] {
    return [...this.#courses.values()];
  }
}
