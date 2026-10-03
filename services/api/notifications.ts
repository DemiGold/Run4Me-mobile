import { USE_MOCK, apiClient, mockFetch } from './client';
import { MOCK_NOTIFICATIONS } from '@/services/mocks';
import type { AppNotification } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Notifications service
// ─────────────────────────────────────────────────────────────

let mockList: AppNotification[] = [...MOCK_NOTIFICATIONS];

export async function listNotifications(): Promise<AppNotification[]> {
  if (USE_MOCK) return mockFetch(mockList, 400);
  return apiClient.get<AppNotification[]>('/notifications');
}

export async function markRead(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 200);
    mockList = mockList.map((n) => (n.id === id ? { ...n, read: true } : n));
    return;
  }
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    mockList = mockList.map((n) => ({ ...n, read: true }));
    return;
  }
  await apiClient.patch('/notifications/read-all');
}

export async function unreadCount(): Promise<number> {
  if (USE_MOCK) {
    await mockFetch(null, 150);
    return mockList.filter((n) => !n.read).length;
  }
  const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return res.count;
}