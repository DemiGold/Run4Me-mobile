import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { api } from '@/services/api';
import type { ErrandDraft } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Finding Runner — wired to the errands API
//
// Sits between checkout and available-runners. Responsibilities:
//
//   1. Create the errand on the backend (if not already created)
//      using all the wizard params (type, pickup, dropoff, items,
//      budget, instructions, timeline, promo).
//
//   2. Submit it — which puts the backend into "finding_runner"
//      status and starts matching.
//
//   3. Poll for a match. In this mock, "finding" takes ~5s and
//      then we auto-route to available-runners. In production,
//      this becomes a real poll of GET /errands/:id until the
//      status flips from finding_runner, or a WebSocket message.
//
//   4. Let the customer cancel — cancels the errand via the API
//      (if it was created) and returns to Home.
//
// Route params accepted from checkout:
//   type, promo, store, pickup, dropoff, items, budget,
//   instructions, photoCount, timeline, scheduledDate, scheduledTime
//
// On success: routes to available-runners with the new errandId
// attached so downstream screens can fetch/match against it.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.62;

const MAP_IMAGE = require('@/assets/map.png');

// ─── Timing (mock) ───
// How long the progress bar takes to reach ~95%. Real match
// duration depends on runner supply, so this is just visual.
const PROGRESS_TICK_MS = 800;
const PROGRESS_STEP = 4;

// How long the mock "finding" phase lasts before we route away.
// Real flow replaces this with a polling loop that exits when
// the errand status changes.
const MOCK_MATCH_MS = 5000;

// How many nearby runners to advertise (mock). Real backend could
// return this count from GET /errands/:id/matches/count.
const MOCK_NEARBY_RUNNERS = 5;

