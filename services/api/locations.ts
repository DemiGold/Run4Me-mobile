import { USE_MOCK, apiClient, mockFetch, ApiError } from './client';
import { MOCK_ADDRESSES } from '@/services/mocks';
import type { LatLng, SavedAddress } from '@/services/types';

// ─────────────────────────────────────────────────────────────
// Saved addresses service
// ─────────────────────────────────────────────────────────────

let mockList: SavedAddress[] = [...MOCK_ADDRESSES];

export async function listLocations(): Promise<SavedAddress[]> {
  if (USE_MOCK) return mockFetch(mockList, 400);
  return apiClient.get<SavedAddress[]>('/locations');
}

export interface LocationInput {
  label: string;
  address: string;
  coordinate?: LatLng;
  icon?: SavedAddress['icon'];
  isDefault?: boolean;
}

export async function createLocation(input: LocationInput): Promise<SavedAddress> {
  if (USE_MOCK) {
    await mockFetch(null, 700);
    const newLoc: SavedAddress = {
      id: `loc-${Date.now()}`,
      label: input.label,
      address: input.address,
      coordinate: input.coordinate,
      icon: input.icon ?? 'map-pin',
      isDefault: input.isDefault ?? false,
    };
    // If this is set as default, clear others
    if (newLoc.isDefault) {
      mockList = mockList.map((l) => ({ ...l, isDefault: false }));
    }
    mockList = [...mockList, newLoc];
    return newLoc;
  }
  return apiClient.post<SavedAddress>('/locations', input);
}

export async function updateLocation(
  id: string,
  patch: Partial<LocationInput>
): Promise<SavedAddress> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    const idx = mockList.findIndex((l) => l.id === id);
    if (idx === -1) throw new ApiError('LOCATION_NOT_FOUND', 'Location not found.', 404);
    if (patch.isDefault) {
      mockList = mockList.map((l) => ({ ...l, isDefault: false }));
    }
    mockList[idx] = { ...mockList[idx], ...patch };
    return mockList[idx];
  }
  return apiClient.patch<SavedAddress>(`/locations/${id}`, patch);
}

export async function deleteLocation(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    mockList = mockList.filter((l) => l.id !== id);
    return;
  }
  await apiClient.delete(`/locations/${id}`);
}

export async function setDefaultLocation(id: string): Promise<SavedAddress> {
  if (USE_MOCK) {
    await mockFetch(null, 400);
    mockList = mockList.map((l) => ({ ...l, isDefault: l.id === id }));
    const found = mockList.find((l) => l.id === id);
    if (!found) throw new ApiError('LOCATION_NOT_FOUND', 'Location not found.', 404);
    return found;
  }
  return apiClient.patch<SavedAddress>(`/locations/${id}`, { isDefault: true });
}