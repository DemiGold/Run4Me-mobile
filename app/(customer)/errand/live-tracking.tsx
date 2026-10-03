import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type {
  Errand,
  Runner,
  RunnerTracking,
} from '@/services/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Live Tracking — wired to the errands API with polling
//
// Two independent data streams:
//
//   1. GET /errands/:id  — once on mount. Gives us the runner's
//      name/rating/role so the bottom card isn't a placeholder.
//      This data rarely changes, so no polling.
//
//   2. GET /errands/:id/tracking  — polled every POLL_MS. Gives
//      us the runner's current coordinate, delivery status, and
//      ETA. Drives the top banner text and the stepper.
//
// Why two calls: the errand snapshot is stable, the tracking is
// hot. Mixing them would poll the whole errand object every 3s
// for no reason.
//
// Cancellation safety:
//   Both effects use a `cancelled` ref that flips on unmount.
//   Any late-arriving promise response is dropped. Prevents the
//   classic "setState on unmounted component" warning.
//
// Mock behaviour:
//   - getTracking returns a jittered position each call so the
//     map markers appear to drift slightly.
//   - Status is always 'en_route_to_you' for the mock. The
//     stepper reflects that (index 4 of 6).
//
// Real backend integration:
//   Replace the setInterval with a WebSocket subscription:
//     const ws = new WebSocket(`wss://api.run4me.com/errands/${id}/live`);
//     ws.onmessage = (e) => setTracking(JSON.parse(e.data));
//   Same state shape, fewer requests.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.52;
const MAP_IMAGE = require('@/assets/map.png');

// ─── Progress steps — matches Figma ───
const STEPS = [
  'Runner Assigned',
  'Heading to Store',
  'Arrived at Store',
  'Shopping in Progress',
  'Runner on his way back',
  'Runner is here',
];

// ─── Poll interval (ms) ───
// 3s is a good balance: fresh enough to feel live, cheap enough
// to not hammer the backend. Real apps use 2–5s.
const POLL_MS = 3000;

// ─── Fallback errand id when opened without params ───
const FALLBACK_ERRAND_ID = 'err-1';