export default function FindingRunner() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
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
    // Optional — if the flow came from an already-created errand
    errandId?: string;
  }>();

  // ─── State ───
  // The errand id we end up routing away with. If checkout already
  // created the errand, we inherit it; otherwise we create one here.
  const [errandId, setErrandId] = useState<string | null>(
    params.errandId ?? null
  );

  // Progress bar percent. Starts at 10 so it's visible immediately.
  const [progress, setProgress] = useState(10);

  // Phase tracking for rendering + cancellation
  const [phase, setPhase] = useState<
    'creating' | 'submitting' | 'finding' | 'error'
  >('creating');

  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Prevent the async chain from doing anything after unmount
  const cancelled = useRef(false);

  // ─── Progress bar animation ───
  // Runs independently of the async work. Caps at 95% so we never
  // show "done" until the actual navigation happens.
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => Math.min(p + PROGRESS_STEP, 95));
    }, PROGRESS_TICK_MS);
    return () => clearInterval(t);
  }, []);

  // ─── Create + submit + find ───
  useEffect(() => {
    cancelled.current = false;

    async function startMatching() {
      try {
        let id = errandId;

        // Step 1 — create the errand if we don't already have one
        if (!id) {
          setPhase('creating');

          // Parse items back from the serialized string.
          // The wizard serializes as "Milk ×2, Bread ×1". We do a
          // light parse here; real fields like price/status stay
          // unset until the runner fills them in.
          const items = parseItemsString(params.items);

          const draft: ErrandDraft = {
            serviceType: params.type || 'shop-for-me',
            store: params.store,
            pickup: { address: params.pickup ?? '' },
            dropoff: { address: params.dropoff ?? '' },
            items,
            budget: Number(params.budget ?? 0),
            instructions: params.instructions,
            timeline: (params.timeline as 'now' | 'later') || 'now',
            scheduledFor:
              params.timeline === 'later' &&
              params.scheduledDate &&
              params.scheduledTime
                ? `${params.scheduledDate}T${params.scheduledTime}:00Z`
                : undefined,
            promoCode: params.promo,
          };

          const errand = await api.errands.createErrand(draft);
          if (cancelled.current) return;

          id = errand.id;
          setErrandId(id);
        }

        // Step 2 — submit (moves status to finding_runner)
        setPhase('submitting');
        await api.errands.submitErrand(id);
        if (cancelled.current) return;

        // Step 3 — find a runner
        setPhase('finding');

        // ─── MOCK: wait ~5s then move on ───
        // In production this becomes:
        //   while (true) {
        //     await sleep(2000);
        //     const errand = await api.errands.getErrand(id);
        //     if (errand.status !== 'finding_runner') break;
        //   }
        // Or a WebSocket subscription that resolves when the
        // backend assigns a runner.
        await new Promise((r) => setTimeout(r, MOCK_MATCH_MS));
        if (cancelled.current) return;

        // Route with the errand id attached so downstream screens
        // (available-runners, runner-secured, checkout) can query
        // the same errand.
        router.replace({
          pathname: '/(customer)/errand/available-runners',
          params: { ...params, errandId: id },
        });
      } catch (e) {
        if (cancelled.current) return;
        setPhase('error');
        setError(
          e instanceof Error
            ? e.message
            : 'Could not start matching. Please try again.'
        );
      }
    }

    startMatching();

    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cancel — cancels the errand if created ───
  const handleCancel = useCallback(async () => {
    if (cancelling) return;

    const doCancel = async () => {
      setCancelling(true);
      try {
        if (errandId) {
          await api.errands.cancelErrand(errandId, 'User cancelled during match');
        }
      } catch {
        // Silent — we're navigating away regardless
      } finally {
        cancelled.current = true;
        router.replace('/(customer)');
      }
    };

    // If the errand has been created, warn that cancelling is
    // destructive. If not, just leave.
    if (errandId) {
      Alert.alert(
        'Cancel request?',
        'This will stop searching for a runner. You can start a new errand anytime.',
        [
          { text: 'Keep searching', style: 'cancel' },
          {
            text: 'Cancel request',
            style: 'destructive',
            onPress: doCancel,
          },
        ]
      );
    } else {
      router.replace('/(customer)');
    }
  }, [errandId, cancelling]);

  // ─── Retry (from error state) ───
  const handleRetry = () => {
    setError(null);
    setPhase('creating');
    setProgress(10);
    // Force the effect to re-run by unmounting + remounting logic.
    // Simplest: reload the screen by routing back to itself with
    // the same params.
    router.replace({
      pathname: '/(customer)/errand/finding-runner',
      params,
    });
  };

  // ─── Status copy driven by phase ───
  const statusTitle =
    phase === 'creating'
      ? 'Setting up your errand...'
      : phase === 'submitting'
      ? 'Submitting your request...'
      : phase === 'finding'
      ? 'Finding an Errand Runner...'
      : 'Something went wrong';

  const statusSubtitle =
    phase === 'creating' || phase === 'submitting'
      ? 'Just a moment, this will only take a second.'
      : phase === 'finding'
      ? `${MOCK_NEARBY_RUNNERS} verified runners are available nearby.`
      : error ?? 'Please try again.';

  return (
    <View className="flex-1 bg-surface">

      {/* ═══ MAP ═══ */}
      <View
        className="w-full rounded-b-3xl overflow-hidden relative"
        style={{ height: MAP_HEIGHT }}
      >
        <Image
          source={MAP_IMAGE}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Route line — decorative */}
        <View
          className="absolute rounded-full"
          style={{
            top: '30%',
            left: '20%',
            width: '55%',
            height: 3,
            backgroundColor: colors.primary,
            transform: [{ rotate: '25deg' }],
          }}
        />

        {/* Pin A — Pickup */}
        <View className="absolute top-[22%] left-[12%] items-center">
          <View className="w-8 h-8 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Text className="text-white text-caption font-gabarito">A</Text>
          </View>
        </View>

        {/* Pin B — Dropoff */}
        <View className="absolute top-[42%] left-[58%] items-center">
          <View className="w-8 h-8 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Text className="text-white text-caption font-gabarito">B</Text>
          </View>
        </View>

        {/* Secondary B marker */}
        <View className="absolute top-[52%] left-[48%] items-center">
          <View className="w-7 h-7 rounded-md bg-accent items-center justify-center">
            <Text className="text-white text-caption-sm font-gabarito">B</Text>
          </View>
        </View>

        {/* Current location dot */}
        <View className="absolute top-[20%] left-[42%] items-center">
          <View className="w-4 h-4 rounded-full bg-primary border-2 border-white" />
        </View>

        {/* Pin C — destination */}
        <View className="absolute top-[62%] left-[42%] items-center">
          <View className="w-7 h-7 rounded-md bg-status-success items-center justify-center">
            <Text className="text-white text-caption-sm font-gabarito">C</Text>
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View
        className="bg-surface -mt-6 rounded-t-3xl px-6 pt-6 flex-1"
        style={{
          minHeight: height * 0.35,
          paddingBottom: Math.max(insets.bottom, 24) + 8,
        }}
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        {/* Title — changes with phase */}
        <Text className="text-title font-gabarito text-ink mb-1">
          {statusTitle}
        </Text>

        {/* Subtitle */}
        <Text className="text-caption font-figtree text-muted mb-5">
          {statusSubtitle}
        </Text>

        {/* Progress bar — hidden on error, since it's not progressing */}
        {phase !== 'error' ? (
          <View className="h-1.5 bg-background-dark rounded-full overflow-hidden mb-8">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        ) : (
          <View className="mb-8" />
        )}

        {/* Actions — differ per phase */}
        {phase === 'error' ? (
          <View className="gap-3">
            <Button variant="primary" fullWidth onPress={handleRetry}>
              Try again
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => router.replace('/(customer)')}
            >
              Back to Home
            </Button>
          </View>
        ) : (
          <Button
            variant="destructive"
            fullWidth
            loading={cancelling}
            onPress={handleCancel}
          >
            Cancel Request
          </Button>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Parse the serialized items string from the wizard back into an
 * array of ErrandItem-like objects.
 *
 * Input:  "Fresh Milk (2 Liters) ×1, Loaf of Sliced Bread ×2"
 * Output: [{ id, name, quantity }, ...]
 *
 * The `×N` suffix is the format items.tsx produces when it
 * serializes the shopping list.
 */
function parseItemsString(
  raw: string | undefined
): ErrandDraft['items'] {
  if (!raw?.trim()) return [];

  return raw.split(',').map((chunk, i) => {
    const trimmed = chunk.trim();
    // Match "Name ×2" (or "Name x2" if the user typed it manually)
    const match = trimmed.match(/^(.*?)\s*[×x](\d+)\s*$/i);
    if (match) {
      return {
        id: `item-${i}`,
        name: match[1].trim(),
        quantity: Number(match[2]) || 1,
      };
    }
    return {
      id: `item-${i}`,
      name: trimmed,
      quantity: 1,
    };
  });
}