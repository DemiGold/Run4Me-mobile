import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { Errand } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Pickup Location — step 2 of 8
//
// Figma: pickup-location
//   Search input (highlighted border) · map preview ·
//   Recent locations · Suggested stores.
//
// IMPORTANT: all wizard params accumulate forward.
//   2/8 sets: pickup
//   Forwards: type, promo, store (if set from Home), pickup
//
// The `store` param comes from Home's "Favorite Stores" tap. If
// present, it prefills the search field so the user doesn't have
// to type the store name again.
//
// Data:
//   Recent Locations — derived from the customer's completed
//   errand history. Each past pickup becomes a suggestion. This
//   uses real API data.
//
//   Suggested Stores — still a mock. There's no /places or
//   /stores/nearby endpoint yet. When the backend ships one (via
//   Google Places / Mapbox), swap MOCK_SUGGESTED_STORES for the
//   fetch. The UI already handles the list shape.
//
// Fallback:
//   If the errand-history fetch fails or returns nothing (new
//   customer), we fall back to a small seed list so the section
//   isn't empty. Better than showing nothing.
// ─────────────────────────────────────────────────────────────

const MAP_IMAGE = require('@/assets/map.png');

// ─── Fallback recent locations for new customers ───
// Only shown when the errand-history fetch returns nothing or
// fails. Matches the Figma "first-time user" experience.
const FALLBACK_RECENT = [
  { id: 'seed-1', name: 'The Palms Mall, Lekki', address: 'Lagos, Nigeria', type: 'recent' as const },
  { id: 'seed-2', name: 'Ebeano Supermarket',    address: 'Admiralty Way, Lekki', type: 'history' as const },
];

// ─── Suggested stores (mock until a /places endpoint exists) ───
// TODO: replace with api.places.nearbyStores(coordinate) when
// Samuel ships a places integration. Shape should stay the same:
// an array of store names to render as pills.
const MOCK_SUGGESTED_STORES = ['Spar Lekki', 'Game Supermarket'];

// Default pickup when nothing else is provided
const DEFAULT_PICKUP = 'Shoprite, The Palms Mall';

// ─── Internal shape for a recent-location row ───
type RecentLocation = {
  id: string;
  name: string;
  address: string;
  type: 'recent' | 'history';
};

/**
 * Given a list of past errands, extract unique pickup addresses.
 * Deduplicates by the primary address segment (before the first
 * comma) so "Shoprite, Palms Mall" and "Shoprite, Lekki" collapse
 * to one suggestion.
 *
 * The most recent errand wins when two share a primary segment,
 * since we iterate the list in order (API returns newest first).
 */
const deriveRecentPickups = (errands: Errand[]): RecentLocation[] => {
  const seen = new Set<string>();
  const out: RecentLocation[] = [];

  for (const errand of errands) {
    const address = errand.pickup?.address;
    if (!address) continue;

    const primary = address.split(',')[0]?.trim() || address;
    const key = primary.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    // First errand with a given pickup gets 'recent', later
    // duplicate addresses never appear at all.
    out.push({
      id: errand.id,
      name: primary,
      address: address.split(',').slice(1).join(',').trim() || 'Past errand',
      type: 'recent',
    });

    if (out.length >= 3) break;
  }

  return out;
};

export default function PickupLocation() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    store?: string;   // from Home's favorite-store tap
    pickup?: string;  // restored when going back from delivery
  }>();

  // Prefill order: previously selected pickup > store param > default
  const initialValue = params.pickup || params.store || DEFAULT_PICKUP;

  const [query, setQuery] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState(initialValue);

  // ─── Recent-locations fetch ───
  const [recent, setRecent] = useState<RecentLocation[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecent = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingRecent(true);

    try {
      // Ask for a handful of past errands. The API returns newest
      // first, which is what we want for "recent" semantics.
      const past = await api.errands.listErrands({ limit: 10 });

      const derived = deriveRecentPickups(past);
      setRecent(derived.length > 0 ? derived : FALLBACK_RECENT);
    } catch {
      // Network failed — show the seed list so the user can still
      // pick a location and continue the wizard.
      setRecent(FALLBACK_RECENT);
    } finally {
      setLoadingRecent(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleConfirm = () => {
    router.push({
      pathname: '/(customer)/errand/delivery',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        store: params.store ?? '',
        pickup: selectedLocation,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">
          Pickup Location
        </Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          2<Text className="text-text-light font-figtree">/8</Text>
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRecent(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View className="px-6">
          {/* Title */}
          <Text className="text-heading-sm font-gabarito text-ink mb-5">
            Where should we shop or pick up from?
          </Text>

          {/* ─── Search input — highlighted border ─── */}
          <View className="flex-row items-center border border-primary rounded-field px-4 bg-surface mb-5 h-14">
            <Feather name="search" size={16} color={colors.primary} />
            <TextInput
              className="flex-1 pl-3 text-body-sm font-figtree text-ink"
              placeholder="Search for a store or address"
              placeholderTextColor={colors.subtle}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelectedLocation(text);
              }}
            />
          </View>

          {/* ─── Map preview ─── */}
          <TouchableOpacity
            className="w-full rounded-2xl overflow-hidden mb-6 bg-primary-light items-center justify-center"
            style={{ height: 160 }}
            activeOpacity={0.9}
          >
            <Image
              source={MAP_IMAGE}
              className="w-full h-full absolute"
              resizeMode="cover"
            />
            <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Feather name="map-pin" size={14} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── Recent locations ─── */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
            Recent Locations
          </Text>

          {loadingRecent ? (
            /* Loading skeletons — 2 rows, matches the eventual shape */
            <View className="gap-3 mb-6">
              {[0, 1].map((i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <Skeleton width={32} height={32} radius={16} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="55%" height={12} />
                    <Skeleton width="40%" height={10} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="gap-3 mb-6">
              {recent.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  onPress={() => {
                    setSelectedLocation(loc.name);
                    setQuery(loc.name);
                  }}
                  className="flex-row items-center gap-3"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-full bg-background-dark items-center justify-center">
                    <Feather
                      name={loc.type === 'recent' ? 'map-pin' : 'clock'}
                      size={14}
                      color={colors.muted}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-xs font-figtree-bold text-ink">
                      {loc.name}
                    </Text>
                    <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                      {loc.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ─── Suggested stores (mock — no endpoint yet) ─── */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
            Suggested Stores Nearby
          </Text>

          <View className="flex-row gap-2 flex-wrap mb-8">
            {MOCK_SUGGESTED_STORES.map((store) => (
              <TouchableOpacity
                key={store}
                onPress={() => {
                  setSelectedLocation(store);
                  setQuery(store);
                }}
                className="border border-border rounded-full px-4 py-2 bg-surface"
                activeOpacity={0.7}
              >
                <Text className="text-caption font-figtree text-ink">
                  {store}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleConfirm}>
          Confirm pickup location
        </Button>
      </View>
    </SafeAreaView>
  );
}