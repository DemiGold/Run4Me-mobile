import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function ErrandBudget() {
  const { type, promo, pickup, dropoff } = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [budget, setBudget] = useState('15000');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  // Format the amount with commas + decimals
  const formatAmount = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (!numeric) return '0.00';
    const withCommas = Number(numeric).toLocaleString('en-US');
    return `${withCommas}.00`;
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/instructions',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: pickup ?? '',
        dropoff: dropoff ?? '',
        budget: budget || '0',
      },
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
          Errand Budget
        </Text>

        <Text className="text-[13px] font-figtree-bold text-primary">
          5<Text className="text-text-light font-figtree font-normal">/8</Text>
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Title */}
        <Text className="text-[22px] font-gabarito text-text-dark mb-2 mt-2">
          Set your maximum shopping budget
        </Text>

        <Text className="text-[13px] font-figtree text-text-gray leading-5 mb-10">
          How much money should we approve for buying these items?
        </Text>

        {/* Large Amount Input */}
        <View className="items-center mb-10">
          <View className="flex-row items-center justify-center">
            {/* Naira symbol — bold, teal-ish dark */}
            <Text
              className="text-[36px] font-gabarito mr-2"
              style={{ color: '#0F172A' }}
            >
              ₦
            </Text>

            <TextInput
              value={formatAmount(budget)}
              onChangeText={(text) => setBudget(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              className="text-[36px] font-gabarito text-text-dark"
              style={{ minWidth: 180 }}
              editable
            />
          </View>

          {/* Underline below the amount */}
          <View className="w-[220px] h-[1px] bg-border mt-2" />
        </View>

        {/* Info box */}
        <View className="bg-primary-light rounded-2xl p-4 flex-row items-start gap-3">
          <Feather name="info" size={16} color="#006B75" className="mt-0.5" />
          <Text className="flex-1 text-[12px] font-figtree text-text-muted leading-[18px]">
            The runner cannot spend more than your approved budget without your
            permission.
          </Text>
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
            CONFIRM BUDGET & CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}