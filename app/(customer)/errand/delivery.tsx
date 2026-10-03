import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Delivery Location — step 3 of 8
//
// Figma: delivery-location
//   "Deliver to Current Location" card + saved addresses list +
//   "Add New Address" link.
//
// IMPORTANT: all wizard params accumulate forward.
//   3/8 sets: dropoff
//   Forwards: type, promo, pickup, dropoff
// ─────────────────────────────────────────────────────────────

type SavedAddress = {
  id: string;
  label: string;
  address: string;
  icon: React.ComponentProps<typeof Feather>['name'];
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
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [selectedId, setSelectedId] = useState<string>(
    params.dropoff ? 'current' : 'current'
  );

  const handleConfirm = () => {
    // Resolve the actual address based on selection
    let dropoff = '';
    if (selectedId === 'current') {
      dropoff = 'Lekki Phase 1, Lagos';
    } else {
      const found = SAVED_ADDRESSES.find((a) => a.id === selectedId);
      dropoff = found?.address ?? '';
    }

    router.push({
      pathname: '/(customer)/errand/items',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        pickup: params.pickup ?? '',
        dropoff,
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
          Delivery Location
        </Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          3<Text className="text-text-light font-figtree">/8</Text>
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
            Where should we deliver to?
          </Text>

          {/* Deliver to Current Location */}
          <TouchableOpacity
            onPress={() => setSelectedId('current')}
            activeOpacity={0.8}
            className={`
              border rounded-2xl p-4 flex-row items-center gap-3 mb-6
              ${selectedId === 'current'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-surface'
              }
            `}
          >
            <View
              className={`
                w-9 h-9 rounded-full items-center justify-center
                ${selectedId === 'current' ? 'bg-primary' : 'bg-background-dark'}
              `}
            >
              <Feather
                name="navigation"
                size={16}
                color={selectedId === 'current' ? colors.white : colors.muted}
              />
            </View>

            <View className="flex-1">
              <Text className="text-body-sm font-gabarito-bold text-ink">
                Deliver to Current Location
              </Text>
              <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                Lekki Phase 1, Lagos
              </Text>
            </View>

            {selectedId === 'current' ? (
              <Feather name="check" size={20} color={colors.primary} />
            ) : null}
          </TouchableOpacity>

          {/* Saved Addresses */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
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
                  className={`
                    border rounded-2xl p-4 flex-row items-center gap-3
                    ${isSelected
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-surface'
                    }
                  `}
                >
                  <View
                    className={`
                      w-9 h-9 rounded-full items-center justify-center
                      ${isSelected ? 'bg-primary' : 'bg-background-dark'}
                    `}
                  >
                    <Feather
                      name={addr.icon}
                      size={16}
                      color={isSelected ? colors.white : colors.muted}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-body-sm font-gabarito-bold text-ink">
                      {addr.label}
                    </Text>
                    <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                      {addr.address}
                    </Text>
                  </View>

                  {isSelected ? (
                    <Feather name="check" size={20} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add New Address */}
          <TouchableOpacity
            onPress={() => router.push('/(customer)/account/new-address')}
            className="flex-row items-center gap-2 mb-8 py-2"
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text className="text-body-xs font-figtree-bold text-primary">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleConfirm}>
          Confirm delivery location
        </Button>
      </View>
    </SafeAreaView>
  );
}