import { FormEvent, useState } from 'react';

import { useAuthentication } from './useAuthentication';

export function PasswordRecoveryPanel() {
  const { updatePassword } = useAuthentication();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await updatePassword(password);
      setComplete(true);
      setPassword('');
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'The password could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card auth-card--recovery" aria-labelledby="recovery-heading">
      <div>
        <p className="eyebrow">Secure recovery</p>
        <h2 id="recovery-heading">Choose a new password</h2>
        <p className="auth-card__description">
          This form appears only after Supabase validates your recovery link.
        </p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label>
          New password
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? (
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
        ) : null}
        {complete ? (
          <p className="form-message" role="status">
            Password updated.
          </p>
        ) : null}
        <button className="button button--primary" disabled={busy} type="submit">
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
