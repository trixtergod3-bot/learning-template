import { describe, expect, it } from 'vitest';

import { readRuntimeEnvironment } from './runtimeEnvironment';

describe('readRuntimeEnvironment', () => {
  it('keeps Supabase disabled when no environment is configured', () => {
    expect(readRuntimeEnvironment({})).toEqual({ supabase: { enabled: false } });
  });

  it('accepts a dedicated publishable frontend configuration', () => {
    expect(
      readRuntimeEnvironment({
        VITE_SUPABASE_URL: 'https://learning-template.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
      }),
    ).toEqual({
      supabase: {
        enabled: true,
        url: 'https://learning-template.supabase.co',
        publishableKey: 'sb_publishable_example',
      },
    });
  });

  it('rejects partial and legacy configuration', () => {
    expect(() =>
      readRuntimeEnvironment({ VITE_SUPABASE_URL: 'https://learning-template.supabase.co' }),
    ).toThrow(/configured together/i);
    expect(() =>
      readRuntimeEnvironment({
        VITE_SUPABASE_URL: 'https://learning-template.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'legacy-anon-value',
      }),
    ).toThrow();
  });
});
