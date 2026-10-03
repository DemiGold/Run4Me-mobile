import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Errand Confirmed
//
// Post-payment confirmation. Shows the matched runner, pickup /
// dropoff, and total charged. Tracking CTA routes to live-tracking.
//
// Figma: errand-confirmed
//   Green success circle · title · subtitle · summary card ·
//   Track Errand CTA.
//
// MOCK: values come from route params with sensible fallbacks.
// ─────────────────────────────────────────────────────────────

const SERVICE_FEE = 1500;
const DISTANCE_FEE = 800;
const PLATFORM_FEE = 200;

export default function ErrandConfirmed() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    paymentMethod?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    runnerPickupMins?: string;
  }>();

  const runnerName = params.runnerName ?? 'David';
  const runnerRating = params.runnerRating ?? '4.9';
  const runnerPickupMins = params.runnerPickupMins ?? '7';

  const budget = Number(params.budget ?? '15000') || 15000;
  const promoDiscount = params.promo === 'FIRST4ME' ? 1000 : 0;
  const totalCharged = `₦${(
    budget +
    SERVICE_FEE +
    DISTANCE_FEE +
    PLATFORM_FEE -
    promoDiscount
  ).toLocaleString('en-US')}`;

  const pickup = params.pickup ?? 'Shoprite Lekki';
  const dropoff = params.dropoff ?? '12 Admiralty Way, Lekki';

  const handleTrack = () => {
    router.replace({
      pathname: '/(customer)/errand/live-tracking',
      params,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-6 pt-12">
        {/* Success circle */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-status-successLight items-center justify-center">
            <Feather name="check" size={36} color={colors.success} />
          </View>
        </View>

        {/* Title + subtitle */}
        <Text className="text-heading-sm font-gabarito text-ink text-center mb-2">
          Your Errand is Confirmed 🎉
        </Text>
        <Text className="text-body-xs font-figtree text-muted text-center mb-8">
          Runner {runnerName} is on his way to handle your requests.
        </Text>

        {/* Summary card */}
        <View className="border border-border rounded-2xl p-4 bg-surface mb-6">
          <Text className="text-micro font-figtree-bold text-ink uppercase tracking-wider mb-4">
            ERRAND SUMMARY
          </Text>

          {/* Runner row */}
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ borderWidth: 2, borderColor: colors.primary }}
            >
              <View className="w-full h-full rounded-full bg-background-dark items-center justify-center overflow-hidden">
                <Feather name="user" size={20} color={colors.subtle} />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-body-xs font-gabarito-bold text-ink">
                {runnerName} (Verified Runner)
              </Text>
              <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                ⭐ {runnerRating} · ETA {runnerPickupMins} mins
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border mb-4" />

          {/* Shopping from */}
          <View className="flex-row items-start gap-3 mb-4">
            <Feather
              name="shopping-bag"
              size={16}
              color={colors.accent}
              style={{ marginTop: 2 }}
            />
            <View className="flex-1">
              <Text className="text-micro font-figtree-bold text-text-light uppercase tracking-wider mb-0.5">
                Shopping From
              </Text>
              <Text className="text-body-xs font-figtree-bold text-ink">
                {pickup}
              </Text>
            </View>
          </View>

          {/* Delivering to */}
          <View className="flex-row items-start gap-3 mb-4">
            <Feather
              name="map-pin"
              size={16}
              color={colors.primary}
              style={{ marginTop: 2 }}
            />
            <View className="flex-1">
              <Text className="text-micro font-figtree-bold text-text-light uppercase tracking-wider mb-0.5">
                Delivering To
              </Text>
              <Text className="text-body-xs font-figtree-bold text-ink">
                {dropoff}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border mb-4" />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text className="text-caption font-figtree text-muted">
              Total Amount Charged
            </Text>
            <Text className="text-body font-gabarito-bold text-primary">
              {totalCharged}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleTrack}>
          Track Errand
        </Button>
      </View>
    </SafeAreaView>
  );
}