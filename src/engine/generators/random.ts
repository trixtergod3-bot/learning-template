export interface RandomSource {
  next(): number;
  integer(minimum: number, maximum: number): number;
  pick<Value>(values: readonly Value[]): Value;
  shuffle<Value>(values: readonly Value[]): Value[];
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed: string): RandomSource {
  if (seed.trim().length === 0) {
    throw new Error('A deterministic random source requires a non-empty seed.');
  }

  let state = hashSeed(seed);

  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    integer(minimum, maximum) {
      if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
        throw new Error('Random integer bounds must be valid integers.');
      }

      return Math.floor(next() * (maximum - minimum + 1)) + minimum;
    },
    pick<Value>(values: readonly Value[]): Value {
      if (values.length === 0) {
        throw new Error('Cannot choose from an empty collection.');
      }

      return values[Math.floor(next() * values.length)] as Value;
    },
    shuffle<Value>(values: readonly Value[]): Value[] {
      const shuffled = [...values];

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const target = Math.floor(next() * (index + 1));
        const currentValue = shuffled[index] as Value;
        shuffled[index] = shuffled[target] as Value;
        shuffled[target] = currentValue;
      }

      return shuffled;
    },
  };
}
