import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthenticationProvider } from '@/features/auth/AuthenticationContext';

import { DrillPage } from './DrillPage';

function renderDrillPage(route = '/practice/drill') {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthenticationProvider authGateway={null} userProfiles={null}>
        <DrillPage />
      </AuthenticationProvider>
    </MemoryRouter>,
  );
}

describe('DrillPage', () => {
  it('builds a rapid round from selected Astrology topics', async () => {
    const user = userEvent.setup();
    renderDrillPage('/practice/drill?topic=astrology.elements');

    expect(screen.getByText('1 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('4 prompts available')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /start 4-prompt drill/i }));
    expect(screen.getByLabelText('Rapid drill')).toBeInTheDocument();
    expect(screen.getByText('Prompt 1 of 4')).toBeInTheDocument();
  });
});
