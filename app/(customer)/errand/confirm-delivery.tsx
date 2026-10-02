import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const DELIVERY_CODE = ['5', '8', '1', '9'];

export default function ConfirmDelivery() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleContinue = () => {
    router.replace({
      pathname: '/(errand)/rate-runner',
      params,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[15px] font-gabarito text-text-dark">
          Confirm Delivery
        </Text>

        <View className="w-9" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 items-center justify-center pb-20">
        {/* Yellow lock icon */}
        <View className="w-20 h-20 rounded-full bg-orange-50 items-center justify-center mb-6">
          <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center">
            <Feather name="lock" size={26} color="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-[22px] font-gabarito text-text-dark text-center mb-2">
          Share Delivery Code
        </Text>

        {/* Subtitle */}
        <Text className="text-[13px] font-figtree text-text-gray text-center leading-5 mb-8 px-4">
          Share this code with your Errand Runner to confirm delivery.
        </Text>

        {/* 4-digit code boxes */}
        <View className="flex-row justify-center gap-3 mb-8">
          {DELIVERY_CODE.map((digit, index) => (
            <View
              key={index}
              className="w-[64px] h-[72px] border-2 border-primary rounded-2xl items-center justify-center bg-white"
            >
              <Text className="text-[32px] font-gabarito text-primary">
                {digit}
              </Text>
            </View>
          ))}
        </View>

        {/* Success banner */}
        <View className="w-full rounded-2xl px-4 py-4 flex-row items-start gap-3 bg-status-successLight">
          <View className="w-6 h-6 rounded-full bg-status-success items-center justify-center mt-0.5">
            <Feather name="check" size={14} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-figtree-bold text-status-successDark mb-0.5">
              Delivery Confirmed!
            </Text>
            <Text className="text-[12px] font-figtree text-status-successDark leading-[18px]">
              Errand successfully completed with David.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}