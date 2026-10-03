import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { SavedAddress } from '@/services/types';
import { Toggle } from '@/components/ui/Toggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Saved Addresses — wired to the API layer
//
// Data flow:
//   1. On first focus, fetch via api.locations.listLocations().
//      Shows skeleton rows.
//   2. On subsequent focuses (returning from new-address), re-fetch
//      with `isRefresh: true` so the list updates WITHOUT the
//      skeleton flash — the user just sees the new item appear.
//   3. Empty state if the user has zero saved addresses (with
//      "Add New Address" CTA).
//   4. Pull-to-refresh re-fetches.
//   5. Toggling "Set as default" on a non-default card:
//      a. Immediately flips local state (badge moves).
//      b. Fires api.locations.setDefaultLocation(id).
//      c. On success: nothing to do — already updated.
//      d. On failure: reverts local state, silent.
//
// Why useFocusEffect instead of useEffect:
//   When the user navigates to new-address, saves, and hits Back,
//   `saved-addresses` was never unmounted — useEffect wouldn't
//   re-run, and the new address wouldn't appear. useFocusEffect
//   fires on every focus, so the list stays in sync with the
//   server after any create/update flow that routes back here.
//
// Why the hasFetchedOnce ref:
//   Without it, every focus (including returning from anywhere,
//   not just new-address) would trigger a full re-fetch with the
//   skeleton. We only want the skeleton on the FIRST load. Every
//   subsequent focus uses the soft-refresh path (no skeleton,
//   just a quick update).
// ─────────────────────────────────────────────────────────────

export default function SavedAddresses() {
  // ─── State ───
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Tracks whether we've completed at least one fetch. Used to
  // decide between "show skeleton" (first) and "soft refresh" (later).
  const hasFetchedOnce = useRef(false);

  // ─── Fetch ───
  const fetchAddresses = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const list = await api.locations.listLocations();
      setAddresses(list);
      hasFetchedOnce.current = true;
    } catch {
      setError('Could not load your addresses. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ─── Focus-driven fetch ───
  // Runs on initial mount AND every time the screen regains focus
  // (e.g. after returning from new-address). Skipping the skeleton
  // on refocus keeps the transition instant.
  useFocusEffect(
    useCallback(() => {
      // If we've never fetched, do the full load (skeleton).
      // Otherwise, soft refresh (no skeleton, just a quiet update).
      fetchAddresses(hasFetchedOnce.current);
    }, [fetchAddresses])
  );

  // ─── Set as default — optimistic ───
  const handleSetDefault = async (id: string) => {
    if (settingDefaultId) return;

    const snapshot = addresses;

    // Optimistically flip
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    setSettingDefaultId(id);

    try {
      await api.locations.setDefaultLocation(id);
    } catch {
      // Revert on failure
      setAddresses(snapshot);
    } finally {
      setSettingDefaultId(null);
    }
  };

  // ─── Add new address ───
  const handleAddNew = () => {
    router.push('/(customer)/account/new-address');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* ─── Header ─── */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-heading-sm font-gabarito text-ink">
          Saved Addresses
        </Text>
      </View>

      {/* ═══ Loading — skeleton rows ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-3">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="rounded-2xl p-4 bg-surface border border-border"
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <Skeleton width={14} height={14} radius={4} />
                  <Skeleton width="30%" height={14} />
                </View>
                <View className="gap-2">
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="70%" height={12} />
                </View>
              </View>
            ))}
            <Skeleton width="100%" height={52} radius={16} className="mt-2" />
          </View>
        </ScrollView>
      ) : null}

      {/* ═══ Error ═══ */}
      {!loading && error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAddresses(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Something went wrong"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchAddresses()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && !error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAddresses(true)}
              tintColor={colors.primary}
            />
          }
        >
          {addresses.length === 0 ? (
            <EmptyState
              icon="map-pin"
              title="No saved addresses"
              body="Add a home, work, or other location to speed up checkout."
              actionLabel="Add New Address"
              onAction={handleAddNew}
            />
          ) : (
            <View className="px-6 gap-3">
              {addresses.map((addr) => {
                const isDefault = addr.isDefault;
                const isUpdating = settingDefaultId === addr.id;

                return (
                  <View
                    key={addr.id}
                    className={`
                      rounded-2xl p-4 bg-surface border
                      ${isDefault ? 'border-primary' : 'border-border'}
                      ${isUpdating ? 'opacity-60' : 'opacity-100'}
                    `}
                  >
                    {/* Header row */}
                    <View className="flex-row items-center gap-2 mb-2">
                      <Feather
                        name={addr.icon}
                        size={14}
                        color={isDefault ? colors.primary : colors.muted}
                      />
                      <Text className="text-body-sm font-gabarito-bold text-ink">
                        {addr.label}
                      </Text>

                      {isDefault ? (
                        <View className="bg-primary-light px-2 py-0.5 rounded">
                          <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                            DEFAULT
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Address */}
                    <Text
                      className={`
                        text-caption font-figtree leading-5
                        ${isDefault ? 'text-ink' : 'text-muted'}
                      `}
                    >
                      {addr.address}
                    </Text>

                    {/* Set as default */}
                    {!isDefault ? (
                      <>
                        <View className="h-[1px] bg-border mb-3 mt-3" />
                        <View className="flex-row items-center justify-between">
                          <Text className="text-caption font-figtree text-muted">
                            Set as default address
                          </Text>
                          <Toggle
                            value={false}
                            onChange={() => handleSetDefault(addr.id)}
                            disabled={isUpdating || !!settingDefaultId}
                          />
                        </View>
                      </>
                    ) : null}
                  </View>
                );
              })}

              {/* Add new address */}
              <TouchableOpacity
                onPress={handleAddNew}
                className="border border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-2"
                activeOpacity={0.75}
              >
                <Feather name="plus" size={16} color={colors.primary} />
                <Text className="text-body-sm font-figtree-bold text-primary">
                  Add New Address
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}