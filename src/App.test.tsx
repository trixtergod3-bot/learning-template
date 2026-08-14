import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/App';

describe('App', () => {
  it('renders the configured learning shell in local mode', async () => {
    render(<App services={{ authGateway: null, userProfiles: null }} />);

    expect(
      await screen.findByRole('heading', {
        name: /one place to learn deeply, practice deliberately, and master more\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Local mode')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
  });
});
