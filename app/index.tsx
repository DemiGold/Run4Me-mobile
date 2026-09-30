import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function SplashScreen() {
  const user = useAuthStore((state) => state.user);

  // Animation values for staggered dots
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseTimeline = (animValue: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);
    };

    const staggeredPulseAnimation = Animated.parallel([
      createPulseTimeline(dot1Anim),
      Animated.sequence([Animated.delay(200), createPulseTimeline(dot2Anim)]),
      Animated.sequence([Animated.delay(400), createPulseTimeline(dot3Anim)]),
    ]);

    const loop = Animated.loop(staggeredPulseAnimation);
    loop.start();

    const timer = setTimeout(() => {
      if (user) {
        const route = user.role === 'customer' ? '/(customer)' : '/(runner)';
        router.replace(route);
      } else {
        router.replace('/welcome');
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim, user]);

  const dotsConfig = [
    { id: 0, anim: dot1Anim },
    { id: 1, anim: dot2Anim },
    { id: 2, anim: dot3Anim },
  ];

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      {/* Splash has a dark teal bg → status bar icons must be light */}
      <StatusBar style="light" />

      {/* --- CONTENT CONTAINER --- */}
      <View className="items-center gap-2">
        {/* Brand Header: Icon Box + Title */}
        <View className="flex-row items-center gap-4">
          <View className="w-11 h-11 bg-white rounded-xl items-center justify-center">
            <Feather name="x" size={26} color={colors.primary} />
          </View>

          <Text className="text-white text-[37px] font-gabarito">
            Run<Text className="text-secondary">4</Text>Me
          </Text>
        </View>

        {/* Tagline */}
        <Text className="text-primary-tint text-body text-center font-figtree tracking-[0.5px]">
          Your errands. Handled.
        </Text>
      </View>

      {/* --- STAGGERED PULSING DOTS --- */}
      <View className="flex-row absolute bottom-10 gap-1.5">
        {dotsConfig.map((dot) => (
          <Animated.View
            key={dot.id}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.white,
              opacity: dot.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
}