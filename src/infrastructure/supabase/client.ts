import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { readRuntimeEnvironment, type RuntimeEnvironment } from '@/app/config/runtimeEnvironment';
import type { Database } from '@/infrastructure/supabase/database.types';

/**
 * Creates a browser client only when the dedicated LearningTemplate project is
 * explicitly configured. Constructing the client does not perform a request.
 * Phase 1 never calls this function from the application shell.
 */
export function createSupabaseClient(
  environment: RuntimeEnvironment = readRuntimeEnvironment(),
): SupabaseClient<Database> | null {
  if (!environment.supabase.enabled) {
    return null;
  }

  return createClient<Database>(environment.supabase.url, environment.supabase.publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}
