import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationServicesProvider } from '@/app/ApplicationServicesProvider';
import type { AuthGateway } from '@/engine/ports/authGateway';
import type { LearningRepository } from '@/engine/ports/learningRepository';
import { skillId } from '@/engine/domain/identifiers';
import { AuthenticationProvider } from '@/features/auth/AuthenticationContext';

import { ProgressPage } from './ProgressPage';

const guestServices = { authGateway: null, userProfiles: null, learningRepository: null };

describe('ProgressPage', () => {
  it('explains the private progress boundary to guests', () => {
    render(
      <MemoryRouter>
        <ApplicationServicesProvider services={guestServices}>
          <AuthenticationProvider authGateway={null} userProfiles={null}>
            <ProgressPage />
          </AuthenticationProvider>
        </ApplicationServicesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /practice freely/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to track progress/i })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  it('renders server-owned mastery and actionable weak-skill links', async () => {
    const authGateway: AuthGateway = {
      subscribe(observer) {
        observer({
          event: 'initial-session',
          user: { id: 'progress-user', email: 'learner@example.test' },
        });
        return () => undefined;
      },
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
      updatePassword: vi.fn(),
    };
    const learningRepository: LearningRepository = {
      saveSession: vi.fn(),
      findSession: vi.fn(),
      appendAttempt: vi.fn(),
      listAttempts: vi.fn(),
      findSkillMastery: vi.fn(),
      listCourseMastery: vi.fn().mockResolvedValue([
        {
          skillId: skillId('astrology.elements'),
          evidenceCount: 5,
          masteryScore: 80,
          lastPracticedAt: '2026-08-14T05:00:00.000Z',
          calculationVersion: 'mastery-v1',
        },
      ]),
    };

    render(
      <MemoryRouter>
        <ApplicationServicesProvider
          services={{ authGateway, userProfiles: null, learningRepository }}
        >
          <AuthenticationProvider authGateway={authGateway} userProfiles={null}>
            <ProgressPage />
          </AuthenticationProvider>
        </ApplicationServicesProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /a clear map of what you know/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Identify zodiac elements mastery' }),
    ).toHaveAttribute('aria-valuenow', '80');
    expect(screen.getByText('1/8')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /practice now/i })[0]).toHaveAttribute(
      'href',
      expect.stringContaining('/practice/drill?topic='),
    );
  });
});
