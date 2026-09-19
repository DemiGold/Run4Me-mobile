import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.62;
const MAP_IMAGE = require('../../../assets/map.png');

export default function FindingRunner() {
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
  }>();

  const [progress, setProgress] = useState(35);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  // Simulate progress growth + auto-match after a few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + 5));
    }, 800);

    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/(errand)/create-errand/available-runners',
        params,
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!fontsLoaded) return null;

  const handleCancel = () => {
    router.replace('/(customer)');
  };

  return (
    <View className="flex-1 bg-white">
      {/* ═══ MAP — full width, ~62% height ═══ */}
      <View
        className="w-full rounded-b-3xl overflow-hidden relative"
        style={{ height: MAP_HEIGHT }}
      >
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        {/* Route line (decorative — pink/magenta) */}
        <View
          className="absolute rounded-full"
          style={{
            top: '30%',
            left: '20%',
            width: '55%',
            height: 3,
            backgroundColor: '#E91E63',
            transform: [{ rotate: '25deg' }],
          }}
        />

        {/* Pin A — Pickup (teal, label) */}
        <View className="absolute top-[22%] left-[12%] items-center">
          <View className="w-8 h-8 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Text className="text-white text-[12px] font-gabarito">A</Text>
          </View>
        </View>

        {/* Pin B — Dropoff (orange, label) */}
        <View className="absolute top-[42%] left-[58%] items-center">
          <View className="w-8 h-8 rounded-full bg-secondary border-2 border-white items-center justify-center">
            <Text className="text-white text-[12px] font-gabarito">B</Text>
          </View>
        </View>

        {/* Secondary B pin (destination marker) */}
        <View className="absolute top-[52%] left-[48%] items-center">
          <View className="w-7 h-7 rounded-md bg-secondary items-center justify-center">
            <Text className="text-white text-[11px] font-gabarito">B</Text>
          </View>
        </View>

        {/* Current location dot (teal, no label) */}
        <View className="absolute top-[20%] left-[42%] items-center">
          <View className="w-4 h-4 rounded-full bg-primary border-2 border-white" />
        </View>

        {/* Green destination marker (C) */}
        <View className="absolute top-[62%] left-[42%] items-center">
          <View className="w-7 h-7 rounded-md bg-green-500 items-center justify-center">
            <Text className="text-white text-[11px] font-gabarito">C</Text>
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM CARD ═══ */}
      <View
        className="bg-white -mt-6 rounded-t-3xl px-6 pt-6 pb-8"
        style={{ minHeight: height * 0.35 }}
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        {/* Title */}
        <Text className="text-[18px] font-gabarito text-text-dark mb-1">
          Finding an Errand Runner...
        </Text>

        {/* Subtitle */}
        <Text className="text-[12px] font-figtree text-text-gray mb-5">
          5 verified runners are available nearby.
        </Text>

        {/* Progress bar */}
        <View className="h-1.5 bg-background-dark rounded-full overflow-hidden mb-8">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          onPress={handleCancel}
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: '#FEE2E2' }}
          activeOpacity={0.85}
        >
          <Text
            className="text-[14px] font-gabarito tracking-wider"
            style={{ color: '#EF4444' }}
          >
            CANCEL REQUEST
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}