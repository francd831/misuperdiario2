type LockState = {
  locked: boolean;
  profileId: string | null;
};

let state: LockState = { locked: true, profileId: null };
const listeners = new Set<(s: LockState) => void>();

export const lockService = {
  getState(): LockState {
    return { ...state };
  },

  unlock(profileId: string): void {
    state = { locked: false, profileId };
    listeners.forEach((fn) => fn({ ...state }));
  },

  lock(): void {
    state = { locked: true, profileId: null };
    listeners.forEach((fn) => fn({ ...state }));
  },

  subscribe(fn: (s: LockState) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
