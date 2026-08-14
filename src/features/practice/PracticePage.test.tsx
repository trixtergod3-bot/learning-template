import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PracticePage } from './PracticePage';

describe('PracticePage', () => {
  it('configures topic and difficulty without starting the deferred quiz runner', async () => {
    const user = userEvent.setup();

    render(<PracticePage />);

    expect(screen.getByText('8 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('53 questions ready')).toBeInTheDocument();
    expect(screen.getByText('6 choices each')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Elements' }));
    expect(screen.getByText('7 of 8 selected')).toBeInTheDocument();
    expect(screen.getByText('49 questions ready')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /medium/i }));
    expect(screen.getByText('9 choices each')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quiz runner arrives in phase 5/i })).toBeDisabled();
  });
});
