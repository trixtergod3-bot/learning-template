import { DatabaseZap, HardDrive, KeyRound, UserRound } from 'lucide-react';

import { PageHeader } from '@/ui/components/PageHeader';

export function ProfilePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Profile"
        title="Guest-first today, secure identity next"
        description="The shell works without backend configuration. Phase 2 will connect only the dedicated LearningTemplate project through Supabase Auth."
      />

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          <UserRound size={34} />
        </div>
        <div>
          <span className="badge">Local guest</span>
          <h2>Your learning can begin without an account</h2>
          <p>
            A persistence port isolates the learning engine from storage. Local guest evidence can
            later be imported idempotently after real authentication.
          </p>
        </div>
      </section>

      <div className="security-grid">
        <article>
          <HardDrive aria-hidden size={23} />
          <h2>Local by default</h2>
          <p>No configured backend means no cloud client and no network request.</p>
        </article>
        <article>
          <KeyRound aria-hidden size={23} />
          <h2>Canonical identity</h2>
          <p>Authenticated ownership will map to Supabase Auth—not a username or browser UUID.</p>
        </article>
        <article>
          <DatabaseZap aria-hidden size={23} />
          <h2>Database as code</h2>
          <p>Phase 2 will add reviewed migrations, explicit grants, RLS, and policy tests.</p>
        </article>
      </div>
    </div>
  );
}
