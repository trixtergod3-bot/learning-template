import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthenticationProvider } from '@/features/auth/AuthenticationContext';

import { FlashcardPage } from './FlashcardPage';

describe('FlashcardPage', () => {
  it('builds a topic-filtered deck and starts review', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/practice/flashcards?topic=astrology.elements']}>
        <AuthenticationProvider authGateway={null} userProfiles={null}>
          <FlashcardPage />
        </AuthenticationProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('1 of 8 selected')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '4 cards available' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /review 4 cards/i }));

    expect(screen.getByLabelText('Flashcard review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reveal answer/i })).toBeInTheDocument();
  });
});
