import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Select Errand Type — step 1 of 8
//
// Figma: select-errand-type
//   List of errand services with icon tile, name, description,
//   and chevron. Promo chip when a promo code is active.
//
// IMPORTANT: all wizard params accumulate forward.
//   1/8 sets: type, promo (from Home), store (from favorite-store tap)
//   Forwards: type, promo, store
//
// The `type` param may arrive from Home (service tile tap) — if
// present, the matching row is highlighted so the user knows
// which one they came for. The `store` param arrives from
// favorite-store taps and travels through the wizard so pickup
// can prefill the search field.
// ─────────────────────────────────────────────────────────────

type ErrandType = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tone: 'teal' | 'orange';
};

const ERRAND_TYPES: ErrandType[] = [
  { id: 'shop-for-me',     name: 'Shop for Me',        description: 'We buy what you need & deliver',          icon: 'shopping-bag', tone: 'teal' },
  { id: 'pick-up-deliver', name: 'Pick Up & Deliver',  description: 'Swift delivery from A to B',              icon: 'package',      tone: 'orange' },
  { id: 'run-errand',      name: 'Run an Errand',      description: 'Custom tasks, bank runs & filings',       icon: 'clipboard',    tone: 'teal' },
  { id: 'pharmacy',        name: 'Pharmacy',           description: 'Prescriptions picked up safely',          icon: 'activity',     tone: 'orange' },
  { id: 'food-groceries',  name: 'Food & Groceries',   description: 'Hot meals or market provisions',          icon: 'coffee',       tone: 'teal' },
  { id: 'multiple-stops',  name: 'Multiple Stops',     description: 'Drop off or pick up from many places',    icon: 'map-pin',      tone: 'orange' },
  { id: 'return-exchange', name: 'Return / Exchange',  description: 'Send items back to vendor',               icon: 'rotate-ccw',   tone: 'teal' },
];

// ─── Tone → color mapping ───
const TONE_STYLES: Record<
  ErrandType['tone'],
  { bg: string; fg: string }
> = {
  teal:   { bg: colors.primaryLight, fg: colors.primary },
  orange: { bg: colors.accentLight,  fg: colors.accent },
};

export default function SelectErrandType() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    store?: string;
  }>();

  const handleSelect = (typeId: string) => {
    router.push({
      pathname: '/(customer)/errand/pickup',
      params: {
        type: typeId,
        promo: params.promo ?? '',
        store: params.store ?? '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="flex-1 text-body font-gabarito text-ink text-center">
          Select Errand Type
        </Text>

        <View className="w-9" />
      </View>

      {/* Promo chip — only when a promo is active */}
      {params.promo ? (
        <View className="mx-6 mb-3 bg-primary-light rounded-xl px-3 py-2 flex-row items-center gap-2">
          <Feather name="gift" size={14} color={colors.primary} />
          <Text className="text-caption font-figtree-bold text-primary">
            Promo {params.promo} applied — ₦1,000 off at checkout
          </Text>
        </View>
      ) : null}

      {/* Store chip — when arrived from a favorite-store tap */}
      {params.store ? (
        <View className="mx-6 mb-3 bg-accent-light rounded-xl px-3 py-2 flex-row items-center gap-2">
          <Feather name="shopping-bag" size={14} color={colors.accent} />
          <Text className="text-caption font-figtree-bold text-accent">
            Shopping at {params.store}
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
            const tone = TONE_STYLES[type.tone];
            const isHighlighted = params.type === type.id;

            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleSelect(type.id)}
                activeOpacity={0.75}
                className={`
                  rounded-2xl p-4 flex-row items-center gap-3 bg-surface
                  ${isHighlighted
                    ? 'border-2 border-primary'
                    : 'border border-border'
                  }
                `}
              >
                {/* Icon tile */}
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: tone.bg }}
                >
                  <Feather name={type.icon} size={20} color={tone.fg} />
                </View>

                {/* Name + description */}
                <View className="flex-1">
                  <Text className="text-body-sm font-gabarito-bold text-ink">
                    {type.name}
                  </Text>
                  <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                    {type.description}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.subtle}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}