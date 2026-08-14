import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';
import { foundationLabGenerator } from '@/courses/fixtures/foundationLab/foundationLabGenerator';
import { CourseRegistry } from '@/engine/content/courseRegistry';
import { GeneratorRegistry } from '@/engine/generators/generatorRegistry';

export const courseRegistry = new CourseRegistry();
courseRegistry.register(foundationLabCourse);

export const generatorRegistry = new GeneratorRegistry();
generatorRegistry.register(foundationLabGenerator);
