import { describe, expect, it } from 'vitest';

import { createSupabaseClient } from './client';

describe('createSupabaseClient', () => {
  it('does not initialize backend infrastructure for an unconfigured app', () => {
    expect(createSupabaseClient({ supabase: { enabled: false } })).toBeNull();
  });
});
