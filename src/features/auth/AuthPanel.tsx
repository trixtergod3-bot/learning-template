import { FormEvent, useState } from 'react';

import { useAuthentication } from './useAuthentication';

type AuthMode = 'sign-in' | 'sign-up' | 'reset';

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication could not be completed.';
}

export function AuthPanel() {
  const { requestPasswordReset, signIn, signUp } = useAuthentication();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else if (mode === 'sign-up') {
        const result = await signUp(email, password);
        setMessage(
          result.requiresEmailConfirmation
            ? 'Check your inbox to confirm the account, then return here to sign in.'
            : 'Your account is ready.',
        );
      } else {
        await requestPasswordReset(email);
        setMessage('If that address has an account, a recovery link is on its way.');
      }
    } catch (nextError) {
      setError(messageFrom(nextError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-heading">
      <div className="auth-tabs" role="tablist" aria-label="Account action">
        <button
          aria-selected={mode === 'sign-in'}
          className={mode === 'sign-in' ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => setMode('sign-in')}
          role="tab"
          type="button"
        >
          Sign in
        </button>
        <button
          aria-selected={mode === 'sign-up'}
          className={mode === 'sign-up' ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => setMode('sign-up')}
          role="tab"
          type="button"
        >
          Create account
        </button>
      </div>

      <div>
        <p className="eyebrow">Supabase Auth</p>
        <h2 id="auth-heading">
          {mode === 'sign-in'
            ? 'Continue your learning'
            : mode === 'sign-up'
              ? 'Create your learner identity'
              : 'Recover your account'}
        </h2>
        <p className="auth-card__description">
          {mode === 'reset'
            ? 'We will send a secure password-recovery link to your email.'
            : 'Your Auth user ID—not an editable username—owns every private learning record.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        {mode !== 'reset' ? (
          <label>
            Password
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {mode === 'sign-up' ? <small>Use at least 8 characters.</small> : null}
          </label>
        ) : null}

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

        <button className="button button--primary" disabled={busy} type="submit">
          {busy
            ? 'Working…'
            : mode === 'sign-in'
              ? 'Sign in'
              : mode === 'sign-up'
                ? 'Create account'
                : 'Send recovery link'}
        </button>

        <button
          className="text-button"
          onClick={() => setMode(mode === 'reset' ? 'sign-in' : 'reset')}
          type="button"
        >
          {mode === 'reset' ? 'Back to sign in' : 'Forgot your password?'}
        </button>
      </form>
    </section>
  );
}