// ─── Fallback runner, used if the errand fetch hasn't resolved ───
const FALLBACK_RUNNER: Pick<Runner, 'name' | 'rating' | 'vehicle'> & {
  role: string;
  phone: string;
} = {
  name: 'Your Runner',
  rating: 5.0,
  vehicle: 'Scooter',
  role: 'Delivery Agent',
  phone: '+2348000000000',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Map a backend tracking status to a step index in the STEPS
 * array. Everything before the current index is considered done.
 *
 * Real backend status values:
 *   'en_route_to_store' → step 1 (Heading to Store)
 *   'shopping'          → step 3 (Shopping in Progress)
 *   'en_route_to_you'   → step 4 (Runner on his way back)
 *   'arrived'           → step 5 (Runner is here)
 */
const statusToStepIndex = (status: RunnerTracking['status']): number => {
  switch (status) {
    case 'en_route_to_store': return 1;
    case 'shopping':          return 3;
    case 'en_route_to_you':   return 4;
    case 'arrived':           return 5;
    default:                  return 1;
  }
};

/**
 * Top banner copy based on the current tracking status.
 */
const statusBannerText = (
  status: RunnerTracking['status'] | undefined,
  runnerName: string
): string => {
  switch (status) {
    case 'en_route_to_store':
      return `${runnerName} is heading to the store`;
    case 'shopping':
      return `${runnerName} is shopping`;
    case 'en_route_to_you':
      return `${runnerName} is on his way to you`;
    case 'arrived':
      return `${runnerName} has arrived`;
    default:
      return `${runnerName} is being assigned`;
  }
};

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function LiveTracking() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    id?: string;
    errandId?: string;
    type?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    items?: string;
  }>();

  // Prefer `id`, fall back to `errandId` (some screens pass either),
  // then the mock id so the screen renders on deep links too.
  const errandId = params.id || params.errandId || FALLBACK_ERRAND_ID;

  // ─── Data state ───
  const [errand, setErrand] = useState<Errand | null>(null);
  const [tracking, setTracking] = useState<RunnerTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch the errand once (for runner details) ───
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const e = await api.errands.getErrand(errandId);
        if (!cancelled) setErrand(e);
      } catch {
        // Errand fetch failing isn't fatal — the tracking poll
        // below still drives the screen. We fall back to a
        // generic runner card in that case.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [errandId]);

  // ─── Poll live tracking every POLL_MS ───
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const t = await api.errands.getTracking(errandId);
        if (cancelled) return;

        setTracking(t);
        setError(null);
        // Only flip loading off on the FIRST successful poll.
        // Later failures shouldn't blank the screen — we keep
        // showing the last known position.
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError('Lost connection. Retrying...');
        // Intentionally keep `loading` as-is. If the very first
        // poll fails, we stay in skeleton until a poll succeeds.
      }
    };

    // Immediate first poll so we don't wait 3s for the first render
    poll();
    const interval = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [errandId]);

  // ─── Derived values ───
  const runner = errand?.runner ?? null;
  const runnerName = runner?.name ?? FALLBACK_RUNNER.name;
  const runnerRating = runner?.rating ?? FALLBACK_RUNNER.rating;
  const runnerRole = FALLBACK_RUNNER.role; // backend doesn't send role yet
  const runnerPhone = FALLBACK_RUNNER.phone; // ditto for phone

  const currentStep = tracking
    ? statusToStepIndex(tracking.status)
    : 1;

  const bannerText = statusBannerText(tracking?.status, runnerName);
  const etaMinutes = tracking?.etaMinutes ?? null;

  // ─── Actions ───
  const handleChat = useCallback(() => {
    router.push({
      pathname: '/(customer)/errand/chat',
      params: {
        errandId,
        runnerName,
        // Pass items so the paste shortcut is real, not mocked
        items: params.items ?? '',
      },
    });
  }, [errandId, runnerName, params.items]);

  const handleCall = () => {
    Linking.openURL(`tel:${runnerPhone}`).catch(() => {
      Alert.alert('Cannot place call', 'Your device does not support calling.');
    });
  };

  const handleSos = () => {
    Alert.alert(
      'Emergency Support',
      'This will contact Run4Me support and share your live location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          style: 'destructive',
          onPress: () => {
            // ─── MOCK: wire to real support hotline when available ───
            Linking.openURL('tel:+2348000000000');
          },
        },
      ]
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <View className="flex-1 bg-surface">

      {/* ═══ TOP HEADER — floats over map ═══ */}
      <View
        className="absolute z-10 left-0 right-0 px-5"
        style={{ top: insets.top + 8 }}
      >
        <Text className="text-micro font-figtree-bold text-primary tracking-widest mb-2 pl-1">
          LEKKI, LAGOS, NIGERIA
        </Text>

        <View className="bg-surface rounded-full px-3 py-2.5 flex-row items-center gap-3 shadow-md">
          <View className="w-2 h-2 rounded-full bg-status-success" />

          <Text className="flex-1 text-body-xs font-figtree-bold text-ink">
            {bannerText}
          </Text>

          {etaMinutes !== null ? (
            <View className="bg-accent-light rounded-full px-2.5 py-1">
              <Text className="text-micro font-figtree-bold text-accent">
                {etaMinutes} Mins Left
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ═══ MAP ═══ */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image
          source={MAP_IMAGE}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Path line */}
        <View
          className="absolute rounded-full bg-primary"
          style={{
            top: '40%',
            left: '30%',
            width: '45%',
            height: 3,
            transform: [{ rotate: '20deg' }],
          }}
        />

        {/* Runner marker — position jitters as tracking updates,
            but the mock returns coordinates that don't map to
            screen %s cleanly. We keep the fixed visual for now;
            a real map component will anchor markers to actual
            lat/lng. */}
        <View className="absolute top-[52%] left-[38%]">
          <View className="w-9 h-9 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="navigation" size={16} color={colors.white} />
          </View>
        </View>

        {/* Destination marker */}
        <View className="absolute top-[32%] left-[62%]">
          <View className="w-9 h-9 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Feather name="map-pin" size={16} color={colors.white} />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View className="flex-1 bg-surface -mt-6 rounded-t-3xl pt-3">
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ═══ Stepper — skeleton while we haven't polled yet ═══ */}
          {loading && !tracking ? (
            <View className="mb-5 gap-3">
              {STEPS.map((_, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <Skeleton width={20} height={20} radius={10} />
                  <Skeleton width="60%" height={12} />
                </View>
              ))}
            </View>
          ) : (
            <View className="mb-5">
              {STEPS.map((step, index) => {
                const isDone = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <View
                    key={step}
                    className="flex-row items-center gap-3 mb-3"
                  >
                    <View
                      className={`
                        w-5 h-5 rounded-full items-center justify-center
                        ${
                          isDone
                            ? 'bg-primary'
                            : isCurrent
                            ? 'bg-surface border-2 border-primary'
                            : 'bg-surface border-2 border-border-light'
                        }
                      `}
                    >
                      {isDone ? (
                        <Feather
                          name="check"
                          size={11}
                          color={colors.white}
                        />
                      ) : isCurrent ? (
                        <View className="w-2 h-2 rounded-full bg-primary" />
                      ) : null}
                    </View>

                    <Text
                      className={`
                        text-body-xs
                        ${
                          isDone || isCurrent
                            ? 'font-figtree-bold text-ink'
                            : 'font-figtree text-text-light'
                        }
                      `}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* ═══ Inline error — shown when polling fails ═══ */}
          {error ? (
            <View className="bg-status-errorLight rounded-2xl px-4 py-3 mb-3 flex-row items-start">
              <Feather
                name="wifi-off"
                size={14}
                color={colors.danger}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text className="flex-1 text-caption font-figtree text-status-error">
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* ═══ RUNNER CARD ═══ */}
        <View className="px-6 pt-3 pb-6 border-t border-border">
          <View className="flex-row items-center gap-3">
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ borderWidth: 2, borderColor: colors.primary }}
            >
              <View className="w-full h-full rounded-full bg-background-dark items-center justify-center overflow-hidden">
                {runner?.avatarUrl ? (
                  <Image
                    source={{ uri: runner.avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="user" size={20} color={colors.subtle} />
                )}
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-body-sm font-gabarito-bold text-ink">
                {runnerName}
              </Text>
              <Text className="text-caption-sm font-figtree text-muted">
                ⭐ {runnerRating} · {runnerRole}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {/* Chat */}
              <TouchableOpacity
                onPress={handleChat}
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather
                  name="message-circle"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {/* Call */}
              <TouchableOpacity
                onPress={handleCall}
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="phone" size={18} color={colors.primary} />
              </TouchableOpacity>

              {/* SOS */}
              <TouchableOpacity
                onPress={handleSos}
                className="w-10 h-10 rounded-full bg-status-errorLight items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="shield" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ═══ DEV-ONLY: skip ahead to shopping-progress ═══
          Hidden in production builds via __DEV__. Remove
          entirely once live-tracking is driven by real backend
          status transitions. */}
      {__DEV__ ? (
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: '/(customer)/errand/shopping-progress',
              params: { ...params, errandId },
            })
          }
          className="absolute right-5 rounded-full bg-accent px-4 py-3 flex-row items-center gap-2"
          style={{ bottom: 90 }}
          activeOpacity={0.85}
        >
          <Feather name="skip-forward" size={14} color={colors.white} />
          <Text className="text-caption font-gabarito text-white tracking-wider">
            DEV: Next Stage
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}