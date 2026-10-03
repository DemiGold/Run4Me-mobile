import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { Runner } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Available Runners — wired to the errands API
//
// Shown after finding-runner. Lists runners the backend has
// proposed for this errand. The customer picks one.
//
// Data flow:
//   1. Read `errandId` from route params (set by finding-runner).
//      If missing, fall back to a mock id so the screen still
//      renders during deep links / direct navigation.
//   2. Fetch via api.errands.listAvailableRunners(errandId).
//   3. Accept → api.errands.acceptRunner(errandId, runnerId),
//      then route to runner-secured with the chosen runner's
//      details attached.
//   4. Decline → optimistic remove + api.errands.rejectRunner.
//      If the API fails, we re-insert the runner.
//
// Empty state appears when the runner list is empty — either
// because the backend returned [], or because the customer
// declined them all.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.30;
const MAP_IMAGE = require('@/assets/map.png');

// ─── Fallback errand id (used when opened without params) ───
const FALLBACK_ERRAND_ID = 'err-1';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Backend sends price in kobo (integer). Convert to a display
 * string: "₦2,500".
 */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function AvailableRunners() {
  // ─── Route params — accumulated through the wizard ───
  // We keep them all in scope so the next screen (runner-secured)
  // inherits everything.
  const params = useLocalSearchParams<{
    errandId?: string;
    type?: string;
    promo?: string;
    store?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    photoCount?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const errandId = params.errandId || FALLBACK_ERRAND_ID;

  // ─── Data state ───
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which runner has a mutation in flight. Dims that card and
  // prevents double-taps. null = idle.
  const [busyId, setBusyId] = useState<string | null>(null);

  // ─── Fetch ───
  const fetchRunners = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      try {
        const list = await api.errands.listAvailableRunners(errandId);
        setRunners(list);
      } catch {
        setError(
          'Could not load available runners. Pull down to try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [errandId]
  );

  useEffect(() => {
    fetchRunners();
  }, [fetchRunners]);

  // ─── Decline — optimistic remove ───
  // Sequence:
  //   1. Snapshot the current list
  //   2. Remove the runner locally (instant feedback)
  //   3. Fire api.rejectRunner
  //   4. On failure: revert to snapshot
  const handleDecline = async (runner: Runner) => {
    if (busyId) return;

    const snapshot = runners;
    setBusyId(runner.id);
    setRunners((prev) => prev.filter((r) => r.id !== runner.id));

    try {
      await api.errands.rejectRunner(errandId, runner.id);
    } catch {
      // Roll back — put the runner back in the list
      setRunners(snapshot);
    } finally {
      setBusyId(null);
    }
  };

  // ─── Accept — call the API, then navigate ───
  // We do NOT navigate optimistically here. If the API rejects
  // (e.g. runner already taken by someone else), we want the user
  // to see the error and stay on this screen — not land on a
  // broken runner-secured page.
  const handleAccept = async (runner: Runner) => {
    if (busyId) return;

    setBusyId(runner.id);
    try {
      // Confirms the runner for this errand on the backend.
      // Returns the updated errand; we only need to know it
      // succeeded to proceed.
      await api.errands.acceptRunner(errandId, runner.id);

      // Route with the runner's details attached. runner-secured
      // will read them from params to display the summary card.
      router.replace({
        pathname: '/(customer)/errand/runner-secured',
        params: {
          ...params,
          errandId,
          runnerId: runner.id,
          runnerName: runner.name,
          runnerRating: String(runner.rating),
          runnerPrice: formatNaira(runner.price),
          runnerPickupMins: String(runner.pickupMins),
          runnerCompleted: String(runner.completed),
          runnerVehicle: runner.vehicle,
        },
      });
    } catch {
      // Stay on screen — show a lightweight inline error.
      // A Toast primitive would be cleaner; for now, we surface
      // the message via `error` at the top of the sheet.
      setError('Could not accept this runner. Please try another.');
      setBusyId(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <SafeAreaView
      className="flex-1 bg-background-subtle"
      edges={['top', 'left', 'right']}
    >
      {/* ─── Map strip (static image; real map is a future pass) ─── */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image
          source={MAP_IMAGE}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Route line */}
        <View
          className="absolute rounded-full"
          style={{
            top: '45%',
            left: '32%',
            width: '38%',
            height: 3,
            backgroundColor: colors.success,
            transform: [{ rotate: '18deg' }],
          }}
        />

        {/* Pickup pin */}
        <View className="absolute top-[48%] left-[30%]">
          <View className="w-7 h-7 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={12} color={colors.white} />
          </View>
        </View>

        {/* Dropoff pin */}
        <View className="absolute top-[32%] left-[62%]">
          <View className="w-7 h-7 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Feather name="home" size={12} color={colors.white} />
          </View>
        </View>
      </View>

      {/* ─── Bottom sheet ─── */}
      <View className="flex-1 bg-surface -mt-6 rounded-t-3xl pt-4">
        {/* Drag handle */}
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        {/* ═══ Loading — skeleton cards ═══ */}
        {loading ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6">
              {/* Heading skeletons */}
              <Skeleton width="60%" height={20} className="mb-2" />
              <Skeleton width="80%" height={12} className="mb-5" />

              <View className="gap-3">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="border border-border rounded-2xl p-4"
                  >
                    {/* Avatar + name row */}
                    <View className="flex-row items-center gap-3 mb-4">
                      <Skeleton width={48} height={48} radius={24} />
                      <View className="flex-1 gap-2">
                        <Skeleton width="60%" height={14} />
                        <Skeleton width="40%" height={11} />
                      </View>
                    </View>
                    {/* Price + ETA */}
                    <Skeleton width="40%" height={18} className="mb-2" />
                    <Skeleton width="80%" height={11} className="mb-4" />
                    {/* Buttons */}
                    <Skeleton width="100%" height={40} radius={14} className="mb-2" />
                    <Skeleton width="100%" height={40} radius={14} />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : null}

        {/* ═══ Error (fetch failure) ═══ */}
        {!loading && error && runners.length === 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchRunners(true)}
                tintColor={colors.primary}
              />
            }
          >
            <EmptyState
              icon="alert-circle"
              title="Couldn't load runners"
              body={error}
              actionLabel="Retry"
              onAction={() => fetchRunners()}
            />
          </ScrollView>
        ) : null}

        {/* ═══ Loaded — list or empty ═══ */}
        {!loading && (!error || runners.length > 0) ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchRunners(true)}
                tintColor={colors.primary}
              />
            }
          >
            <View className="px-6">
              <Text className="text-title font-gabarito text-ink mb-1">
                Available runners
              </Text>

              <Text className="text-caption font-figtree text-muted mb-5">
                Choose a verified runner for your errand.
              </Text>

              {/* Inline error (e.g. accept failed) */}
              {error && runners.length > 0 ? (
                <View className="bg-status-errorLight rounded-2xl px-4 py-3 mb-4 flex-row items-start">
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={colors.danger}
                    style={{ marginTop: 2, marginRight: 10 }}
                  />
                  <Text className="flex-1 text-body-xs font-figtree text-status-error">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="gap-3">
                {runners.length === 0 ? (
                  /* ─── Empty state ─── */
                  <EmptyState
                    icon="users"
                    title="No runners available right now"
                    body="Pull down to refresh, or try again in a moment."
                    actionLabel="Refresh"
                    onAction={() => fetchRunners()}
                  />
                ) : (
                  /* ─── Runner cards ─── */
                  runners.map((runner) => {
                    const isBusy = busyId === runner.id;
                    const disabled = !!busyId;

                    return (
                      <View
                        key={runner.id}
                        className={`
                          border border-border rounded-2xl p-4 bg-surface
                          ${isBusy ? 'opacity-60' : 'opacity-100'}
                        `}
                      >
                        {/* Top row: avatar + name + verified badge */}
                        <View className="flex-row items-start gap-3 mb-4">
                          <View className="w-12 h-12 rounded-full bg-background-dark items-center justify-center overflow-hidden">
                            {runner.avatarUrl ? (
                              <Image
                                source={{ uri: runner.avatarUrl }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            ) : (
                              <Feather
                                name="user"
                                size={22}
                                color={colors.subtle}
                              />
                            )}
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center gap-1.5 mb-1">
                              <Text className="text-body-sm font-gabarito-bold text-ink">
                                {runner.name}
                              </Text>
                              {runner.verified ? (
                                <View className="w-4 h-4 rounded-full bg-status-success items-center justify-center">
                                  <Feather
                                    name="check"
                                    size={10}
                                    color={colors.white}
                                  />
                                </View>
                              ) : null}
                            </View>

                            <Text className="text-caption-sm font-figtree text-muted">
                              ⭐ {runner.rating} · {runner.completed} errands
                            </Text>
                          </View>
                        </View>

                        {/* Price + ETA */}
                        <View className="mb-4">
                          <Text className="text-body font-gabarito-bold text-primary mb-1">
                            {formatNaira(runner.price)}
                          </Text>
                          <Text className="text-caption-sm font-figtree text-muted">
                            Pickup in {runner.pickupMins} min
                            {runner.shoppingMins
                              ? ` · Shopping location in ${runner.shoppingMins} min`
                              : ''}
                          </Text>
                        </View>

                        {/* Actions */}
                        <View className="gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            disabled={disabled}
                            onPress={() => handleDecline(runner)}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            loading={isBusy}
                            disabled={disabled && !isBusy}
                            onPress={() => handleAccept(runner)}
                          >
                            Accept
                          </Button>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}