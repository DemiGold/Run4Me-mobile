import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Safety Center
//
// Figma: safety-screen
//   Primary banner · Emergency Assistance card · safety rows.
//
// All actions are stubs for now. Wire them when their target
// screens are built (share link, report flow, block list, etc.).
// ─────────────────────────────────────────────────────────────

type SafetyItem = {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const ITEMS: SafetyItem[] = [
  { id: 'share',      title: 'Share Live Errand',       desc: 'Send real-time map link to trusted friends.',              icon: 'share-2' },
  { id: 'contact',    title: 'Emergency Contact',       desc: 'Add trusted details for single-tap alerts.',               icon: 'phone' },
  { id: 'report',     title: 'Report a User',           desc: 'Submit safety or quality concerns instantly.',             icon: 'alert-triangle' },
  { id: 'block',      title: 'Block User',              desc: 'Restrict runners or users from viewing your activity.',    icon: 'slash' },
  { id: 'guidelines', title: 'Safety Guidelines',       desc: 'Read rules for safe transactions and handovers.',          icon: 'file-text' },
  { id: 'unsafe',     title: 'Report Unsafe Location',  desc: 'Alert our teams about hazardous areas.',                   icon: 'alert-octagon' },
];

export default function SafetyCenter() {
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
          Safety Center
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Primary banner */}
          <View className="bg-primary rounded-2xl p-4 mb-5">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Feather name="shield" size={14} color={colors.white} />
              <Text className="text-body-sm font-gabarito-bold text-white">
                Your safety is our priority
              </Text>
            </View>
            <Text className="text-caption font-figtree text-white/85">
              Verified runners, instant transit insurance, secure escrow
              accounts, and live-tracking maps keep you safe.
            </Text>
          </View>

          {/* Emergency Assistance */}
          <TouchableOpacity
            className="rounded-2xl p-4 mb-3 flex-row items-center gap-3 bg-status-errorLight"
            activeOpacity={0.75}
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-status-error">
              <Feather name="alert-circle" size={18} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="text-body-sm font-gabarito-bold text-status-error">
                Emergency Assistance
              </Text>
              <Text className="text-caption-sm font-figtree text-status-error">
                Instantly trigger crisis response services.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Safety items */}
          <View className="gap-3">
            {ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-surface"
              >
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center">
                  <Feather name={item.icon} size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-body-sm font-gabarito-bold text-ink">
                    {item.title}
                  </Text>
                  <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                    {item.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}