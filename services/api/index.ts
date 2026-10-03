// ─────────────────────────────────────────────────────────────
// API barrel export
//
// Import as:
//   import { api } from '@/services/api';
//   const { user } = await api.auth.verifyOtp(id, code);
//   const errand = await api.errands.create(draft);
//
// Every screen imports from here — never from individual files.
// ─────────────────────────────────────────────────────────────

import * as auth from './auth';
import * as user from './user';
import * as errands from './errands';
import * as payments from './payments';
import * as notifications from './notifications';
import * as wallet from './wallet';
import * as locations from './locations';

export const api = {
  auth,
  user,
  errands,
  payments,
  notifications,
  wallet,
  locations,
};

// Re-export types and constants for convenience
export { USE_MOCK, ApiError } from './client';