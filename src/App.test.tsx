import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/App';

describe('App', () => {
  it('introduces the LearningTemplate foundation', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'LearningTemplate' })).toBeInTheDocument();
    expect(screen.getByText(/subject-agnostic learning engine/i)).toBeInTheDocument();
  });
});
