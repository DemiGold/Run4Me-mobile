import { USE_MOCK, apiClient, mockFetch, ApiError } from './client';
import {
  MOCK_ERRANDS,
  MOCK_RUNNERS,
  MOCK_SERVICES,
} from '@/services/mocks';
import type {
  ChatMessage,
  Errand,
  ErrandDraft,
  ErrandItem,
  ErrandService,
  ErrandStatus,
  Runner,
  RunnerTracking,
} from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Errands service
//
// List, create, submit, match, track, chat, review.
// Mock state is mutable so create/list flows feel real.
// ─────────────────────────────────────────────────────────────

let mockErrands: Errand[] = [...MOCK_ERRANDS];
let nextErrandId = 100;

// ═══ Static: services catalog ═══

export async function listServices(): Promise<ErrandService[]> {
  if (USE_MOCK) return mockFetch(MOCK_SERVICES);
  return apiClient.get<ErrandService[]>('/services');
}

// ═══ Errand CRUD ═══

export interface ListErrandsFilter {
  status?: ErrandStatus | 'active' | 'completed' | 'cancelled';
  limit?: number;
  page?: number;
}

export async function listErrands(filter?: ListErrandsFilter): Promise<Errand[]> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    let result = [...mockErrands];

    if (filter?.status) {
      const s = filter.status;
      if (s === 'active') {
        result = result.filter((e) =>
          ['draft', 'finding_runner', 'runner_assigned', 'en_route_to_store', 'shopping', 'en_route_to_you', 'delivered'].includes(e.status)
        );
      } else if (s === 'completed') {
        result = result.filter((e) => e.status === 'completed');
      } else if (s === 'cancelled') {
        result = result.filter((e) => e.status === 'cancelled');
      } else {
        result = result.filter((e) => e.status === s);
      }
    }
    return result;
  }

  const query = new URLSearchParams();
  if (filter?.status) query.set('status', filter.status);
  if (filter?.limit) query.set('limit', String(filter.limit));
  if (filter?.page) query.set('page', String(filter.page));
  const qs = query.toString();
  return apiClient.get<Errand[]>(`/errands${qs ? `?${qs}` : ''}`);
}

export async function getErrand(id: string): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    const found = mockErrands.find((e) => e.id === id);
    if (!found) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    return found;
  }
  return apiClient.get<Errand>(`/errands/${id}`);
}

export async function createErrand(draft: ErrandDraft): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    const errand: Errand = {
      id: `err-${nextErrandId++}`,
      customerId: 'cust-1',
      serviceType: draft.serviceType,
      status: 'draft',
      pickup: draft.pickup,
      dropoff: draft.dropoff,
      items: draft.items,
      budget: draft.budget,
      instructions: draft.instructions,
      timeline: draft.timeline,
      scheduledFor: draft.scheduledFor,
      promoCode: draft.promoCode,
      runner: null,
      payment: null,
      createdAt: new Date().toISOString(),
    };
    mockErrands = [errand, ...mockErrands];
    return errand;
  }
  return apiClient.post<Errand>('/errands', draft);
}

export async function updateErrand(
  id: string,
  patch: Partial<ErrandDraft>
): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    const idx = mockErrands.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    mockErrands[idx] = {
      ...mockErrands[idx],
      ...(patch.pickup && { pickup: patch.pickup }),
      ...(patch.dropoff && { dropoff: patch.dropoff }),
      ...(patch.items && { items: patch.items }),
      ...(patch.budget !== undefined && { budget: patch.budget }),
      ...(patch.instructions !== undefined && { instructions: patch.instructions }),
      ...(patch.timeline && { timeline: patch.timeline }),
      ...(patch.scheduledFor !== undefined && { scheduledFor: patch.scheduledFor }),
    };
    return mockErrands[idx];
  }
  return apiClient.patch<Errand>(`/errands/${id}`, patch);
}

export async function submitErrand(id: string): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const idx = mockErrands.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    mockErrands[idx] = { ...mockErrands[idx], status: 'finding_runner' };
    return mockErrands[idx];
  }
  return apiClient.post<Errand>(`/errands/${id}/submit`);
}

export async function cancelErrand(id: string, reason?: string): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const idx = mockErrands.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    mockErrands[idx] = { ...mockErrands[idx], status: 'cancelled' };
    return mockErrands[idx];
  }
  return apiClient.post<Errand>(`/errands/${id}/cancel`, { reason });
}

// ═══ Runner matching ═══

export async function listAvailableRunners(errandId: string): Promise<Runner[]> {
  if (USE_MOCK) return mockFetch(MOCK_RUNNERS, 500);
  return apiClient.get<Runner[]>(`/errands/${errandId}/runners`);
}

export async function acceptRunner(errandId: string, runnerId: string): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    const idx = mockErrands.findIndex((e) => e.id === errandId);
    if (idx === -1) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    const runner = MOCK_RUNNERS.find((r) => r.id === runnerId) ?? null;
    mockErrands[idx] = {
      ...mockErrands[idx],
      runner,
      status: 'runner_assigned',
    };
    return mockErrands[idx];
  }
  return apiClient.post<Errand>(`/errands/${errandId}/accept-runner`, { runnerId });
}

export async function rejectRunner(errandId: string, runnerId: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    return;
  }
  await apiClient.post(`/errands/${errandId}/reject-runner`, { runnerId });
}

