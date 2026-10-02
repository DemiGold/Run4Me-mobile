import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const POLICIES = [
  { id: 'privacy', label: 'Privacy Policy', version: 'v2.4 (Jan 2026)' },
  { id: 'terms', label: 'Terms of Use', version: 'v2.1' },
  { id: 'guidelines', label: 'Community Guidelines' },
  { id: 'refund', label: 'Cancellation & Refund Policy' },
  { id: 'payment', label: 'Payment Terms' },
];

export default function Legal() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">
          Legal & Policies
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Text className="text-[15px] font-gabarito text-text-dark mb-2">
            Important Information
          </Text>
          <Text className="text-[12px] font-figtree text-text-gray leading-[18px] mb-6">
            By using the Run4Me platform, you accept our standard guidelines,
            dispute terms, and payment terms.
          </Text>

          <View>
            {POLICIES.map((policy, index) => {
              const isLast = index === POLICIES.length - 1;
              return (
                <TouchableOpacity
                  key={policy.id}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between py-4 ${
                    !isLast ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-[13px] font-figtree-bold text-text-dark">
                      {policy.label}
                    </Text>
                    {policy.version && (
                      <Text className="text-[11px] font-figtree text-text-light mt-0.5">
                        {policy.version}
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-[10px] font-figtree text-text-light text-center leading-4 mt-10">
            Copyright © 2026 Run4Me Technologies. All rights reserved.{'\n'}
            Last updated: January 1, 2026.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}