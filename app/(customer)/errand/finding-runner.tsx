import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Finding Runner
//
// Shown after checkout as we match the customer with a runner.
// Progress bar fills over ~5 seconds, then routes to the
// available-runners list.
//
// Figma: finding-runner
//   Map (62% height) with route line + pins · bottom sheet with
//   progress bar + Cancel Request.
//
// MOCK: matching takes 5s. Real flow: poll GET /errands/:id/match
// or subscribe via WebSocket until a runner is assigned.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.62;

const MAP_IMAGE = require('@/assets/map.png');

// Match simulation timings (mock — swap for real polling)
const MOCK_MATCH_MS = 5000;
const PROGRESS_TICK_MS = 800;

export default function FindingRunner() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const [progress, setProgress] = useState(35);

  // ─── Mock match: grow progress bar, auto-advance after 5s ───
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + 5));
    }, PROGRESS_TICK_MS);

    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/(customer)/errand/available-runners',
        params,
      });
    }, MOCK_MATCH_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    router.replace('/(customer)');
  };

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

        {/* Route line — decorative, teal (was off-palette magenta) */}
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

        {/* Pin A — Pickup (teal) */}
        <View className="absolute top-[22%] left-[12%] items-center">
          <View className="w-8 h-8 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Text className="text-white text-caption font-gabarito">A</Text>
          </View>
        </View>

        {/* Pin B — Dropoff (orange) */}
        <View className="absolute top-[42%] left-[58%] items-center">
          <View className="w-8 h-8 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Text className="text-white text-caption font-gabarito">B</Text>
          </View>
        </View>

        {/* Secondary B marker (destination) */}
        <View className="absolute top-[52%] left-[48%] items-center">
          <View className="w-7 h-7 rounded-md bg-accent items-center justify-center">
            <Text className="text-white text-caption-sm font-gabarito">B</Text>
          </View>
        </View>

        {/* Current location dot */}
        <View className="absolute top-[20%] left-[42%] items-center">
          <View className="w-4 h-4 rounded-full bg-primary border-2 border-white" />
        </View>

        {/* Pin C — green destination */}
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

        {/* Title */}
        <Text className="text-title font-gabarito text-ink mb-1">
          Finding an Errand Runner...
        </Text>

        {/* Subtitle */}
        <Text className="text-caption font-figtree text-muted mb-5">
          5 verified runners are available nearby.
        </Text>

        {/* Progress bar */}
        <View className="h-1.5 bg-background-dark rounded-full overflow-hidden mb-8">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Cancel button — destructive variant */}
        <Button variant="destructive" fullWidth onPress={handleCancel}>
          Cancel Request
        </Button>
      </View>
    </View>
  );
}