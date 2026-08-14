import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LearnPage } from './LearnPage';

function renderLearnPage(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<LearnPage />} path="/learn" />
        <Route element={<LearnPage />} path="/learn/:lessonId" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LearnPage', () => {
  it('presents every Astrology topic as an available lesson', () => {
    renderLearnPage('/learn');

    expect(
      screen.getByRole('heading', { name: 'Zodiac Foundations', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /open lesson/i })).toHaveLength(8);
    expect(screen.getByRole('link', { name: /start lesson 1/i })).toHaveAttribute(
      'href',
      '/learn/astrology.elements.foundations',
    );
  });

  it('renders a structured lesson with course and next-lesson navigation', () => {
    renderLearnPage('/learn/astrology.elements.foundations');

    expect(
      screen.getByRole('heading', { name: 'The four elemental families', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Aries, Leo, Sagittarius/)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Lesson navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /next lesson/i })).toHaveAttribute(
      'href',
      '/learn/astrology.modalities.foundations',
    );
  });

  it('handles an unknown lesson without crashing', () => {
    renderLearnPage('/learn/not-a-lesson');

    expect(screen.getByRole('heading', { name: 'Lesson not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view course map/i })).toHaveAttribute(
      'href',
      '/learn',
    );
  });
});
