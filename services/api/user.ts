import { USE_MOCK, apiClient, mockFetch, ApiError } from './client';
import {
  getMockUser,
  setMockUser,
} from '@/services/mocks';
import type { User } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// User service — current authenticated user + their sessions
//
// MOCK user state lives in the shared fixtures store (see
// @/services/mocks). This file must NOT keep its own copy —
// auth.signup / auth.verifyOtp write to the shared store, and if
// this file read from a local shadow the profile would show the
// seed forever.
// ─────────────────────────────────────────────────────────────

// ═══ Current user ═══

export async function me(): Promise<User> {
  if (USE_MOCK) return mockFetch(getMockUser());
  return apiClient.get<User>('/me');
}

export async function updateMe(
  patch: Partial<Pick<User, 'name' | 'email' | 'phone' | 'dob'>>
): Promise<User> {
  if (USE_MOCK) {
    await mockFetch(null, 600);
    return setMockUser(patch);
  }
  return apiClient.patch<User>('/me', patch);
}

// ═══ Avatar ═══

export interface AvatarUploadResponse {
  avatarUrl: string;
}

export async function uploadAvatar(uri: string): Promise<AvatarUploadResponse> {
  if (USE_MOCK) {
    await mockFetch(null, 1200);
    setMockUser({ avatarUrl: uri });
    return { avatarUrl: uri };
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  const form = new FormData();
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${baseUrl}/me/avatar`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Avatar upload failed');
  return res.json();
}

export async function deleteAvatar(): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    setMockUser({ avatarUrl: null });
    return;
  }
  await apiClient.delete('/me/avatar');
}

// ═══════════════════════════════════════════════════════════════
// Login sessions
//
// Consumed by:
//   app/(customer)/account/login-devices.tsx
//
// Every device the user has signed in on appears here. The
// current device is flagged `isCurrent: true` and can't be
// revoked (that's just "sign out", handled elsewhere).
// ═══════════════════════════════════════════════════════════════

export interface UserSession {
  id: string;
  device: string;                       // "iPhone 15 Pro"
  location: string;                     // "Lagos, Nigeria"
  lastActive: string;                   // human-readable for now
  isCurrent: boolean;
  icon: 'smartphone' | 'monitor' | 'tablet';
}

// Mutable mock so revoke + sign-out-others persist within the session.
// First entry is always the "current" device.
let mockSessions: UserSession[] = [
  {
    id: 's1',
    device: 'iPhone 15 Pro',
    location: 'Lagos, Nigeria',
    lastActive: 'Active now',
    isCurrent: true,
    icon: 'smartphone',
  },
  {
    id: 's2',
    device: 'Samsung Galaxy',
    location: 'Abuja, Nigeria',
    lastActive: '2 hours ago',
    isCurrent: false,
    icon: 'smartphone',
  },
  {
    id: 's3',
    device: 'Chrome on MacOS',
    location: 'Lagos, Nigeria',
    lastActive: 'Yesterday',
    isCurrent: false,
    icon: 'monitor',
  },
];

export async function listSessions(): Promise<UserSession[]> {
  if (USE_MOCK) return mockFetch([...mockSessions], 400);
  return apiClient.get<UserSession[]>('/me/sessions');
}

/**
 * Revokes a single non-current session.
 * The caller is responsible for not passing the current device's id —
 * the mock guards against it here too, just in case.
 */
export async function revokeSession(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const target = mockSessions.find((s) => s.id === id);
    if (!target) throw new ApiError('SESSION_NOT_FOUND', 'Session not found.', 404);
    if (target.isCurrent) {
      throw new ApiError('CANNOT_REVOKE_CURRENT', 'Cannot revoke current device.');
    }
    mockSessions = mockSessions.filter((s) => s.id !== id);
    return;
  }
  await apiClient.delete(`/me/sessions/${id}`);
}

/**
 * Revokes every session except the current device.
 * Returns the surviving session list (just the current device).
 */
export async function revokeAllOtherSessions(): Promise<UserSession[]> {
  if (USE_MOCK) {
    await mockFetch(null, 600);
    mockSessions = mockSessions.filter((s) => s.isCurrent);
    return [...mockSessions];
  }
  return apiClient.post<UserSession[]>('/me/sessions/revoke-others');
}