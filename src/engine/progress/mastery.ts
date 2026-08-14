import type { CourseBundle } from '@/engine/content/courseBundle';
import type { SkillId } from '@/engine/domain/identifiers';
import type { SkillMastery } from '@/engine/domain/sessions';

export type MasteryStatus = 'not-started' | 'building' | 'developing' | 'strong';

export interface SkillProgress {
  skill: CourseBundle['skills'][number];
  mastery: SkillMastery;
  status: MasteryStatus;
  topicId: string | null;
  lessonId: string | null;
}

export interface ModuleProgress {
  id: string;
  title: string;
  masteryScore: number;
  practicedSkills: number;
  skillCount: number;
}

export interface CourseProgress {
  masteryScore: number;
  evidenceCount: number;
  practicedSkills: number;
  strongSkills: number;
  skills: readonly SkillProgress[];
  modules: readonly ModuleProgress[];
  suggestedSkills: readonly SkillProgress[];
}

const emptyMastery = (skillId: SkillId): SkillMastery => ({
  skillId,
  evidenceCount: 0,
  masteryScore: 0,
  calculationVersion: 'mastery-v1',
});

export function masteryStatus(mastery: SkillMastery): MasteryStatus {
  if (mastery.evidenceCount === 0) return 'not-started';
  if (mastery.masteryScore < 50) return 'building';
  if (mastery.masteryScore < 75) return 'developing';
  return 'strong';
}

export function buildCourseProgress(
  bundle: CourseBundle,
  masteryRecords: readonly SkillMastery[],
): CourseProgress {
  const masteryBySkill = new Map(masteryRecords.map((record) => [record.skillId, record]));
  const topicBySkill = new Map(
    bundle.topics.flatMap((topic) => topic.skillIds.map((skillId) => [skillId, topic.id] as const)),
  );
  const skills = bundle.skills.map((skill): SkillProgress => {
    const mastery = masteryBySkill.get(skill.id) ?? emptyMastery(skill.id);
    const topicId = topicBySkill.get(skill.id) ?? null;
    const topic = bundle.topics.find(({ id }) => id === topicId);
    return {
      skill,
      mastery,
      status: masteryStatus(mastery),
      topicId,
      lessonId: topic?.lessonIds[0] ?? null,
    };
  });
  const modules = bundle.modules.map((module): ModuleProgress => {
    const topicIds = new Set(module.topicIds);
    const moduleSkills = skills.filter((skill) => {
      const topic = bundle.topics.find(({ id }) => id === skill.topicId);
      return topic ? topicIds.has(topic.id) : false;
    });

    return {
      id: module.id,
      title: module.title,
      masteryScore: average(moduleSkills.map(({ mastery }) => mastery.masteryScore)),
      practicedSkills: moduleSkills.filter(({ mastery }) => mastery.evidenceCount > 0).length,
      skillCount: moduleSkills.length,
    };
  });
  const evidenceCount = skills.reduce((sum, { mastery }) => sum + mastery.evidenceCount, 0);

  return {
    masteryScore: average(skills.map(({ mastery }) => mastery.masteryScore)),
    evidenceCount,
    practicedSkills: skills.filter(({ mastery }) => mastery.evidenceCount > 0).length,
    strongSkills: skills.filter(({ status }) => status === 'strong').length,
    skills,
    modules,
    suggestedSkills: [...skills]
      .sort(
        (left, right) =>
          left.mastery.masteryScore - right.mastery.masteryScore ||
          left.mastery.evidenceCount - right.mastery.evidenceCount ||
          left.skill.title.localeCompare(right.skill.title),
      )
      .slice(0, 3),
  };
}

function average(values: readonly number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
