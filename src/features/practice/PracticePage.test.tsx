import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthenticationProvider } from '@/features/auth/AuthenticationContext';

import { PracticePage } from './PracticePage';

function renderPracticePage(route = '/practice') {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthenticationProvider authGateway={null} userProfiles={null}>
        <PracticePage />
      </AuthenticationProvider>
    </MemoryRouter>,
  );
}

describe('PracticePage', () => {
  it('configures topic, difficulty, and set length before starting a quiz', async () => {
    const user = userEvent.setup();

    renderPracticePage();

    expect(screen.getByText('8 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('53 questions available')).toBeInTheDocument();
    expect(screen.getByText('6 choices each')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Elements' }));
    expect(screen.getByText('7 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('49 questions available')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /medium/i }));
    expect(screen.getByText('9 choices each')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start 10-question quiz/i })).toBeEnabled();
  });

  it('honors a lesson topic deep link and starts the interactive runner', async () => {
    const user = userEvent.setup();
    renderPracticePage('/practice?topic=astrology.elements');

    expect(screen.getByText('1 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('4 questions available')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /start 4-question quiz/i }));

    expect(screen.getByLabelText('Quiz runner')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
  });
});
