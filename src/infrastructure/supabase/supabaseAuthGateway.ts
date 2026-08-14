import type { AuthChangeEvent, SupabaseClient, User } from '@supabase/supabase-js';

import type {
  AuthGateway,
  AuthenticatedUser,
  AuthenticationEvent,
  SignUpResult,
} from '@/engine/ports/authGateway';
import type { Database } from '@/infrastructure/supabase/database.types';

const eventMap: Record<AuthChangeEvent, AuthenticationEvent> = {
  INITIAL_SESSION: 'initial-session',
  PASSWORD_RECOVERY: 'password-recovery',
  SIGNED_IN: 'signed-in',
  SIGNED_OUT: 'signed-out',
  TOKEN_REFRESHED: 'token-refreshed',
  USER_UPDATED: 'user-updated',
  MFA_CHALLENGE_VERIFIED: 'user-updated',
};

function toAuthenticatedUser(user: User | null | undefined): AuthenticatedUser | null {
  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email ?? null };
}

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseClient<Database>) {}

  subscribe(observer: Parameters<AuthGateway['subscribe']>[0]) {
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      observer({ event: eventMap[event], user: toAuthenticatedUser(session?.user) });
    });

    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp(email: string, password: string, redirectTo: string): Promise<SignUpResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) throw error;
    return { requiresEmailConfirmation: data.session === null };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }

  async requestPasswordReset(email: string, redirectTo: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });
    if (error) throw error;
  }
}
