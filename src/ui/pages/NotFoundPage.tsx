import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <span>404</span>
      <h1>This learning path does not exist.</h1>
      <p>The route may have moved, or it has not been enabled in this application configuration.</p>
      <Link className="button button--primary" to="/">
        <ArrowLeft aria-hidden size={18} /> Return home
      </Link>
    </section>
  );
}
