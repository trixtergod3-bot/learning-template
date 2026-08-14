import { astrologyConfiguration, astrologyCourse } from '@/courses/astrology/astrologyCourse';
import { CourseRegistry } from '@/engine/content/courseRegistry';
import { GeneratorRegistry } from '@/engine/generators/generatorRegistry';

export const courseRegistry = new CourseRegistry();
courseRegistry.register(astrologyCourse);

export const courseConfigurations = new Map([
  [astrologyConfiguration.courseId, astrologyConfiguration],
]);

export const generatorRegistry = new GeneratorRegistry();
