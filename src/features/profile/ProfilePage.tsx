import { DatabaseZap, HardDrive, KeyRound, LoaderCircle } from 'lucide-react';

import { AuthPanel } from '@/features/auth/AuthPanel';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { PasswordRecoveryPanel } from '@/features/auth/PasswordRecoveryPanel';
import { AuthenticatedProfile } from '@/features/profile/AuthenticatedProfile';
import { PageHeader } from '@/ui/components/PageHeader';

export function ProfilePage() {
  const { backendConfigured, passwordRecovery, status } = useAuthentication();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Profile"
        title="One secure identity across every course"
        description="Phase 2 connects Supabase Auth to user-owned profiles while keeping the learning engine and course content independent from the backend."
      />

      {!backendConfigured ? (
        <section className="profile-panel">
          <div className="profile-avatar" aria-hidden="true">
            <HardDrive size={32} />
          </div>
          <div>
            <span className="badge">Local guest</span>
            <h2>The app still works without cloud configuration</h2>
            <p>
              Add the dedicated LearningTemplate project URL and publishable key to an ignored
              <code>.env.local</code> file to activate sign-up, sign-in, recovery, and profiles.
            </p>
          </div>
        </section>
      ) : status === 'loading' ? (
        <section className="profile-panel" aria-live="polite">
          <LoaderCircle className="spin" aria-hidden size={34} />
          <div>
            <span className="badge">Secure session</span>
            <h2>Checking your session…</h2>
          </div>
        </section>
      ) : status === 'authenticated' ? (
        <>
          {passwordRecovery ? <PasswordRecoveryPanel /> : null}
          <AuthenticatedProfile />
        </>
      ) : (
        <AuthPanel />
      )}

      <div className="security-grid">
        <article>
          <KeyRound aria-hidden size={23} />
          <h2>Canonical ownership</h2>
          <p>Every private row is owned by the immutable ID issued by Supabase Auth.</p>
        </article>
        <article>
          <DatabaseZap aria-hidden size={23} />
          <h2>RLS on every table</h2>
          <p>Authenticated learners can see only their own sessions, attempts, and progress.</p>
        </article>
        <article>
          <HardDrive aria-hidden size={23} />
          <h2>Guest-safe boundary</h2>
          <p>No configured backend still means no cloud client and no authentication request.</p>
        </article>
      </div>
    </div>
  );
}
