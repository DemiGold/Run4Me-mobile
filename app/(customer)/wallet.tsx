import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  isCredit: boolean;
  icon: keyof typeof Feather.glyphMap;
};

const TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Wallet Top-up', subtitle: '24 Nov, 9:02 AM', amount: '+₦10,000', isCredit: true, icon: 'plus-circle' },
  { id: '2', title: 'Errand Payment (Spar)', subtitle: '22 Nov, 12:44 PM', amount: '-₦17,500', isCredit: false, icon: 'shopping-bag' },
  { id: '3', title: 'Refund Completed', subtitle: '18 Nov, 4:15 PM', amount: '+₦1,800', isCredit: true, icon: 'rotate-ccw' },
  { id: '4', title: 'Promo Credit', subtitle: '15 Nov, 8:00 AM', amount: '+₦500', isCredit: true, icon: 'gift' },
  { id: '5', title: 'Tip for Runner Tunde', subtitle: '12 Nov, 6:30 PM', amount: '-₦1,000', isCredit: false, icon: 'heart' },
];

export default function CustomerWallet() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header row */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-5">
        <Text className="text-[26px] font-gabarito text-text-dark">
          My Wallet
        </Text>

        <TouchableOpacity
          className="bg-primary rounded-full px-4 py-2.5 flex-row items-center gap-1.5"
          activeOpacity={0.85}
        >
          <Feather name="plus" size={14} color="#FFFFFF" />
          <Text className="text-white text-[12px] font-figtree-bold">
            Add Money
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Balance card */}
          <View className="bg-white border border-border rounded-2xl p-6 mb-7">
            <Text className="text-[11px] font-figtree-bold text-text-light uppercase tracking-wider mb-3">
              Current Balance
            </Text>

            <View className="flex-row items-end gap-2 mb-5">
              <Text className="text-[36px] font-gabarito text-text-dark leading-none">
                ₦25,400
              </Text>
              <Text className="text-[13px] font-figtree text-text-light mb-1">
                NGN
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-[11px] font-figtree text-text-gray">
                256-bit Secure bank connection verified
              </Text>
            </View>
          </View>

          {/* Transaction Ledger */}
          <Text className="text-[16px] font-gabarito text-text-dark mb-4">
            Transaction Ledger
          </Text>

          <View className="gap-3">
            {TRANSACTIONS.map((tx) => (
              <View
                key={tx.id}
                className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-white"
              >
                {/* Icon circle */}
                <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
                  <Feather name={tx.icon} size={18} color="#006B75" />
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text className="text-[14px] font-figtree-bold text-text-dark mb-1">
                    {tx.title}
                  </Text>
                  <Text className="text-[11px] font-figtree text-text-gray">
                    {tx.subtitle}
                  </Text>
                </View>

                {/* Amount */}
                <Text
                  className={`text-[14px] font-gabarito ${
                    tx.isCredit ? 'text-status-success' : 'text-text-dark'
                  }`}
                >
                  {tx.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}