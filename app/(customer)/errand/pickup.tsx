import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Pickup Location — step 2 of 8
//
// Figma: pickup-location
//   Search input (highlighted border) · map preview ·
//   Recent locations · Suggested stores.
//
// IMPORTANT: all wizard params accumulate forward.
//   2/8 sets: pickup
//   Forwards: type, promo, pickup, store (if set from Home)
//
// The `store` param comes from Home's "Favorite Stores" tap. If
// present, it prefills the search field so the user doesn't have
// to type the store name again.
// ─────────────────────────────────────────────────────────────

const MAP_IMAGE = require('@/assets/map.png');

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

// Default pickup when nothing else is provided
const DEFAULT_PICKUP = 'Shoprite, The Palms Mall';

export default function PickupLocation() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    store?: string;   // from Home's favorite-store tap
    pickup?: string;  // restored when going back from delivery
  }>();

  // Prefill order: previously selected pickup > store param > default
  const initialValue =
    params.pickup || params.store || DEFAULT_PICKUP;

  const [query, setQuery] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState(initialValue);

  const handleConfirm = () => {
    router.push({
      pathname: '/(customer)/errand/delivery',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        store: params.store ?? '',
        pickup: selectedLocation,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">
          Pickup Location
        </Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          2<Text className="text-text-light font-figtree">/8</Text>
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title */}
          <Text className="text-heading-sm font-gabarito text-ink mb-5">
            Where should we shop or pick up from?
          </Text>

          {/* Search input — highlighted border */}
          <View className="flex-row items-center border border-primary rounded-field px-4 bg-surface mb-5 h-14">
            <Feather name="search" size={16} color={colors.primary} />
            <TextInput
              className="flex-1 pl-3 text-body-sm font-figtree text-ink"
              placeholder="Search for a store or address"
              placeholderTextColor={colors.subtle}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelectedLocation(text);
              }}
            />
          </View>

          {/* Map preview */}
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
            <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Feather name="map-pin" size={14} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Recent locations */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
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
                    color={colors.muted}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-body-xs font-figtree-bold text-ink">
                    {loc.name}
                  </Text>
                  <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                    {loc.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Suggested stores */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
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
                className="border border-border rounded-full px-4 py-2 bg-surface"
                activeOpacity={0.7}
              >
                <Text className="text-caption font-figtree text-ink">
                  {store}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleConfirm}>
          Confirm pickup location
        </Button>
      </View>
    </SafeAreaView>
  );
}