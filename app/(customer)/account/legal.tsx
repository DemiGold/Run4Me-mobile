import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Legal & Policies
//
// Figma: legal-screen
//   Section intro · policy row list · copyright footer.
//
// Tapping a policy currently does nothing. Wire to the actual
// document URL (or an in-app WebView) when available.
// ─────────────────────────────────────────────────────────────

type Policy = {
  id: string;
  label: string;
  version?: string;
};

const POLICIES: Policy[] = [
  { id: 'privacy',    label: 'Privacy Policy',                version: 'v2.4 (Jan 2026)' },
  { id: 'terms',      label: 'Terms of Use',                  version: 'v2.1' },
  { id: 'guidelines', label: 'Community Guidelines' },
  { id: 'refund',     label: 'Cancellation & Refund Policy' },
  { id: 'payment',    label: 'Payment Terms' },
];

export default function Legal() {
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
          Legal &amp; Policies
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Text className="text-body-sm font-gabarito-bold text-ink mb-2">
            Important Information
          </Text>
          <Text className="text-caption font-figtree text-muted mb-6">
            By using the Run4Me platform, you accept our standard guidelines,
            dispute terms, and payment terms.
          </Text>

          {/* Policy rows */}
          <View>
            {POLICIES.map((policy, index) => {
              const isLast = index === POLICIES.length - 1;
              return (
                <TouchableOpacity
                  key={policy.id}
                  activeOpacity={0.7}
                  className={`
                    flex-row items-center justify-between py-4
                    ${!isLast ? 'border-b border-border' : ''}
                  `}
                >
                  <View className="flex-1">
                    <Text className="text-body-xs font-figtree-bold text-ink">
                      {policy.label}
                    </Text>
                    {policy.version ? (
                      <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                        {policy.version}
                      </Text>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.subtle} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <Text className="text-micro font-figtree text-text-light text-center leading-4 mt-10">
            Copyright © 2026 Run4Me Technologies. All rights reserved.{'\n'}
            Last updated: January 1, 2026.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}