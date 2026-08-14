import { createBrowserRouter } from 'react-router-dom';

import { LearnPage } from '@/features/learn/LearnPage';
import { HomePage } from '@/features/overview/HomePage';
import { PracticePage } from '@/features/practice/PracticePage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { ProgressPage } from '@/features/progress/ProgressPage';
import { AppShell } from '@/ui/layouts/AppShell';
import { NotFoundPage } from '@/ui/pages/NotFoundPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: HomePage },
      { path: 'learn', Component: LearnPage },
      { path: 'learn/:lessonId', Component: LearnPage },
      { path: 'practice', Component: PracticePage },
      { path: 'progress', Component: ProgressPage },
      { path: 'profile', Component: ProfilePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
