import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const SERVICE_FEE = 1500;
const DISTANCE_FEE = 800;
const PLATFORM_FEE = 200;

export default function ErrandConfirmed() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
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

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        {/* Green check circle */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center">
            <Feather name="check" size={36} color="#22C55E" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-[22px] font-gabarito text-text-dark text-center mb-2">
          Your Errand is Confirmed 🎉
        </Text>
        <Text className="text-[13px] font-figtree text-text-gray text-center leading-5 mb-8">
          Runner {runnerName} is on his way to handle your requests.
        </Text>

        {/* Summary card */}
        <View className="border border-border rounded-2xl p-4 bg-white mb-6">
          <Text className="text-[11px] font-figtree-bold text-text-dark tracking-wider mb-4">
            ERRAND SUMMARY
          </Text>

          {/* Runner row */}
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ borderWidth: 2, borderColor: '#006B75' }}
            >
              <View className="w-full h-full rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                <Feather name="user" size={20} color="#94A3B8" />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[13px] font-gabarito text-text-dark">
                {runnerName} (Verified Runner)
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                ⭐ {runnerRating} · ETA {runnerPickupMins} mins
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border mb-4" />

          {/* Shopping from */}
          <View className="flex-row items-start gap-3 mb-4">
            <Feather name="shopping-bag" size={16} color="#FF9F1C" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-[9px] font-figtree-bold text-text-light uppercase tracking-wider mb-0.5">
                Shopping From
              </Text>
              <Text className="text-[13px] font-figtree-bold text-text-dark">
                {pickup}
              </Text>
            </View>
          </View>

          {/* Delivering to */}
          <View className="flex-row items-start gap-3 mb-4">
            <Feather name="map-pin" size={16} color="#006B75" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-[9px] font-figtree-bold text-text-light uppercase tracking-wider mb-0.5">
                Delivering To
              </Text>
              <Text className="text-[13px] font-figtree-bold text-text-dark">
                {dropoff}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border mb-4" />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-figtree text-text-gray">
              Total Amount Charged
            </Text>
            <Text className="text-[16px] font-gabarito text-primary">
              {totalCharged}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleTrack}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            Track Errand
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}