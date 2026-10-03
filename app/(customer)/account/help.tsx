import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Help Center
//
// Figma: help-center
//   Search bar · category grid (2-column).
//
// Search is a visual placeholder — no live filter yet.
// Category tiles are stubs.
// ─────────────────────────────────────────────────────────────

type Category = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const CATEGORIES: Category[] = [
  { id: 'errand',       label: 'About My Errand',      icon: 'briefcase' },
  { id: 'tracking',     label: 'Tracking',              icon: 'map-pin' },
  { id: 'payments',     label: 'Payments',              icon: 'credit-card' },
  { id: 'refunds',      label: 'Refunds',               icon: 'refresh-cw' },
  { id: 'wallet',       label: 'Wallet',                icon: 'dollar-sign' },
  { id: 'security',     label: 'Account Security',      icon: 'shield' },
  { id: 'verification', label: 'Runner Verification',   icon: 'user-check' },
  { id: 'earnings',     label: 'Runner Earnings',       icon: 'dollar-sign' },
  { id: 'withdrawals',  label: 'Withdrawals',           icon: 'trending-up' },
  { id: 'ratings',      label: 'Ratings & Reviews',     icon: 'star' },
];

export default function HelpCenter() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-heading-sm font-gabarito text-ink">
          Help Center
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Search — visual only */}
          <View className="flex-row items-center h-14 border border-border rounded-field px-4 bg-surface mb-6">
            <Feather name="search" size={16} color={colors.subtle} />
            <TextInput
              className="flex-1 pl-3 text-body-sm font-figtree text-ink"
              placeholder="Search for topics or questions..."
              placeholderTextColor={colors.subtle}
              editable={false}
            />
          </View>

          {/* Categories */}
          <Text className="text-body-sm font-gabarito-bold text-ink mb-4">
            Browse by Category
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="w-[48%] border border-border rounded-2xl p-4 mb-3 bg-surface"
                activeOpacity={0.75}
              >
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center mb-2">
                  <Feather name={cat.icon} size={18} color={colors.primary} />
                </View>
                <Text className="text-caption font-figtree-bold text-ink">
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}