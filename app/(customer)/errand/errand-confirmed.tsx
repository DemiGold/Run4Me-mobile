import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Errand Confirmed
//
// Shown after a successful payment. Doesn't fetch anything —
// every value it needs arrives via route params from whichever
// payment screen just completed:
//
//   - `amount`   (kobo string)  ← set by the payment screen
//   - `runnerX`  (strings)      ← set by available-runners
//   - `pickup` / `dropoff`      ← set by the wizard
//   - `errandId`                ← set by finding-runner
//
// Why we don't fetch: the customer is staring at a "success"
// screen. A network round-trip here would delay the reward moment.
// All the data we display is already in params — render immediately.
//
// Units reminder:
//   `amount` arrives in KOBO (this is downstream of checkout's
//   conversion boundary). `formatNaira` divides by 100 for display.
// ─────────────────────────────────────────────────────────────

/**
 * Display a kobo amount as naira: 2000000 → "₦20,000".
 * Kobo is our internal unit downstream of checkout.
 */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

export default function ErrandConfirmed() {
  const params = useLocalSearchParams<{
    // Set by payment screens
    amount?: string;
    paymentMethod?: string;
    paymentId?: string;
    errandId?: string;
    // Wizard chain
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    // Runner details
    runnerId?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    runnerPickupMins?: string;
    runnerPrice?: string;
  }>();

  // ─── Total charged ───
  // `amount` is kobo (from the payment screen). Fall back to 0 if
  // somehow missing — the screen still renders, just shows ₦0.
  const amountKobo = Number(params.amount ?? '0') || 0;

  // ─── Runner details ───
  const runnerName = params.runnerName ?? 'Your Runner';
  const runnerRating = params.runnerRating ?? '5.0';
  const runnerPickupMins = params.runnerPickupMins ?? '—';

  // ─── Locations ───
  const pickup = params.pickup ?? 'Pickup location';
  const dropoff = params.dropoff ?? 'Delivery address';

  // ─── Track Errand ───
  // Everything from this screen carries forward so live-tracking
  // can poll tracking data with the right errandId and still show
  // the right runner/pickup/dropoff details.
  const handleTrack = () => {
    router.replace({
      pathname: '/(customer)/errand/live-tracking',
      params: {
        ...params,
        // Ensure live-tracking gets errandId under the key it reads.
        id: params.errandId,
        errandId: params.errandId,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-6 pt-12">
        {/* ─── Success circle ─── */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-status-successLight items-center justify-center">
            <Feather name="check" size={36} color={colors.success} />
          </View>
        </View>

        {/* ─── Title + subtitle ─── */}
        <Text className="text-heading-sm font-gabarito text-ink text-center mb-2">
          Your Errand is Confirmed 🎉
        </Text>
        <Text className="text-body-xs font-figtree text-muted text-center mb-8">
          Runner {runnerName} is on his way to handle your requests.
        </Text>

        {/* ─── Summary card ─── */}
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
              {formatNaira(amountKobo)}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── CTA ─── */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleTrack}>
          Track Errand
        </Button>
      </View>
    </SafeAreaView>
  );
}