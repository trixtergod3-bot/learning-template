import type { GuestIdentityStore } from '@/engine/ports/learningRepository';

const defaultStorageKey = 'learning-template.guest-principal';

export class BrowserGuestIdentityStore implements GuestIdentityStore {
  constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
    private readonly storageKey = defaultStorageKey,
  ) {}

  getOrCreatePrincipalId(): string {
    const storedId = this.storage.getItem(this.storageKey);

    if (storedId) {
      return storedId;
    }

    const principalId = `guest:${crypto.randomUUID()}`;
    this.storage.setItem(this.storageKey, principalId);
    return principalId;
  }

  clear(): void {
    this.storage.removeItem(this.storageKey);
  }
}
