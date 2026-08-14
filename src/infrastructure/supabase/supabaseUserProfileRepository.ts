import type { SupabaseClient } from '@supabase/supabase-js';

import { UserProfileSchema, type UserProfile } from '@/engine/domain/sessions';
import type { UserProfileRepository } from '@/engine/ports/userProfileRepository';
import type { Database } from '@/infrastructure/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function toUserProfile(row: ProfileRow): UserProfile {
  return UserProfileSchema.parse({
    userId: row.user_id,
    displayName: row.display_name,
    locale: row.locale,
  });
}

export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getOrCreate(userId: string) {
    const existing = await this.read(userId);
    if (existing) return existing;

    const { error } = await this.client.from('profiles').insert({ user_id: userId, locale: 'en' });

    if (error && error.code !== '23505') throw error;

    const created = await this.read(userId);
    if (!created) throw new Error('The authenticated profile could not be created.');
    return created;
  }

  async update(userId: string, displayName: string | null, locale: string) {
    const { data, error } = await this.client
      .from('profiles')
      .update({ display_name: displayName, locale })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return toUserProfile(data);
  }

  private async read(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? toUserProfile(data) : null;
  }
}
