import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type SavedAddress = {
  id: string;
  label: string;
  address: string;
  icon: keyof typeof Feather.glyphMap;
};

const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'home',
    label: 'Home',
    address: 'Block 12, Flat 4, Admiralty Homes, Lekki',
    icon: 'home',
  },
  {
    id: 'work',
    label: 'Work',
    address: '94, Chevron Drive, Lekki',
    icon: 'briefcase',
  },
];

export default function DeliveryLocation() {
  const { type, promo, pickup } = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
  }>();

  const [selectedId, setSelectedId] = useState<string>('current');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleConfirm = () => {
    // Resolve the actual address based on selection
    let dropoff = '';
    if (selectedId === 'current') dropoff = 'Lekki Phase 1, Lagos';
    else {
      const found = SAVED_ADDRESSES.find((a) => a.id === selectedId);
      dropoff = found?.address ?? '';
    }

    router.push({
      pathname: '/(errand)/create-errand/items',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: pickup ?? '',
        dropoff,
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
          Delivery Location
        </Text>

        <Text className="text-[13px] font-figtree-bold text-primary">
          3<Text className="text-text-light font-figtree font-normal">/8</Text>
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title */}
          <Text className="text-[20px] font-gabarito text-text-dark mb-5">
            Where should we deliver to?
          </Text>

          {/* Deliver to Current Location card */}
          <TouchableOpacity
            onPress={() => setSelectedId('current')}
            activeOpacity={0.8}
            className={`border rounded-2xl p-4 flex-row items-center gap-3 mb-6 ${
              selectedId === 'current'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-white'
            }`}
          >
            {/* Navigation icon */}
            <View
              className={`w-9 h-9 rounded-full items-center justify-center ${
                selectedId === 'current' ? 'bg-primary' : 'bg-background-dark'
              }`}
            >
              <Feather
                name="navigation"
                size={16}
                color={selectedId === 'current' ? '#FFFFFF' : '#475569'}
              />
            </View>

            <View className="flex-1">
              <Text className="text-[14px] font-gabarito text-text-dark">
                Deliver to Current Location
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                Lekki Phase 1, Lagos
              </Text>
            </View>

            {/* Check mark when selected */}
            {selectedId === 'current' && (
              <Feather name="check" size={20} color="#006B75" />
            )}
          </TouchableOpacity>

          {/* Saved Addresses */}
          <Text className="text-[14px] font-gabarito text-text-dark mb-3">
            Saved Addresses
          </Text>

          <View className="gap-3 mb-5">
            {SAVED_ADDRESSES.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => setSelectedId(addr.id)}
                  activeOpacity={0.8}
                  className={`border rounded-2xl p-4 flex-row items-center gap-3 ${
                    isSelected
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-white'
                  }`}
                >
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-background-dark'
                    }`}
                  >
                    <Feather
                      name={addr.icon}
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#475569'}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[14px] font-gabarito text-text-dark">
                      {addr.label}
                    </Text>
                    <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                      {addr.address}
                    </Text>
                  </View>

                  {isSelected && (
                    <Feather name="check" size={20} color="#006B75" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add New Address */}
          <TouchableOpacity
            className="flex-row items-center gap-2 mb-8 py-2"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={16} color="#006B75" />
            <Text className="text-[13px] font-figtree-bold text-primary">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            CONFIRM DELIVERY LOCATION
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}