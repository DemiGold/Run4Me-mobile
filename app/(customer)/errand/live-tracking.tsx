import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Live Tracking
//
// Map + progress stepper + runner card. The runner card's actions
// (chat / call / SOS) are wired here.
//
// Figma: live-tracking
//   Map at 52% height, floating header pill, bottom sheet with
//   stepper + runner card.
//
// MOCK: currentStep is static. Real implementation will poll
// GET /errands/:id/tracking and update the step + ETA.
// ─────────────────────────────────────────────────────────────

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

// ─── MOCK runner — replace with real data from tracking endpoint ───
const MOCK_RUNNER = {
  name: 'David',
  rating: 4.9,
  role: 'Delivery Agent',
  phone: '+2348000000000',
};

export default function LiveTracking() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    items?: string;
  }>();

  // MOCK: step 2 (Heading to Store) active
  const [currentStep] = useState(1);

  // ─── Actions ───
  const handleChat = () => {
    router.push({
      pathname: '/(customer)/errand/chat',
      params: {
        errandId: params.id ?? '',
        runnerName: MOCK_RUNNER.name,
      },
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${MOCK_RUNNER.phone}`).catch(() => {
      Alert.alert('Cannot place call', 'Your device does not support calling.');
    });
  };

  const handleSos = () => {
    Alert.alert(
      'Emergency Support',
      'This will contact Run4Me support and share your live location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          style: 'destructive',
          onPress: () => {
            // ─── MOCK: wire to real support hotline when available ───
            Linking.openURL('tel:+2348000000000');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface">

      {/* ═══ TOP HEADER — floats over map ═══ */}
      <View
        className="absolute z-10 left-0 right-0 px-5"
        style={{ top: insets.top + 8 }}
      >
        <Text className="text-micro font-figtree-bold text-primary tracking-widest mb-2 pl-1">
          LEKKI, LAGOS, NIGERIA
        </Text>

        <View className="bg-surface rounded-full px-3 py-2.5 flex-row items-center gap-3 shadow-md">
          <View className="w-2 h-2 rounded-full bg-status-success" />

          <Text className="flex-1 text-body-xs font-figtree-bold text-ink">
            {MOCK_RUNNER.name} is heading to the store
          </Text>

          <View className="bg-accent-light rounded-full px-2.5 py-1">
            <Text className="text-micro font-figtree-bold text-accent">
              18 Mins Left
            </Text>
          </View>
        </View>
      </View>

      {/* ═══ MAP ═══ */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        {/* Path line */}
        <View
          className="absolute rounded-full bg-primary"
          style={{
            top: '40%',
            left: '30%',
            width: '45%',
            height: 3,
            transform: [{ rotate: '20deg' }],
          }}
        />

        {/* Runner marker */}
        <View className="absolute top-[52%] left-[38%]">
          <View className="w-9 h-9 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="navigation" size={16} color={colors.white} />
          </View>
        </View>

        {/* Destination marker */}
        <View className="absolute top-[32%] left-[62%]">
          <View className="w-9 h-9 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Feather name="map-pin" size={16} color={colors.white} />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      <View className="flex-1 bg-surface -mt-6 rounded-t-3xl pt-3">
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
                    className={`
                      w-5 h-5 rounded-full items-center justify-center
                      ${isDone
                        ? 'bg-primary'
                        : isCurrent
                        ? 'bg-surface border-2 border-primary'
                        : 'bg-surface border-2 border-border-light'
                      }
                    `}
                  >
                    {isDone ? (
                      <Feather name="check" size={11} color={colors.white} />
                    ) : isCurrent ? (
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                  </View>

                  <Text
                    className={`
                      text-body-xs
                      ${isDone || isCurrent
                        ? 'font-figtree-bold text-ink'
                        : 'font-figtree text-text-light'
                      }
                    `}
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
              style={{ borderWidth: 2, borderColor: colors.primary }}
            >
              <View className="w-full h-full rounded-full bg-background-dark items-center justify-center overflow-hidden">
                <Feather name="user" size={20} color={colors.subtle} />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-body-sm font-gabarito-bold text-ink">
                {MOCK_RUNNER.name}
              </Text>
              <Text className="text-caption-sm font-figtree text-muted">
                ⭐ {MOCK_RUNNER.rating} · {MOCK_RUNNER.role}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {/* Chat */}
              <TouchableOpacity
                onPress={handleChat}
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="message-circle" size={18} color={colors.primary} />
              </TouchableOpacity>

              {/* Call */}
              <TouchableOpacity
                onPress={handleCall}
                className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="phone" size={18} color={colors.primary} />
              </TouchableOpacity>

              {/* SOS */}
              <TouchableOpacity
                onPress={handleSos}
                className="w-10 h-10 rounded-full bg-status-errorLight items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="shield" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ═══ DEV-ONLY: Advance to next stage ═══ */}
      {/* TODO: Remove before shipping. Real app updates this via
          WebSocket events from the runner's device. */}
      <TouchableOpacity
        onPress={() =>
          router.replace({
            pathname: '/(customer)/errand/shopping-progress',
            params,
          })
        }
        className="absolute right-5 rounded-full bg-accent px-4 py-3 flex-row items-center gap-2"
        style={{ bottom: 90 }}
        activeOpacity={0.85}
      >
        <Feather name="skip-forward" size={14} color={colors.white} />
        <Text className="text-caption font-gabarito text-white tracking-wider">
          DEV: Next Stage
        </Text>
      </TouchableOpacity>
    </View>
  );
}