// ═══ Live tracking ═══

export async function getTracking(errandId: string): Promise<RunnerTracking> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    const jitter = () => (Math.random() - 0.5) * 0.0006;
    return {
      runnerId: 'david',
      coordinate: {
        latitude: 6.4413 + jitter(),
        longitude: 3.4728 + jitter(),
      },
      status: 'en_route_to_you',
      etaMinutes: Math.max(1, Math.floor(5 + Math.random() * 8)),
      updatedAt: new Date().toISOString(),
    };
  }
  return apiClient.get<RunnerTracking>(`/errands/${errandId}/tracking`);
}

// ═══ Chat ═══

const mockChat: Record<string, ChatMessage[]> = {
  'err-1': [
    {
      id: 'm1',
      from: 'runner',
      text: "Hi! I'm heading to the store now. Anything else to add?",
      time: '9:41',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      from: 'me',
      text: 'Please check the expiry dates on the milk.',
      time: '9:42',
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
  ],
};

export async function listMessages(errandId: string): Promise<ChatMessage[]> {
  if (USE_MOCK) return mockFetch(mockChat[errandId] ?? [], 300);
  return apiClient.get<ChatMessage[]>(`/errands/${errandId}/chat`);
}

export async function sendMessage(errandId: string, text: string): Promise<ChatMessage> {
  if (USE_MOCK) {
    await mockFetch(null, 200);
    const now = new Date();
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'me',
      text,
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      createdAt: now.toISOString(),
    };
    mockChat[errandId] = [...(mockChat[errandId] ?? []), msg];
    return msg;
  }
  return apiClient.post<ChatMessage>(`/errands/${errandId}/chat`, { text });
}

// ═══ Items (shopping progress) ═══

export async function listItems(errandId: string): Promise<ErrandItem[]> {
  if (USE_MOCK) {
    await mockFetch(null, 300);
    const errand = mockErrands.find((e) => e.id === errandId);
    return errand?.items ?? [];
  }
  return apiClient.get<ErrandItem[]>(`/errands/${errandId}/items`);
}

export async function approveSubstitution(
  errandId: string,
  itemId: string,
  acceptedItem: { name: string; price: number }
): Promise<ErrandItem> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    return {
      id: itemId,
      name: acceptedItem.name,
      quantity: 1,
      status: 'substituted',
      price: acceptedItem.price,
    };
  }
  return apiClient.post<ErrandItem>(
    `/errands/${errandId}/items/${itemId}/approve-substitution`,
    { acceptedItem }
  );
}

export async function rejectSubstitution(errandId: string, itemId: string): Promise<ErrandItem> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const errand = mockErrands.find((e) => e.id === errandId);
    const item = errand?.items.find((i) => i.id === itemId);
    if (!item) throw new ApiError('ITEM_NOT_FOUND', 'Item not found.', 404);
    return { ...item, status: 'out_of_stock' };
  }
  return apiClient.post<ErrandItem>(`/errands/${errandId}/items/${itemId}/reject-substitution`);
}

// ═══ Receipt ═══

export interface Receipt {
  imageUrl: string;
  total: number;
  items: ErrandItem[];
}

export async function getReceipt(errandId: string): Promise<Receipt> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    const errand = mockErrands.find((e) => e.id === errandId);
    return {
      imageUrl: '',
      total: errand?.items.reduce((sum, i) => sum + (i.price ?? 0), 0) ?? 0,
      items: errand?.items ?? [],
    };
  }
  return apiClient.get<Receipt>(`/errands/${errandId}/receipt`);
}

// ═══ Delivery + rating ═══

export async function confirmDelivery(errandId: string, code: string): Promise<Errand> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    const idx = mockErrands.findIndex((e) => e.id === errandId);
    if (idx === -1) throw new ApiError('ERRAND_NOT_FOUND', 'Errand not found.', 404);
    mockErrands[idx] = { ...mockErrands[idx], status: 'completed', completedAt: new Date().toISOString() };
    return mockErrands[idx];
  }
  return apiClient.post<Errand>(`/errands/${errandId}/confirm-delivery`, { code });
}

export interface RateErrandPayload {
  stars: number;
  categoryRatings?: Record<string, number>;
  comment?: string;
  tip?: number;
}

export async function rateErrand(errandId: string, payload: RateErrandPayload): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 800);
    return;
  }
  await apiClient.post(`/errands/${errandId}/rate`, payload);
}

// ═══ Delivery code ═══
// The 4-digit code the customer reads to the runner. Fetched
// separately because it shouldn't be visible in the errand
// object (a customer could share the errand payload by accident
// and leak the code).

export interface DeliveryCodeResponse {
  code: string;              // "5819"
  expiresAt?: string;        // ISO 8601 — code may rotate
}

export async function getDeliveryCode(
  errandId: string
): Promise<DeliveryCodeResponse> {
  if (USE_MOCK) {
    await mockFetch(null, 500);
    // Deterministic mock code derived from the errand id so the
    // same errand always returns the same code across reloads.
    const seed = errandId
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const code = String((seed * 7) % 10000).padStart(4, '0');
    return { code };
  }
  return apiClient.get<DeliveryCodeResponse>(
    `/errands/${errandId}/delivery-code`
  );
}