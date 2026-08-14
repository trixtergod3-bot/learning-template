import { z } from 'zod';

import { ActivityDefinitionSchema, ActivityItemSchema } from '../domain/activities';
import {
  CourseSchema,
  LessonSchema,
  ModuleSchema,
  SkillSchema,
  TopicSchema,
} from '../domain/hierarchy';

function reportDuplicates(
  values: readonly { id: string }[],
  label: string,
  context: z.core.ParsePayload,
  path: PropertyKey[],
) {
  const seen = new Set<string>();

  values.forEach((value, index) => {
    if (seen.has(value.id)) {
      context.issues.push({
        code: 'custom',
        input: value.id,
        message: `Duplicate ${label} ID: ${value.id}`,
        path: [...path, index, 'id'],
      });
    }

    seen.add(value.id);
  });
}

export const CourseBundleSchema = z
  .object({
    course: CourseSchema,
    modules: z.array(ModuleSchema),
    topics: z.array(TopicSchema),
    lessons: z.array(LessonSchema),
    skills: z.array(SkillSchema),
    items: z.array(ActivityItemSchema),
    activities: z.array(ActivityDefinitionSchema),
  })
  .superRefine((bundle, context) => {
    reportDuplicates(bundle.modules, 'module', context, ['modules']);
    reportDuplicates(bundle.topics, 'topic', context, ['topics']);
    reportDuplicates(bundle.lessons, 'lesson', context, ['lessons']);
    reportDuplicates(bundle.skills, 'skill', context, ['skills']);
    reportDuplicates(bundle.items, 'item', context, ['items']);
    reportDuplicates(bundle.activities, 'activity', context, ['activities']);

    const moduleIds = new Set(bundle.modules.map(({ id }) => id));
    const topicIds = new Set(bundle.topics.map(({ id }) => id));
    const lessonIds = new Set(bundle.lessons.map(({ id }) => id));
    const skillIds = new Set(bundle.skills.map(({ id }) => id));
    const itemIds = new Set(bundle.items.map(({ id }) => id));
    const activityIds = new Set(bundle.activities.map(({ id }) => id));

    const requireReference = (
      exists: boolean,
      message: string,
      path: PropertyKey[],
      input: unknown,
    ) => {
      if (!exists) {
        context.addIssue({ code: 'custom', message, path, input });
      }
    };

    bundle.course.moduleIds.forEach((id, index) => {
      requireReference(
        moduleIds.has(id),
        `Unknown module ID: ${id}`,
        ['course', 'moduleIds', index],
        id,
      );
    });

    bundle.modules.forEach((module, moduleIndex) => {
      requireReference(
        module.courseId === bundle.course.id,
        `Module ${module.id} belongs to a different course.`,
        ['modules', moduleIndex, 'courseId'],
        module.courseId,
      );

      module.topicIds.forEach((id, index) => {
        requireReference(
          topicIds.has(id),
          `Unknown topic ID: ${id}`,
          ['modules', moduleIndex, 'topicIds', index],
          id,
        );
      });

      module.prerequisiteModuleIds.forEach((id, index) => {
        requireReference(
          moduleIds.has(id) && id !== module.id,
          `Invalid prerequisite module ID: ${id}`,
          ['modules', moduleIndex, 'prerequisiteModuleIds', index],
          id,
        );
      });
    });

    bundle.topics.forEach((topic, topicIndex) => {
      requireReference(
        moduleIds.has(topic.moduleId),
        `Unknown module ID: ${topic.moduleId}`,
        ['topics', topicIndex, 'moduleId'],
        topic.moduleId,
      );

      topic.lessonIds.forEach((id, index) => {
        requireReference(
          lessonIds.has(id),
          `Unknown lesson ID: ${id}`,
          ['topics', topicIndex, 'lessonIds', index],
          id,
        );
      });

      topic.activityIds.forEach((id, index) => {
        requireReference(
          activityIds.has(id),
          `Unknown activity ID: ${id}`,
          ['topics', topicIndex, 'activityIds', index],
          id,
        );
      });

      topic.skillIds.forEach((id, index) => {
        requireReference(
          skillIds.has(id),
          `Unknown skill ID: ${id}`,
          ['topics', topicIndex, 'skillIds', index],
          id,
        );
      });
    });

    bundle.lessons.forEach((lesson, lessonIndex) => {
      requireReference(
        topicIds.has(lesson.topicId),
        `Unknown topic ID: ${lesson.topicId}`,
        ['lessons', lessonIndex, 'topicId'],
        lesson.topicId,
      );

      lesson.activityIds.forEach((id, index) => {
        requireReference(
          activityIds.has(id),
          `Unknown activity ID: ${id}`,
          ['lessons', lessonIndex, 'activityIds', index],
          id,
        );
      });
    });

    bundle.skills.forEach((skill, skillIndex) => {
      requireReference(
        skill.courseId === bundle.course.id,
        `Skill ${skill.id} belongs to a different course.`,
        ['skills', skillIndex, 'courseId'],
        skill.courseId,
      );

      if (skill.parentSkillId) {
        requireReference(
          skillIds.has(skill.parentSkillId) && skill.parentSkillId !== skill.id,
          `Invalid parent skill ID: ${skill.parentSkillId}`,
          ['skills', skillIndex, 'parentSkillId'],
          skill.parentSkillId,
        );
      }
    });

    bundle.items.forEach((item, itemIndex) => {
      item.skillIds.forEach((id, index) => {
        requireReference(
          skillIds.has(id),
          `Unknown skill ID: ${id}`,
          ['items', itemIndex, 'skillIds', index],
          id,
        );
      });
    });

    bundle.activities.forEach((activity, activityIndex) => {
      requireReference(
        activity.courseId === bundle.course.id,
        `Activity ${activity.id} belongs to a different course.`,
        ['activities', activityIndex, 'courseId'],
        activity.courseId,
      );

      activity.skillIds.forEach((id, index) => {
        requireReference(
          skillIds.has(id),
          `Unknown skill ID: ${id}`,
          ['activities', activityIndex, 'skillIds', index],
          id,
        );
      });

      if (activity.source.kind === 'static') {
        activity.source.itemIds.forEach((id, index) => {
          requireReference(
            itemIds.has(id),
            `Unknown item ID: ${id}`,
            ['activities', activityIndex, 'source', 'itemIds', index],
            id,
          );
        });
      }
    });
  });

export type CourseBundle = z.infer<typeof CourseBundleSchema>;

export function defineCourseBundle(input: unknown): CourseBundle {
  return CourseBundleSchema.parse(input);
}
