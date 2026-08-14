import { appConfiguration } from '@/app/config/appConfig';
import { courseConfigurations, courseRegistry } from '@/app/registries';

export const enabledCourseBundles = appConfiguration.enabledCourseIds.map((id) => {
  const bundle = courseRegistry.get(id);
  const configuration = courseConfigurations.get(id);

  if (!configuration) {
    throw new Error(`Enabled course is missing its configuration: ${id}`);
  }

  return bundle;
});

export const defaultCourseBundle = courseRegistry.get(appConfiguration.defaultCourseId);

const defaultConfiguration = courseConfigurations.get(appConfiguration.defaultCourseId);

if (!defaultConfiguration) {
  throw new Error(
    `Default course is missing its configuration: ${appConfiguration.defaultCourseId}`,
  );
}

export const defaultCourseConfiguration = defaultConfiguration;
