import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const MAP_IMAGE = require('../../../assets/map.png');

const RECENT_LOCATIONS = [
  {
    id: '1',
    name: 'The Palms Mall, Lekki',
    address: 'Lagos, Nigeria',
    type: 'recent' as const,
  },
  {
    id: '2',
    name: 'Ebeano Supermarket',
    address: 'Admiralty Way, Lekki',
    type: 'history' as const,
  },
];

const SUGGESTED_STORES = ['Spar Lekki', 'Game Supermarket'];

export default function PickupLocation() {
  const { type, promo } = useLocalSearchParams<{ type?: string; promo?: string }>();
  const [query, setQuery] = useState('Shoprite, The Palms Mall');
  const [selectedLocation, setSelectedLocation] = useState('Shoprite, The Palms Mall');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleConfirm = () => {
    router.push({
      pathname: '/(errand)/create-errand/delivery',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: selectedLocation,
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
          Pickup Location
        </Text>

        <Text className="text-[13px] font-figtree-bold text-primary">
          2<Text className="text-text-light font-figtree font-normal">/8</Text>
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
            Where should we shop or pick up from?
          </Text>

          {/* Search Input */}
          <View className="flex-row items-center border border-primary rounded-xl px-4 bg-white mb-5">
            <Feather name="search" size={16} color="#006B75" />
            <TextInput
              className="flex-1 py-3.5 pl-3 text-[14px] font-figtree text-text-dark"
              placeholder="Search for a store or address"
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelectedLocation(text);
              }}
            />
          </View>

          {/* Map Preview */}
          <TouchableOpacity
            className="w-full rounded-2xl overflow-hidden mb-6 bg-primary-light items-center justify-center"
            style={{ height: 160 }}
            activeOpacity={0.9}
          >
            <Image
              source={MAP_IMAGE}
              className="w-full h-full absolute"
              resizeMode="cover"
            />
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Feather name="map-pin" size={14} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Recent Locations */}
          <Text className="text-[14px] font-gabarito text-text-dark mb-3">
            Recent Locations
          </Text>

          <View className="gap-3 mb-6">
            {RECENT_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                onPress={() => {
                  setSelectedLocation(loc.name);
                  setQuery(loc.name);
                }}
                className="flex-row items-center gap-3"
                activeOpacity={0.7}
              >
                <View className="w-8 h-8 rounded-full bg-background-dark items-center justify-center">
                  <Feather
                    name={loc.type === 'recent' ? 'map-pin' : 'clock'}
                    size={14}
                    color="#475569"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-figtree-bold text-text-dark">
                    {loc.name}
                  </Text>
                  <Text className="text-[11px] font-figtree text-text-light mt-0.5">
                    {loc.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Suggested Stores */}
          <Text className="text-[14px] font-gabarito text-text-dark mb-3">
            Suggested Stores Nearby
          </Text>

          <View className="flex-row gap-2 flex-wrap mb-8">
            {SUGGESTED_STORES.map((store) => (
              <TouchableOpacity
                key={store}
                onPress={() => {
                  setSelectedLocation(store);
                  setQuery(store);
                }}
                className="border border-border rounded-full px-4 py-2 bg-white"
                activeOpacity={0.7}
              >
                <Text className="text-[12px] font-figtree text-text-dark">
                  {store}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            CONFIRM PICKUP LOCATION
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}