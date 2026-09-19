import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

// Stat pills row
const STATS = [
  { label: 'TODAY', value: '₦12,500' },
  { label: 'THIS WEEK', value: '₦67,800' },
  { label: 'PENDING', value: '₦5,400' },
  { label: 'TIPS', value: '₦3,200' },
];

// Payout history
type Payout = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  isCredit: boolean;
};

const PAYOUT_HISTORY: Payout[] = [
  {
    id: '1',
    title: 'Payout Successful',
    subtitle: 'Today, 2:14 PM',
    amount: '-₦15,000',
    isCredit: false,
  },
  {
    id: '2',
    title: 'Errand Completed (Spar)',
    subtitle: 'Today, 11:30 AM',
    amount: '+₦2,500',
    isCredit: true,
  },
  {
    id: '3',
    title: 'Errand Completed (Shoprite)',
    subtitle: 'Yesterday',
    amount: '+₦3,400',
    isCredit: true,
  },
  {
    id: '4',
    title: 'Bonus Payout (Gold Rank)',
    subtitle: 'Yesterday',
    amount: '+₦5,000',
    isCredit: true,
  },
];

export default function RunnerEarnings() {
  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[16px] font-gabarito text-text-dark">My Earnings</Text>
        <TouchableOpacity className="p-1 w-8 items-end">
          <Feather name="help-circle" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Available Balance Card */}
          <View className="bg-primary rounded-2xl p-5 mb-5">
            <Text className="text-[11px] font-figtree-bold text-white/80 uppercase tracking-wider mb-2">
              Available Balance
            </Text>
            <Text className="text-[32px] font-gabarito text-white mb-4">
              ₦45,200
            </Text>
            <TouchableOpacity className="bg-white rounded-xl py-3.5 items-center">
              <Text className="text-[14px] font-figtree-bold text-primary">
                Withdraw Funds
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-2 mb-5">
            {STATS.map((stat) => (
              <View
                key={stat.label}
                className="flex-1 border border-border rounded-xl p-3 items-center"
              >
                <Text className="text-[9px] font-figtree-bold text-text-light uppercase tracking-wider mb-1">
                  {stat.label}
                </Text>
                <Text className="text-[13px] font-gabarito text-text-dark">
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Payout Bank Account */}
          <Text className="text-[13px] font-gabarito text-text-dark mb-3">
            Payout Bank Account
          </Text>

          <View className="border border-border rounded-2xl p-4 bg-white mb-5 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
              <Feather name="credit-card" size={18} color="#006B75" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-gabarito text-text-dark">
                Access Bank plc
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray">
                David Adeyemi • **** 5678
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-[12px] font-figtree-bold text-primary">Change</Text>
            </TouchableOpacity>
          </View>

          {/* Payout History */}
          <Text className="text-[13px] font-gabarito text-text-dark mb-3">
            Payout History
          </Text>

          <View className="border border-border rounded-2xl bg-white overflow-hidden">
            {PAYOUT_HISTORY.map((payout, index) => (
              <View
                key={payout.id}
                className={`flex-row items-center justify-between px-4 py-3.5 ${
                  index < PAYOUT_HISTORY.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-[13px] font-figtree-bold text-text-dark">
                    {payout.title}
                  </Text>
                  <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                    {payout.subtitle}
                  </Text>
                </View>
                <Text
                  className={`text-[13px] font-gabarito ${
                    payout.isCredit ? 'text-status-success' : 'text-text-dark'
                  }`}
                >
                  {payout.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}