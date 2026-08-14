import type { AuthGateway } from '@/engine/ports/authGateway';
import type { UserProfileRepository } from '@/engine/ports/userProfileRepository';
import { createSupabaseClient } from '@/infrastructure/supabase/client';
import { SupabaseAuthGateway } from '@/infrastructure/supabase/supabaseAuthGateway';
import { SupabaseUserProfileRepository } from '@/infrastructure/supabase/supabaseUserProfileRepository';

export interface ApplicationServices {
  authGateway: AuthGateway | null;
  userProfiles: UserProfileRepository | null;
}

export function createApplicationServices(): ApplicationServices {
  const client = createSupabaseClient();

  if (!client) {
    return { authGateway: null, userProfiles: null };
  }

  return {
    authGateway: new SupabaseAuthGateway(client),
    userProfiles: new SupabaseUserProfileRepository(client),
  };
}

export const applicationServices = createApplicationServices();
