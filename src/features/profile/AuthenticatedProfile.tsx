import { FormEvent, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';

import type { UserProfile } from '@/engine/domain/sessions';
import { useAuthentication } from '@/features/auth/useAuthentication';

export function AuthenticatedProfile() {
  const { profile, profileError, profileLoading, signOut, updateProfile, user } =
    useAuthentication();

  if (!profile) {
    return (
      <section className="profile-account" aria-live="polite">
        <div className="profile-account__identity">
          <div className="profile-avatar" aria-hidden="true">
            <UserRound size={34} />
          </div>
          <div>
            <span className="badge">Authenticated learner</span>
            <h2>{profileLoading ? 'Loading your profile…' : 'Profile unavailable'}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="profile-form">
          {profileError ? (
            <p className="form-message form-message--error" role="alert">
              {profileError}
            </p>
          ) : null}
          <button className="button button--secondary" onClick={() => void signOut()} type="button">
            <LogOut aria-hidden size={17} />
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <ProfileEditor
      key={profile.userId}
      email={user?.email ?? null}
      profile={profile}
      signOut={signOut}
      updateProfile={updateProfile}
    />
  );
}

interface ProfileEditorProps {
  email: string | null;
  profile: UserProfile;
  signOut(): Promise<void>;
  updateProfile(displayName: string | null, locale: string): Promise<void>;
}

function ProfileEditor({ email, profile, signOut, updateProfile }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [locale, setLocale] = useState(profile.locale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfile(displayName.trim() || null, locale);
      setMessage('Profile saved.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'The profile could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="profile-account" aria-labelledby="profile-account-heading">
      <div className="profile-account__identity">
        <div className="profile-avatar" aria-hidden="true">
          <UserRound size={34} />
        </div>
        <div>
          <span className="badge">Authenticated learner</span>
          <h2 id="profile-account-heading">{profile.displayName || 'Your learner profile'}</h2>
          <p>{email}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={save}>
        <label>
          Display name
          <input
            maxLength={80}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How should we address you?"
            type="text"
            value={displayName}
          />
        </label>
        <label>
          Learning language
          <select onChange={(event) => setLocale(event.target.value)} value={locale}>
            <option value="en">English</option>
            <option value="sl-SI">Slovenščina</option>
          </select>
        </label>

        {error ? (
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="form-message" role="status">
            {message}
          </p>
        ) : null}

        <div className="profile-form__actions">
          <button className="button button--primary" disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Save profile'}
          </button>
          <button className="button button--secondary" onClick={() => void signOut()} type="button">
            <LogOut aria-hidden size={17} />
            Sign out
          </button>
        </div>
      </form>
    </section>
  );
}
