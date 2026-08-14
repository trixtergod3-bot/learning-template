import type { AuthGateway } from '@/engine/ports/authGateway';
import type { LearningRepository } from '@/engine/ports/learningRepository';
import type { UserProfileRepository } from '@/engine/ports/userProfileRepository';
import { createSupabaseClient } from '@/infrastructure/supabase/client';
import { SupabaseAuthGateway } from '@/infrastructure/supabase/supabaseAuthGateway';
import { SupabaseLearningRepository } from '@/infrastructure/supabase/supabaseLearningRepository';
import { SupabaseUserProfileRepository } from '@/infrastructure/supabase/supabaseUserProfileRepository';

export interface ApplicationServices {
  authGateway: AuthGateway | null;
  userProfiles: UserProfileRepository | null;
  learningRepository: LearningRepository | null;
}

export function createApplicationServices(): ApplicationServices {
  const client = createSupabaseClient();

  if (!client) {
    return { authGateway: null, userProfiles: null, learningRepository: null };
  }

  return {
    authGateway: new SupabaseAuthGateway(client),
    userProfiles: new SupabaseUserProfileRepository(client),
    learningRepository: new SupabaseLearningRepository(client),
  };
}

export const applicationServices = createApplicationServices();
