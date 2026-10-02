import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.52;
const MAP_IMAGE = require('@/assets/map.png');

// Progress steps — matches Figma
const STEPS = [
  'Runner Assigned',
  'Heading to Store',
  'Arrived at Store',
  'Shopping in Progress',
  'Runner on his way back',
  'Runner is here',
];

export default function LiveTracking() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
  }>();

  // Current progress: step 2 (Heading to Store) active
  const [currentStep] = useState(1);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1 bg-white">
      {/* ═══ TOP HEADER — floats over map ═══ */}
      <View
        className="absolute z-10 left-0 right-0 px-5"
        style={{ top: insets.top + 8 }}
      >
        <Text className="text-[10px] font-figtree-bold text-primary tracking-widest mb-2 pl-1">
          LEKKI, LAGOS, NIGERIA
        </Text>

        <View className="bg-white rounded-full px-3 py-2.5 flex-row items-center gap-3 shadow-md">
          <View className="w-2 h-2 rounded-full bg-green-500" />

          <Text className="flex-1 text-[13px] font-figtree-bold text-text-dark">
            David is heading to the store
          </Text>

          <View className="bg-secondary-light rounded-full px-2.5 py-1">
            <Text className="text-[10px] font-figtree-bold text-secondary">
              18 Mins Left
            </Text>
          </View>
        </View>
      </View>

      {/* ═══ MAP ═══ */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        <View
          className="absolute rounded-full"
          style={{
            top: '40%',
            left: '30%',
            width: '45%',
            height: 3,
            backgroundColor: '#006B75',
            transform: [{ rotate: '20deg' }],
          }}
        />

        <View className="absolute top-[52%] left-[38%]">
          <View className="w-9 h-9 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="navigation" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View className="absolute top-[32%] left-[62%]">
          <View className="w-9 h-9 rounded-full bg-secondary border-2 border-white items-center justify-center">
            <Feather name="map-pin" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View className="flex-1 bg-white -mt-6 rounded-t-3xl pt-3">
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5">
            {STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <View key={step} className="flex-row items-center gap-3 mb-3">
                  <View
                    className={`w-5 h-5 rounded-full items-center justify-center ${
                      isDone
                        ? 'bg-primary'
                        : isCurrent
                        ? 'bg-white border-2 border-primary'
                        : 'bg-white border-2 border-border-light'
                    }`}
                  >
                    {isDone ? (
                      <Feather name="check" size={11} color="#FFFFFF" />
                    ) : isCurrent ? (
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                  </View>

                  <Text
                    className={`text-[13px] ${
                      isDone || isCurrent
                        ? 'font-figtree-bold text-text-dark'
                        : 'font-figtree text-text-light'
                    }`}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* ═══ RUNNER CARD ═══ */}
        <View className="px-6 pt-3 pb-6 border-t border-border">
          <View className="flex-row items-center gap-3">
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ borderWidth: 2, borderColor: '#006B75' }}
            >
              <View className="w-full h-full rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                <Feather name="user" size={20} color="#94A3B8" />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[14px] font-gabarito text-text-dark">
                David
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray">
                ⭐ 4.9 · Delivery Agent
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {/* Chat */}
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="message-circle" size={18} color="#006B75" />
              </TouchableOpacity>

              {/* Call */}
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#006B75" />
              </TouchableOpacity>

              {/* SOS */}
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-status-errorLight items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="shield" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ═══ DEV-ONLY: Advance to next stage ═══ */}
      {/* TODO: Remove this once real WebSocket updates are wired */}
      <TouchableOpacity
        onPress={() =>
          router.replace({
            pathname: '/(customer)/errand/shopping-progress',
            params,
          })
        }
        className="absolute right-5 rounded-full bg-secondary px-4 py-3 flex-row items-center gap-2"
        style={{ bottom: 90 }}
        activeOpacity={0.85}
      >
        <Feather name="skip-forward" size={14} color="#FFFFFF" />
        <Text className="text-[11px] font-gabarito text-white tracking-wider">
          DEV: Next Stage
        </Text>
      </TouchableOpacity>
    </View>
  );
}