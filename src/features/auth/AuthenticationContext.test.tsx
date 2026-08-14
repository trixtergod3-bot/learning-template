import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AuthGateway, AuthenticationSnapshot, SignUpResult } from '@/engine/ports/authGateway';
import type { UserProfileRepository } from '@/engine/ports/userProfileRepository';
import { ProfilePage } from '@/features/profile/ProfilePage';

import { AuthenticationProvider } from './AuthenticationContext';

class FakeAuthGateway implements AuthGateway {
  observer: ((snapshot: AuthenticationSnapshot) => void) | null = null;
  signIn = vi.fn<(_: string, __: string) => Promise<void>>().mockResolvedValue(undefined);
  signUp = vi
    .fn<(_: string, __: string, ___: string) => Promise<SignUpResult>>()
    .mockResolvedValue({ requiresEmailConfirmation: true });
  signOut = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  requestPasswordReset = vi
    .fn<(_: string, __: string) => Promise<void>>()
    .mockResolvedValue(undefined);
  updatePassword = vi.fn<(_: string) => Promise<void>>().mockResolvedValue(undefined);

  subscribe(observer: (snapshot: AuthenticationSnapshot) => void) {
    this.observer = observer;
    observer({ event: 'initial-session', user: null });
    return () => {
      this.observer = null;
    };
  }

  emit(snapshot: AuthenticationSnapshot) {
    this.observer?.(snapshot);
  }
}

function renderProfile(
  authGateway: AuthGateway | null,
  userProfiles: UserProfileRepository | null,
) {
  return render(
    <AuthenticationProvider authGateway={authGateway} userProfiles={userProfiles}>
      <ProfilePage />
    </AuthenticationProvider>,
  );
}

describe('AuthenticationProvider', () => {
  it('preserves local guest mode when Supabase is not configured', () => {
    renderProfile(null, null);

    expect(screen.getByText('Local guest')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('connects the profile sign-in form to the authentication gateway', async () => {
    const user = userEvent.setup();
    const gateway = new FakeAuthGateway();
    renderProfile(gateway, null);

    await user.type(screen.getByLabelText('Email'), 'learner@example.com');
    await user.type(screen.getByLabelText('Password'), 'secure-pass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(gateway.signIn).toHaveBeenCalledWith('learner@example.com', 'secure-pass');
    });
  });

  it('loads and updates only the authenticated user profile', async () => {
    const user = userEvent.setup();
    const gateway = new FakeAuthGateway();
    const profiles: UserProfileRepository = {
      getOrCreate: vi.fn().mockResolvedValue({
        userId: 'user-one',
        displayName: 'Learner One',
        locale: 'en',
      }),
      update: vi.fn().mockResolvedValue({
        userId: 'user-one',
        displayName: 'Updated Learner',
        locale: 'sl-SI',
      }),
    };

    renderProfile(gateway, profiles);
    act(() => {
      gateway.emit({
        event: 'signed-in',
        user: { id: 'user-one', email: 'learner@example.com' },
      });
    });

    expect(await screen.findByDisplayValue('Learner One')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Display name'));
    await user.type(screen.getByLabelText('Display name'), 'Updated Learner');
    await user.selectOptions(screen.getByLabelText('Learning language'), 'sl-SI');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(profiles.update).toHaveBeenCalledWith('user-one', 'Updated Learner', 'sl-SI');
    });
  });
});
