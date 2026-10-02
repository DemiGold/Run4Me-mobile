import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.48;
const EXPIRY_SECONDS = 24;

const MAP_IMAGE = require('@/assets/map.png');

const ERRANDS_DATA: Record<string, any> = {
  '1': {
    id: '1',
    type: 'SHOP FOR ME',
    title: 'Shop for Me',
    subtitle: 'New Request Nearby',
    earnings: '₦2,500',
    pickup: 'Shoprite Lekki',
    pickupAddress: 'Shoprite, Lekki Phase 1, Lagos',
    dropoff: '12 Admiralty Way, Lekki',
    dropoffAddress: '12 Admiralty Way, Lekki Phase 1, Lagos',
    distance: '4.2 km away',
    eta: '35 mins est.',
  },
  '2': {
    id: '2',
    type: 'PHARMACY',
    title: 'Pharmacy',
    subtitle: 'New Request Nearby',
    earnings: '₦1,800',
    pickup: 'Medplus, Admiralty Way',
    pickupAddress: 'Medplus Pharmacy, Admiralty Way, Lekki',
    dropoff: 'Block 3, Lekki Phase 1',
    dropoffAddress: 'Block 3, Lekki Phase 1, Lagos',
    distance: '2.1 km away',
    eta: '15 mins est.',
  },
};

export default function ErrandDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!fontsLoaded) return null;

  const errand = id ? ERRANDS_DATA[id] : null;

  if (!errand) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-figtree">Errand not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-figtree-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progressPct = (timeLeft / EXPIRY_SECONDS) * 100;

  return (
    <View className="flex-1 bg-white">
      {/* MAP */}
      <View
        className="w-full rounded-b-3xl overflow-hidden relative"
        style={{ height: MAP_HEIGHT }}
      >
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute w-10 h-10 rounded-full bg-white items-center justify-center"
          style={{ top: insets.top + 8, left: 20 }}
        >
          <Feather name="x" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View className="absolute top-[38%] left-[42%]">
          <View className="w-8 h-8 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={14} color="#FFFFFF" />
          </View>
        </View>

        <View className="absolute top-[52%] left-[58%]">
          <View className="w-8 h-8 rounded-full bg-secondary border-2 border-white items-center justify-center">
            <Feather name="flag" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-5">
          {/* Title row */}
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1 pr-4">
              <View className="bg-primary-light self-start px-2 py-0.5 rounded mb-2">
                <Text className="text-[9px] font-figtree-bold text-primary tracking-wider">
                  {errand.type}
                </Text>
              </View>
              <Text className="text-[20px] font-gabarito text-text-dark">
                {errand.title}
              </Text>
              <Text className="text-[12px] font-figtree text-text-gray mt-0.5">
                {errand.subtitle}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[20px] font-gabarito text-secondary">
                {errand.earnings}
              </Text>
              <Text className="text-[11px] font-figtree text-text-light mt-0.5">
                Est. Earnings
              </Text>
            </View>
          </View>

          {/* Pickup */}
          <Text className="text-[10px] font-figtree-bold text-text-light uppercase tracking-wider mb-2">
            Pickup / Store
          </Text>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-[14px] font-figtree-bold text-text-dark">
              {errand.pickup}
            </Text>
          </View>
          <Text className="text-[12px] font-figtree text-text-gray pl-4 mb-4">
            {errand.pickupAddress}
          </Text>

          {/* Delivery */}
          <Text className="text-[10px] font-figtree-bold text-text-light uppercase tracking-wider mb-2">
            Delivery Location
          </Text>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-2 h-2 rounded-full bg-secondary" />
            <Text className="text-[14px] font-figtree-bold text-text-dark">
              {errand.dropoff}
            </Text>
          </View>
          <Text className="text-[12px] font-figtree text-text-gray pl-4 mb-5">
            {errand.dropoffAddress}
          </Text>

          {/* Info pills */}
          <View className="flex-row gap-2 mb-5">
            <View className="border border-border rounded-lg px-3 py-1.5">
              <Text className="text-[12px] font-figtree text-text-dark">
                {errand.distance}
              </Text>
            </View>
            <View className="border border-border rounded-lg px-3 py-1.5">
              <Text className="text-[12px] font-figtree text-text-dark">
                {errand.eta}
              </Text>
            </View>
          </View>

          {/* Countdown */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[12px] font-figtree text-text-dark">
                Request expires in
              </Text>
              <Text className="text-[12px] font-figtree-bold text-secondary">
                {timeLeft}s
              </Text>
            </View>
            <View className="h-1.5 bg-background-dark rounded-full overflow-hidden">
              <View
                className="h-full bg-secondary rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-border rounded-2xl py-4 items-center"
              onPress={() => router.back()}
            >
              <Text className="text-[15px] font-figtree-bold text-text-dark">
                Decline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-2xl py-4 items-center"
              onPress={() =>
                router.push({
                  pathname: '/(runner)/modals/active-errand',   // 👈 changed
                  params: { id: errand.id },
                })
              }
            >
              <Text className="text-[15px] font-figtree-bold text-white">
                Accept Errand
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}