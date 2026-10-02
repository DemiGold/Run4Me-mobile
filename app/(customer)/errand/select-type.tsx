import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type ErrandType = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: 'teal' | 'orange';
};

const ERRAND_TYPES: ErrandType[] = [
  { id: 'shop-for-me', name: 'Shop for Me', description: 'We buy what you need & deliver', icon: 'shopping-bag', color: 'teal' },
  { id: 'pick-up-deliver', name: 'Pick Up & Deliver', description: 'Swift delivery from A to B', icon: 'package', color: 'orange' },
  { id: 'run-errand', name: 'Run an Errand', description: 'Custom tasks, bank runs & filings', icon: 'clipboard', color: 'teal' },
  { id: 'pharmacy', name: 'Pharmacy', description: 'Prescriptions picked up safely', icon: 'activity', color: 'orange' },
  { id: 'food-groceries', name: 'Food & Groceries', description: 'Hot meals or market provisions', icon: 'coffee', color: 'teal' },
  { id: 'multiple-stops', name: 'Multiple Stops', description: 'Drop off or pick up from many places', icon: 'map-pin', color: 'orange' },
  { id: 'return-exchange', name: 'Return / Exchange', description: 'Send items back to vendor', icon: 'rotate-ccw', color: 'teal' },
];

export default function SelectErrandType() {
  const { promo } = useLocalSearchParams<{ promo?: string }>();

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleSelect = (typeId: string) => {
    router.push({
      pathname: '/(customer)/errand/pickup',
      params: { type: typeId, promo: promo ?? '' },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="flex-1 text-[15px] font-gabarito text-text-dark text-center">
          Select Errand Type
        </Text>

        <View className="w-9" />
      </View>

      {/* Promo chip */}
      {promo ? (
        <View className="mx-6 mb-3 bg-primary-light rounded-xl px-3 py-2 flex-row items-center gap-2">
          <Feather name="gift" size={14} color="#006B75" />
          <Text className="text-[11px] font-figtree-bold text-primary">
            Promo {promo} applied — ₦1,000 off at checkout
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-3">
          {ERRAND_TYPES.map((type) => {
            const isTeal = type.color === 'teal';
            const bgColor = isTeal ? '#E6F3F5' : '#FFF5E6';
            const iconColor = isTeal ? '#006B75' : '#FF9F1C';

            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleSelect(type.id)}
                className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-white"
                activeOpacity={0.75}
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  <Feather name={type.icon} size={20} color={iconColor} />
                </View>

                <View className="flex-1">
                  <Text className="text-[14px] font-gabarito text-text-dark">
                    {type.name}
                  </Text>
                  <Text className="text-[11px] font-figtree text-text-light mt-0.5">
                    {type.description}
                  </Text>
                </View>

                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}