import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import type { UserProfile } from '@/engine/domain/sessions';
import type { AuthGateway, AuthenticatedUser } from '@/engine/ports/authGateway';
import type { UserProfileRepository } from '@/engine/ports/userProfileRepository';

import {
  AuthenticationContext,
  type AuthenticationContextValue,
  type AuthenticationStatus,
} from './authenticationContextValue';

interface AuthenticationProviderProps extends PropsWithChildren {
  authGateway: AuthGateway | null;
  userProfiles: UserProfileRepository | null;
}

function authenticationRedirectUrl() {
  return window.location.origin;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The profile request failed.';
}

export function AuthenticationProvider({
  authGateway,
  userProfiles,
  children,
}: AuthenticationProviderProps) {
  const [authentication, setAuthentication] = useState<{
    status: AuthenticationStatus;
    user: AuthenticatedUser | null;
    passwordRecovery: boolean;
  }>({ status: 'loading', user: null, passwordRecovery: false });
  const [profileResult, setProfileResult] = useState<{
    userId: string;
    profile: UserProfile | null;
    error: string | null;
  } | null>(null);

  const backendConfigured = authGateway !== null;
  const status = backendConfigured ? authentication.status : 'guest';
  const user = backendConfigured ? authentication.user : null;
  const passwordRecovery = backendConfigured ? authentication.passwordRecovery : false;
  const profileMatchesUser = Boolean(user && profileResult?.userId === user.id);
  const profile = profileMatchesUser ? (profileResult?.profile ?? null) : null;
  const profileError = profileMatchesUser ? (profileResult?.error ?? null) : null;
  const profileLoading = Boolean(user && userProfiles && !profileMatchesUser);

  useEffect(() => {
    if (!authGateway) return;

    return authGateway.subscribe((snapshot) => {
      setAuthentication({
        passwordRecovery: snapshot.event === 'password-recovery',
        user: snapshot.user,
        status: snapshot.user ? 'authenticated' : 'guest',
      });
    });
  }, [authGateway]);

  useEffect(() => {
    let active = true;

    if (!user || !userProfiles) return;

    void userProfiles
      .getOrCreate(user.id)
      .then((nextProfile) => {
        if (active) {
          setProfileResult({ userId: user.id, profile: nextProfile, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setProfileResult({ userId: user.id, profile: null, error: errorMessage(error) });
        }
      });

    return () => {
      active = false;
    };
  }, [user, userProfiles]);

  const value = useMemo<AuthenticationContextValue>(
    () => ({
      backendConfigured,
      status,
      user,
      profile,
      profileLoading,
      profileError,
      passwordRecovery,
      signIn: async (email, password) => {
        if (!authGateway) throw new Error('Supabase is not configured.');
        await authGateway.signIn(email, password);
      },
      signUp: async (email, password) => {
        if (!authGateway) throw new Error('Supabase is not configured.');
        return authGateway.signUp(email, password, authenticationRedirectUrl());
      },
      signOut: async () => {
        if (!authGateway) return;
        await authGateway.signOut();
      },
      requestPasswordReset: async (email) => {
        if (!authGateway) throw new Error('Supabase is not configured.');
        await authGateway.requestPasswordReset(email, authenticationRedirectUrl());
      },
      updatePassword: async (password) => {
        if (!authGateway) throw new Error('Supabase is not configured.');
        await authGateway.updatePassword(password);
        setAuthentication((current) => ({ ...current, passwordRecovery: false }));
      },
      updateProfile: async (displayName, locale) => {
        if (!user || !userProfiles) throw new Error('Sign in before updating your profile.');
        const nextProfile = await userProfiles.update(user.id, displayName, locale);
        setProfileResult({ userId: user.id, profile: nextProfile, error: null });
      },
    }),
    [
      authGateway,
      backendConfigured,
      passwordRecovery,
      profile,
      profileError,
      profileLoading,
      status,
      user,
      userProfiles,
    ],
  );

  return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>;
}
