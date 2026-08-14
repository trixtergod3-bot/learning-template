import type { UserProfile } from '../domain/sessions';

export interface UserProfileRepository {
  getOrCreate(userId: string): Promise<UserProfile>;
  update(userId: string, displayName: string | null, locale: string): Promise<UserProfile>;
}
