import { BarChart3, BookOpenText, CircleUserRound, House, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';

type NavigationIcon = ComponentType<{
  'aria-hidden'?: boolean;
  size?: number;
  strokeWidth?: number;
}>;

export const navigationIcons: Record<string, NavigationIcon> = {
  home: House,
  learn: BookOpenText,
  practice: Sparkles,
  progress: BarChart3,
  profile: CircleUserRound,
};
