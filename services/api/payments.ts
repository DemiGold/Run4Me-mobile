import { USE_MOCK, apiClient, mockFetch, ApiError } from './client';
import type {
  BankDetails,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Payments service
//
// One entry point per method: wallet, card, bank transfer, cash.
// Every method returns a Payment object so the caller treats them
// uniformly.
//
// Also manages the user's saved cards (list / set default /
// remove) which is a separate concern from one-off payments.
//
// MOCK:
//   - Wallet PIN:     1234
//   - Card OTP:       123456
//   - Saved cards:    GTBank (default) + Zenith Visa
// ─────────────────────────────────────────────────────────────

const MOCK_WALLET_PIN = '1234';
const MOCK_CARD_OTP = '123456';
const MOCK_WALLET_BALANCE = 2_540_000; // ₦25,400

// In-memory store so status checks reflect reality
const mockPayments: Record<string, Payment> = {};

function makePayment(
  errandId: string,
  method: PaymentMethod,
  amount: number,
  status: PaymentStatus = 'pending'
): Payment {
  const id = `pay-${Date.now()}`;
  const payment: Payment = { id, errandId, method, amount, status };
  mockPayments[id] = payment;
  return payment;
}

// ═══ Wallet ═══

export interface WalletPaymentResult {
  payment: Payment;
  newBalance: number;
}

export async function payWithWallet(
  errandId: string,
  amount: number,
  pin: string
): Promise<WalletPaymentResult> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    if (pin !== MOCK_WALLET_PIN) {
      throw new ApiError('PIN_INVALID', 'Incorrect PIN. Please try again.');
    }
    if (amount > MOCK_WALLET_BALANCE) {
      throw new ApiError('INSUFFICIENT_FUNDS', 'Wallet balance is too low.');
    }
    const payment = makePayment(errandId, 'wallet', amount, 'confirmed');
    payment.paidAt = new Date().toISOString();
    return {
      payment,
      newBalance: MOCK_WALLET_BALANCE - amount,
    };
  }
  return apiClient.post<WalletPaymentResult>('/payments/wallet', {
    errandId,
    amount,
    pin,
  });
}

// ═══ Card ═══

export interface CardPaymentInit {
  paymentId: string;
  otpRequired: boolean;
}

export async function payWithCard(
  errandId: string,
  amount: number,
  card: {
    number: string;
    expiry: string;
    cvv: string;
    nameOnCard: string;
    saveCard?: boolean;
  }
): Promise<CardPaymentInit> {
  if (USE_MOCK) {
    await mockFetch(null, 900);
    const payment = makePayment(errandId, 'card', amount, 'processing');
    payment.cardLast4 = card.number.replace(/\D/g, '').slice(-4);
    return {
      paymentId: payment.id,
      otpRequired: true,
    };
  }
  return apiClient.post<CardPaymentInit>('/payments/card', {
    errandId,
    amount,
    card,
  });
}

export async function verifyCardOtp(
  paymentId: string,
  otp: string
): Promise<Payment> {
  if (USE_MOCK) {
    await mockFetch(null, 800);
    const payment = mockPayments[paymentId];
    if (!payment) throw new ApiError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    if (otp !== MOCK_CARD_OTP) {
      throw new ApiError('OTP_INVALID', 'The code you entered is incorrect.');
    }
    payment.status = 'confirmed';
    payment.paidAt = new Date().toISOString();
    return payment;
  }
  return apiClient.post<Payment>('/payments/card/otp', { paymentId, otp });
}

// ═══ Bank transfer ═══

