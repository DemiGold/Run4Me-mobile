import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Runner Secured
//
// Shown after the customer taps a runner on available-runners.
// Map preview + runner card + vehicle ETA + "Confirm Errand".
//
// Figma: runner-secured
//   Map at 55% height (edge-to-edge under status bar) ·
//   bottom sheet with secured pill, runner card, vehicle box, CTA.
//
// MOCK: runner details arrive as route params from
// available-runners. Fall back to FALLBACK_RUNNER if absent.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.55;
const MAP_IMAGE = require('@/assets/map.png');

const FALLBACK_RUNNER = {
  name: 'David Adeyemi',
  rating: '4.9',
  completed: '248',
  vehicle: 'Yamaha Scooter',
  pickupMins: '7',
};

export default function RunnerSecured() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    runnerId?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
  }>();

  const runnerName = params.runnerName ?? FALLBACK_RUNNER.name;
  const runnerRating = params.runnerRating ?? FALLBACK_RUNNER.rating;
  const runnerCompleted = params.runnerCompleted ?? FALLBACK_RUNNER.completed;
  const runnerVehicle = params.runnerVehicle ?? FALLBACK_RUNNER.vehicle;
  const runnerPickupMins =
    params.runnerPickupMins ?? FALLBACK_RUNNER.pickupMins;

  const handleConfirm = () => {
    router.replace({
      pathname: '/(customer)/errand/payment/checkout',
      params: {
        ...params,
        runnerName,
        runnerRating,
        runnerCompleted,
        runnerVehicle,
        runnerPickupMins,
      },
    });
  };

  return (
    <View className="flex-1 bg-surface">

      {/* ═══ MAP (edge-to-edge under status bar) ═══ */}
      <View
        className="w-full rounded-b-3xl overflow-hidden relative"
        style={{ height: MAP_HEIGHT }}
      >
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        {/* Route path */}
        <View
          className="absolute rounded-full"
          style={{
            top: '28%',
            left: '30%',
            width: '40%',
            height: 3,
            backgroundColor: colors.success,
            transform: [{ rotate: '15deg' }],
          }}
        />

        {/* Dropoff pin */}
        <View className="absolute top-[35%] left-[50%] items-center">
          <View className="w-10 h-10 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="home" size={18} color={colors.white} />
          </View>
        </View>

        {/* Pickup pin */}
        <View className="absolute top-[55%] left-[28%] items-center">
          <View className="w-10 h-10 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={18} color={colors.white} />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View
        className="bg-surface -mt-8 rounded-t-3xl px-6 pt-4 flex-1"
        style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-4" />

        {/* "Runner Secured" pill */}
        <View className="self-start bg-status-successLight rounded-full px-3 py-1.5 flex-row items-center gap-1.5 mb-5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
          <Text className="text-micro font-figtree-bold text-status-successDark tracking-wider">
            RUNNER SECURED
          </Text>
        </View>

        {/* Runner info row */}
        <View className="flex-row items-center gap-3 mb-4">
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ borderWidth: 2, borderColor: colors.primary }}
          >
            <View className="w-full h-full rounded-full bg-background-dark items-center justify-center overflow-hidden">
              <Feather name="user" size={26} color={colors.subtle} />
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0.5">
              <Text className="text-body font-gabarito-bold text-ink">
                {runnerName}
              </Text>
              <View className="bg-primary px-1.5 py-[2px] rounded">
                <Text className="text-micro font-figtree-bold text-white tracking-wider">
                  VERIFIED
                </Text>
              </View>
            </View>

            <Text className="text-caption-sm font-figtree text-muted">
              ⭐ {runnerRating} · {runnerCompleted} errands completed
            </Text>
          </View>
        </View>

        {/* Vehicle info box */}
        <View className="bg-background-light rounded-2xl p-4 flex-row items-center gap-3 mb-6">
          <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center">
            <Feather name="zap" size={16} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-caption-sm font-figtree text-muted mb-0.5">
              {runnerName} is riding a {runnerVehicle}
            </Text>
            <Text className="text-body-xs font-figtree-bold text-ink">
              Arriving at pickup in {runnerPickupMins} minutes
            </Text>
          </View>
        </View>

        {/* Confirm CTA */}
        <Button variant="primary" fullWidth onPress={handleConfirm}>
          Confirm Errand
        </Button>
      </View>
    </View>
  );
}