import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const CATEGORIES = [
  { id: 'errand', label: 'About My Errand', icon: 'briefcase' },
  { id: 'tracking', label: 'Tracking', icon: 'map-pin' },
  { id: 'payments', label: 'Payments', icon: 'credit-card' },
  { id: 'refunds', label: 'Refunds', icon: 'refresh-cw' },
  { id: 'wallet', label: 'Wallet', icon: 'dollar-sign' },
  { id: 'security', label: 'Account Security', icon: 'shield' },
  { id: 'verification', label: 'Runner Verification', icon: 'user-check' },
  { id: 'earnings', label: 'Runner Earnings', icon: 'dollar-sign' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'trending-up' },
  { id: 'ratings', label: 'Ratings & Reviews', icon: 'star' },
];

export default function HelpCenter() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full border border-border items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Help Center</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Search */}
          <View className="flex-row items-center border border-border rounded-xl px-4 bg-background-light mb-6">
            <Feather name="search" size={16} color="#94A3B8" />
            <TextInput className="flex-1 py-3.5 pl-3 text-[14px] font-figtree text-text-dark"
              placeholder="Search for topics or questions..." placeholderTextColor="#94A3B8" />
          </View>

          {/* Browse by Category */}
          <Text className="text-[15px] font-gabarito text-text-dark mb-4">Browse by Category</Text>

          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} className="w-[48%] border border-border rounded-2xl p-4 mb-3" activeOpacity={0.75}>
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center mb-2">
                  <Feather name={cat.icon as any} size={18} color="#006B75" />
                </View>
                <Text className="text-[12px] font-figtree-bold text-text-dark">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}