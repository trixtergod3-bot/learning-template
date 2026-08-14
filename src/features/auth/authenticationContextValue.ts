import { createContext } from 'react';

import type { UserProfile } from '@/engine/domain/sessions';
import type { AuthenticatedUser, SignUpResult } from '@/engine/ports/authGateway';

export type AuthenticationStatus = 'loading' | 'guest' | 'authenticated';

export interface AuthenticationContextValue {
  backendConfigured: boolean;
  status: AuthenticationStatus;
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  passwordRecovery: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  updateProfile(displayName: string | null, locale: string): Promise<void>;
}

export const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);
