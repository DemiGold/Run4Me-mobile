import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.55;
const MAP_IMAGE = require('../../../assets/map.png');

const FALLBACK_RUNNER = {
  name: 'David Adeyemi',
  rating: '4.9',
  completed: '248',
  vehicle: 'Yamaha Scooter',
  pickupMins: '7',
};

export default function RunnerSecured() {
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

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const runnerName = params.runnerName ?? FALLBACK_RUNNER.name;
  const runnerRating = params.runnerRating ?? FALLBACK_RUNNER.rating;
  const runnerCompleted = params.runnerCompleted ?? FALLBACK_RUNNER.completed;
  const runnerVehicle = params.runnerVehicle ?? FALLBACK_RUNNER.vehicle;
  const runnerPickupMins = params.runnerPickupMins ?? FALLBACK_RUNNER.pickupMins;

  const handleConfirm = () => {
    router.replace({
      pathname: '/(errand)/create-errand/errand-confirmed',
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
    <View className="flex-1 bg-white">
      {/* ═══ MAP ═══ */}
      <View
        className="w-full rounded-b-3xl overflow-hidden relative"
        style={{ height: MAP_HEIGHT }}
      >
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        <View
          className="absolute rounded-full"
          style={{
            top: '28%',
            left: '30%',
            width: '40%',
            height: 3,
            backgroundColor: '#4CAF50',
            transform: [{ rotate: '15deg' }],
          }}
        />

        {/* Dropoff pin */}
        <View className="absolute top-[35%] left-[50%] items-center">
          <View className="w-10 h-10 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="home" size={18} color="#FFFFFF" />
          </View>
        </View>

        {/* Pickup pin */}
        <View className="absolute top-[55%] left-[28%] items-center">
          <View className="w-10 h-10 rounded-full bg-secondary border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View className="bg-white -mt-8 rounded-t-3xl px-6 pt-4 pb-8 flex-1">
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-4" />

        {/* Runner Secured Pill */}
        <View className="self-start bg-green-50 rounded-full px-3 py-1.5 flex-row items-center gap-1.5 mb-5">
          <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <Text className="text-[10px] font-figtree-bold text-green-600 tracking-wider">
            RUNNER SECURED
          </Text>
        </View>

        {/* Runner info row */}
        <View className="flex-row items-center gap-3 mb-4">
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ borderWidth: 2, borderColor: '#006B75' }}
          >
            <View className="w-full h-full rounded-full bg-slate-200 items-center justify-center overflow-hidden">
              <Feather name="user" size={26} color="#94A3B8" />
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0.5">
              <Text className="text-[16px] font-gabarito text-text-dark">
                {runnerName}
              </Text>
              <View className="bg-primary px-1.5 py-[2px] rounded">
                <Text className="text-[8px] font-figtree-bold text-white tracking-wider">
                  VERIFIED
                </Text>
              </View>
            </View>

            <Text className="text-[11px] font-figtree text-text-gray">
              ⭐ {runnerRating} · {runnerCompleted} errands completed
            </Text>
          </View>
        </View>

        {/* Vehicle info box */}
        <View className="bg-background-light rounded-2xl p-4 flex-row items-center gap-3 mb-6">
          <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center">
            <Feather name="zap" size={16} color="#006B75" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-figtree text-text-gray mb-0.5">
              {runnerName} is riding a {runnerVehicle}
            </Text>
            <Text className="text-[13px] font-figtree-bold text-text-dark">
              Arriving at pickup in {runnerPickupMins} minutes
            </Text>
          </View>
        </View>

        {/* Confirm Errand CTA */}
        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            Confirm Errand
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}