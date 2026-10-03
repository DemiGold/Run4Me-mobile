import { USE_MOCK, apiClient, mockFetch } from './client';
import {
  MOCK_WALLET_BALANCE,
  MOCK_WALLET_TRANSACTIONS,
} from '@/services/mocks';
import type { WalletBalance, WalletTransaction } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Wallet service
// ─────────────────────────────────────────────────────────────

let mockBalance = MOCK_WALLET_BALANCE;

export async function getBalance(): Promise<WalletBalance> {
  if (USE_MOCK) {
    return mockFetch({ balance: mockBalance, currency: 'NGN' }, 300);
  }
  return apiClient.get<WalletBalance>('/wallet');
}

export async function listTransactions(): Promise<WalletTransaction[]> {
  if (USE_MOCK) return mockFetch(MOCK_WALLET_TRANSACTIONS, 400);
  return apiClient.get<WalletTransaction[]>('/wallet/transactions');
}

export interface TopupPayload {
  amount: number;              // kobo
  method: 'card' | 'bank_transfer';
}

export async function topup(payload: TopupPayload): Promise<WalletBalance> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    mockBalance += payload.amount;
    return { balance: mockBalance, currency: 'NGN' };
  }
  return apiClient.post<WalletBalance>('/wallet/topup', payload);
}

export interface WithdrawPayload {
  amount: number;
  bankAccountId: string;
}

export async function withdraw(payload: WithdrawPayload): Promise<WalletBalance> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    mockBalance = Math.max(0, mockBalance - payload.amount);
    return { balance: mockBalance, currency: 'NGN' };
  }
  return apiClient.post<WalletBalance>('/wallet/withdraw', payload);
}