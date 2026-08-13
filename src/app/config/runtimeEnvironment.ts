import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
};

const RuntimeEnvironmentInputSchema = z
  .object({
    VITE_SUPABASE_URL: z.preprocess(
      emptyToUndefined,
      z
        .url()
        .refine((value) => value.startsWith('https://'), 'Supabase URL must use HTTPS.')
        .optional(),
    ),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.preprocess(
      emptyToUndefined,
      z.string().trim().startsWith('sb_publishable_').optional(),
    ),
  })
  .superRefine((environment, context) => {
    const hasUrl = Boolean(environment.VITE_SUPABASE_URL);
    const hasKey = Boolean(environment.VITE_SUPABASE_PUBLISHABLE_KEY);

    if (hasUrl !== hasKey) {
      context.addIssue({
        code: 'custom',
        message: 'Supabase URL and publishable key must be configured together.',
      });
    }
  });

export type RuntimeEnvironment =
  | { supabase: { enabled: false } }
  | { supabase: { enabled: true; url: string; publishableKey: string } };

export function readRuntimeEnvironment(
  source: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>,
): RuntimeEnvironment {
  const environment = RuntimeEnvironmentInputSchema.parse(source);

  if (!environment.VITE_SUPABASE_URL || !environment.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return { supabase: { enabled: false } };
  }

  return {
    supabase: {
      enabled: true,
      url: environment.VITE_SUPABASE_URL,
      publishableKey: environment.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };
}
