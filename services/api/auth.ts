import { USE_MOCK, apiClient, mockFetch, ApiError } from './client';
import {
  MOCK_CUSTOMER,
  getMockUser,
  hydrateMockUser,
  setMockUser,
  resetMockUser,
} from '@/services/mocks';
import type { AuthResponse, UserRole } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Auth service
//
// Sign-up → OTP → session. Password recovery uses the same OTP.
//
// MOCK: correct OTP is '123456' for sign-in and password reset.
// The mock keeps a mutable "current user" (see mocks/currentUser)
// so a freshly-signed-up user is what verifyOtp / getMe return —
// not the seed MOCK_CUSTOMER.
// ─────────────────────────────────────────────────────────────

const MOCK_OTP = '123456';

// ═══ Sign up ═══

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: UserRole;
}

export interface SignupResponse {
  userId: string;
  otpSent: boolean;
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  if (USE_MOCK) {
    // Persist the submitted fields as the current mock user so the
    // OTP step (and every screen after it) sees the real details.
    const user = hydrateMockUser({
      id: `cust-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      dob: payload.dob,
      role: payload.role,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    });
    return mockFetch({ userId: user.id, otpSent: true });
  }
  return apiClient.post<SignupResponse>('/auth/signup', payload);
}

// ═══ Sign in ═══

export interface SigninResponse {
  otpSent: boolean;
  channel: 'email' | 'sms';
}

export async function signin(identifier: string): Promise<SigninResponse> {
  if (USE_MOCK) {
    const channel: 'email' | 'sms' = identifier.includes('@') ? 'email' : 'sms';
    return mockFetch({ otpSent: true, channel });
  }
  return apiClient.post<SigninResponse>('/auth/signin', { identifier });
}

// ═══ Verify OTP ═══

export async function verifyOtp(
  identifier: string,
  code: string
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    if (code !== MOCK_OTP) {
      throw new ApiError('OTP_INVALID', 'The code you entered is incorrect.');
    }
    return {
      token: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      // Whatever the last signup (or Google sign-in) hydrated.
      // Falls back to the seed only if nothing has run yet.
      user: getMockUser(),
    };
  }
  return apiClient.post<AuthResponse>('/auth/otp/verify', { identifier, code });
}

// ═══ Resend OTP ═══

export async function resendOtp(identifier: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    return;
  }
  await apiClient.post('/auth/otp/resend', { identifier });
}

// ═══ Google sign-in ═══

export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    // Hydrate the mock store so getMe() / updateMe() agree with the
    // user we're about to return.
    const user = setMockUser({
      id: 'google-cust-1',
      name: 'Demo User',
      email: 'demo.user@gmail.com',
      role: 'customer',
      avatarUrl: null,
    });
    return {
      token: `mock-google-${Date.now()}`,
      refreshToken: `mock-google-refresh-${Date.now()}`,
      user,
    };
  }
  return apiClient.post<AuthResponse>('/auth/google', { idToken });
}

// ═══ Password reset ═══

export async function forgotPasswordSend(identifier: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    return;
  }
  await apiClient.post('/auth/password/send-otp', { identifier });
}

export async function forgotPasswordVerify(
  identifier: string,
  code: string
): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    if (code !== MOCK_OTP) {
      throw new ApiError('OTP_INVALID', 'The code you entered is incorrect.');
    }
    return;
  }
  await apiClient.post('/auth/password/verify-otp', { identifier, code });
}

export async function forgotPasswordReset(
  identifier: string,
  code: string,
  password: string
): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    return;
  }
  await apiClient.post('/auth/password/reset', { identifier, code, password });
}

// ═══ Session ═══

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 200);
    // Wipe the mock user so the next sign-in starts clean. Remove
    // this line if you want the demo to "remember" the last user.
    resetMockUser();
    return;
  }
  await apiClient.post('/auth/logout');
}

export async function refreshSession(
  refreshToken: string
): Promise<{ token: string }> {
  if (USE_MOCK) {
    return mockFetch({ token: `mock-token-refreshed-${Date.now()}` });
  }
  return apiClient.post<{ token: string }>('/auth/refresh', {
    refreshToken,
  });
}