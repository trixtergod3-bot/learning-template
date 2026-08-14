export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export type AuthenticationEvent =
  | 'initial-session'
  | 'signed-in'
  | 'signed-out'
  | 'password-recovery'
  | 'user-updated'
  | 'token-refreshed';

export interface AuthenticationSnapshot {
  event: AuthenticationEvent;
  user: AuthenticatedUser | null;
}

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export interface AuthGateway {
  subscribe(observer: (snapshot: AuthenticationSnapshot) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, redirectTo: string): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
