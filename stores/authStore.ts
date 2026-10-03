// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Auth store
//
// Single source of truth for the logged-in user + token.
// Persisted to AsyncStorage so the session survives app restart.
//
// The `User` type comes from services/types.ts — the same type
// the API layer uses. This means:
//   - Adding a field to User updates both places at once
//   - Screens reading `user.phone` get type-checked correctly
//   - No risk of store/API drift
//
// When the backend ships:
//   - `login` is called after OTP verify / Google sign-in
//   - `logout` clears the token both locally and server-side
//     (api.auth.logout handles the server; this only clears state)
// ─────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;

  /** Convenience — sets both user and token in one call. */
  login: (user: User, token: string) => void;

  /** Clears local session. Server-side invalidation is a
   *  separate call to api.auth.logout(). */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);