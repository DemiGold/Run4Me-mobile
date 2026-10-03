import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Saved Addresses
//
// Figma: saved-addresses
//   Cards for Home / Work / Mom's House · DEFAULT badge on the
//   active one · "Set as default" toggle on the others ·
//   "Add New Address" outlined CTA.
//
// MOCK: ADDRESSES array below. Replace with
// GET /locations · POST /locations · PATCH /locations/:id/default.
// ─────────────────────────────────────────────────────────────

type Address = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  address: string;
  isDefault: boolean;
};

const ADDRESSES: Address[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    address: 'Block 12, Flat 4, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    isDefault: true,
  },
  {
    id: 'work',
    label: 'Work',
    icon: 'briefcase',
    address: 'Heritage Place, 21 Maroko Road, Ikoyi, Lagos, Nigeria',
    isDefault: false,
  },
  {
    id: 'mom',
    label: "Mom's House",
    icon: 'map-pin',
    address: '45, Toyin Street, Ikeja, Lagos, Nigeria',
    isDefault: false,
  },
];

export default function SavedAddresses() {
  const [defaultId, setDefaultId] = useState('home');

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-heading-sm font-gabarito text-ink">
          Saved Addresses
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-3">
          {ADDRESSES.map((addr) => {
            const isDefault = defaultId === addr.id;

            return (
              <View
                key={addr.id}
                className={`
                  rounded-2xl p-4 bg-surface border
                  ${isDefault ? 'border-primary' : 'border-border'}
                `}
              >
                {/* Header row: icon + label + DEFAULT badge */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather
                    name={addr.icon}
                    size={14}
                    color={isDefault ? colors.primary : colors.muted}
                  />
                  <Text className="text-body-sm font-gabarito-bold text-ink">
                    {addr.label}
                  </Text>

                  {isDefault ? (
                    <View className="bg-primary-light px-2 py-0.5 rounded">
                      <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                        DEFAULT
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Address */}
                <Text
                  className={`
                    text-caption font-figtree leading-5
                    ${isDefault ? 'text-ink' : 'text-muted'}
                  `}
                >
                  {addr.address}
                </Text>

                {/* Set-as-default toggle (non-default cards only) */}
                {!isDefault ? (
                  <>
                    <View className="h-[1px] bg-border mb-3 mt-3" />
                    <View className="flex-row items-center justify-between">
                      <Text className="text-caption font-figtree text-muted">
                        Set as default address
                      </Text>
                      <Toggle
                        value={false}
                        onChange={() => setDefaultId(addr.id)}
                      />
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}

          {/* Add new address */}
          <TouchableOpacity
            className="border border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-2"
            activeOpacity={0.75}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text className="text-body-sm font-figtree-bold text-primary">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}