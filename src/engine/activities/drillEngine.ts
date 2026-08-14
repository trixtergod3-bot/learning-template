import type {
  ActivityItem,
  ActivityResult,
  ActivitySource,
  Difficulty,
} from '@/engine/domain/activities';
import type { ItemReference } from '@/engine/domain/sessions';
import type { GeneratorRegistry } from '@/engine/generators/generatorRegistry';
import { createSeededRandom } from '@/engine/generators/random';

export type DrillActivityItem = Extract<
  ActivityItem,
  { kind: 'single-choice' | 'multi-select' | 'numeric-input' | 'text-input' }
>;

export interface DrillQuestion {
  item: DrillActivityItem;
  itemRef: ItemReference;
}

export type DrillResponse = string | number | readonly string[];

export function isDrillItem(item: ActivityItem): item is DrillActivityItem {
  return item.kind !== 'flashcard';
}

export function buildStaticDrill(
  items: readonly ActivityItem[],
  questionCount: number,
  seed: string,
): DrillQuestion[] {
  assertQuestionCount(questionCount);
  const drillItems = items.filter(isDrillItem);

  if (drillItems.length === 0) throw new Error('A drill requires at least one answerable item.');

  return createSeededRandom(seed)
    .shuffle(drillItems)
    .slice(0, questionCount)
    .map((item) => ({
      item,
      itemRef: { itemId: item.id, contentVersion: item.version },
    }));
}

export function buildGeneratedDrill(
  source: Extract<ActivitySource, { kind: 'generated' }>,
  questionCount: number,
  seed: string,
  registry: GeneratorRegistry,
  options: { difficulty?: Difficulty; locale?: string } = {},
): DrillQuestion[] {
  assertQuestionCount(questionCount);

  return Array.from({ length: questionCount }, (_, sequence) => {
    const item = registry.generate(source, {
      seed,
      sequence,
      locale: options.locale ?? 'en',
      ...(options.difficulty ? { difficulty: options.difficulty } : {}),
    });

    if (!isDrillItem(item)) throw new Error('A drill generator cannot produce a flashcard.');

    return {
      item,
      itemRef: {
        itemId: item.id,
        contentVersion: item.version,
        generatorId: source.generatorId,
        generatorVersion: source.generatorVersion,
        seed,
        sequence,
      },
    };
  });
}

export function evaluateDrillResponse(
  item: DrillActivityItem,
  response: DrillResponse,
): ActivityResult {
  let correct: boolean;

  if (item.kind === 'single-choice') {
    correct = typeof response === 'string' && response === item.correctOptionId;
  } else if (item.kind === 'multi-select') {
    const selected = new Set(Array.isArray(response) ? response : []);
    const expected = new Set(item.correctOptionIds);
    correct =
      selected.size === expected.size && [...expected].every((optionId) => selected.has(optionId));
  } else if (item.kind === 'numeric-input') {
    const numericResponse = typeof response === 'number' ? response : Number(response);
    correct =
      Number.isFinite(numericResponse) &&
      Math.abs(numericResponse - item.answer) <= (item.tolerance ?? 0);
  } else {
    const textResponse = typeof response === 'string' ? response : '';
    const normalize = (value: string) => {
      if (item.normalization === 'exact') return value;
      if (item.normalization === 'case-insensitive') return value.toLocaleLowerCase();
      return value.trim().toLocaleLowerCase();
    };
    correct = item.acceptedAnswers.some((answer) => normalize(answer) === normalize(textResponse));
  }

  return {
    correct,
    score: correct ? 1 : 0,
    maxScore: 1,
    ...(item.explanation ? { feedback: item.explanation } : {}),
  };
}

export function drillAnswerLabel(item: DrillActivityItem): string {
  if (item.kind === 'single-choice') {
    return (
      item.options.find(({ id }) => id === item.correctOptionId)?.label ?? item.correctOptionId
    );
  }
  if (item.kind === 'multi-select') {
    const correctIds = new Set(item.correctOptionIds);
    return item.options
      .filter(({ id }) => correctIds.has(id))
      .map(({ label }) => label)
      .join(', ');
  }
  if (item.kind === 'numeric-input') return `${item.answer}${item.unit ? ` ${item.unit}` : ''}`;
  return item.acceptedAnswers[0] ?? '';
}

function assertQuestionCount(questionCount: number) {
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    throw new Error('A drill requires a positive whole-number question count.');
  }
}
