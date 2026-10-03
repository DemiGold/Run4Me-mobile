// ─────────────────────────────────────────────────────────────
// API Client
//
// Today: returns mock data with simulated latency.
// Tomorrow: swap `USE_MOCK` to false → real fetch.
//
// Screens never import fetch or axios directly — they call
// functions from services/api/*. That means when the backend
// ships, only these functions change.
// ─────────────────────────────────────────────────────────────

import { useAuthStore } from '@/stores/authStore';

// ─── Config ───
// Flip to false (or set EXPO_PUBLIC_USE_MOCK=false) when the real
// backend is ready. Every service function will then hit fetch.
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.run4me.com/v1';

// ─── Latency simulation for mocks ───
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Mock fetch helper — wraps any value in a delayed Promise ───
export async function mockFetch<T>(data: T, ms = 600): Promise<T> {
  await delay(ms);
  return data;
}

// ─── Mock error helper ───
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'ApiError';
  }
}

// ─── Real client (unused while USE_MOCK is true) ───
async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: { error?: { code?: string; message?: string } } = {};
    try {
      errorBody = await res.json();
    } catch {}
    throw new ApiError(
      errorBody.error?.code ?? 'UNKNOWN',
      errorBody.error?.message ?? `Request failed (${res.status})`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};