export async function initiateBankTransfer(
  errandId: string,
  amount: number
): Promise<{ payment: Payment; bankDetails: BankDetails }> {
  if (USE_MOCK) {
    await mockFetch(null, 800);
    const payment = makePayment(errandId, 'bank_transfer', amount, 'processing');
    const bankDetails: BankDetails = {
      bank: 'Wema Bank',
      accountNumber: '8047291630',
      accountName: 'Run4Me Payments',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    payment.bankDetails = bankDetails;
    return { payment, bankDetails };
  }
  return apiClient.post<{ payment: Payment; bankDetails: BankDetails }>(
    '/payments/bank-transfer',
    { errandId, amount }
  );
}

export async function checkBankTransferStatus(
  paymentId: string
): Promise<{ status: PaymentStatus; payment: Payment }> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    const payment = mockPayments[paymentId];
    if (!payment) throw new ApiError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    // Simulate: mock flips to confirmed after ~10s of being polled
    if (payment.status === 'processing') {
      const ageMs =
        Date.now() -
        new Date(
          payment.id.split('-')[1]
            ? Number(payment.id.split('-')[1])
            : Date.now()
        ).getTime();
      if (ageMs > 10_000) {
        payment.status = 'confirmed';
        payment.paidAt = new Date().toISOString();
      }
    }
    return { status: payment.status, payment };
  }
  return apiClient.get<{ status: PaymentStatus; payment: Payment }>(
    `/payments/${paymentId}/status`
  );
}

// ═══ Cash ═══

export async function payWithCash(
  errandId: string,
  amount: number
): Promise<Payment> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    // Cash payments are "confirmed" once the runner agrees
    const payment = makePayment(errandId, 'cash', amount, 'processing');
    return payment;
  }
  return apiClient.post<Payment>('/payments/cash', { errandId, amount });
}

export async function confirmCashAmount(
  paymentId: string,
  agreedAmount: number
): Promise<Payment> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const payment = mockPayments[paymentId];
    if (!payment) throw new ApiError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    payment.amount = agreedAmount;
    payment.status = 'confirmed';
    payment.paidAt = new Date().toISOString();
    return payment;
  }
  return apiClient.post<Payment>(`/payments/${paymentId}/cash-confirm`, {
    agreedAmount,
  });
}

export async function disputeCash(
  paymentId: string,
  payload: { reason: string; note?: string; correctAmount: number }
): Promise<Payment> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    const payment = mockPayments[paymentId];
    if (!payment) throw new ApiError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    payment.amount = payload.correctAmount;
    return payment;
  }
  return apiClient.post<Payment>(`/payments/${paymentId}/dispute`, payload);
}

// ═══ Read ═══

export async function getPayment(paymentId: string): Promise<Payment> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    const payment = mockPayments[paymentId];
    if (!payment) throw new ApiError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    return payment;
  }
  return apiClient.get<Payment>(`/payments/${paymentId}`);
}

// ═══════════════════════════════════════════════════════════════
// Saved cards
//
// The cards list is a separate concern from one-off payments, so
// it lives in its own section. Same USE_MOCK pattern.
//
// Consumed by:
//   app/(customer)/account/payment-methods.tsx
//   app/(customer)/errand/payment/checkout.tsx  (via listCards)
// ═══════════════════════════════════════════════════════════════

export interface SavedCard {
  id: string;
  brand: string;      // "GTBank Mastercard" | "Zenith Visa"
  last4: string;
  expiry: string;     // "MM/YY"
  isDefault: boolean;
}

// Mutable mock so set-default/remove persist within the session
let mockCards: SavedCard[] = [
  { id: 'c1', brand: 'GTBank Mastercard', last4: '4910', expiry: '08/28', isDefault: true },
  { id: 'c2', brand: 'Zenith Visa',       last4: '2277', expiry: '03/27', isDefault: false },
];

export async function listCards(): Promise<SavedCard[]> {
  if (USE_MOCK) return mockFetch([...mockCards], 400);
  return apiClient.get<SavedCard[]>('/payment-methods/cards');
}

export async function setDefaultCard(id: string): Promise<SavedCard> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    mockCards = mockCards.map((c) => ({ ...c, isDefault: c.id === id }));
    const found = mockCards.find((c) => c.id === id);
    if (!found) throw new ApiError('CARD_NOT_FOUND', 'Card not found.', 404);
    return found;
  }
  return apiClient.patch<SavedCard>(`/payment-methods/cards/${id}`, {
    isDefault: true,
  });
}

export async function removeCard(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    mockCards = mockCards.filter((c) => c.id !== id);
    // If we removed the default, promote the first remaining card
    if (mockCards.length > 0 && !mockCards.some((c) => c.isDefault)) {
      mockCards[0] = { ...mockCards[0], isDefault: true };
    }
    return;
  }
  await apiClient.delete(`/payment-methods/cards/${id}`);
}