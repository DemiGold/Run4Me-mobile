import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const RECEIPT_IMAGE = require('@/assets/receipt-photo.png'); 

const PURCHASED_ITEMS = [
  { id: '1', name: 'Golden Penny Pasta x2', price: '₦1,200' },
  { id: '2', name: 'Eva Table Water Case', price: '₦2,500' },
  { id: '3', name: 'Lano Milk Powder 400g', price: '₦2,100' },
  { id: '4', name: 'Kellogg Cornflakes Large', price: '₦7,400' },
];

const APPROVED_BUDGET = '₦15,000';
const ACTUAL_SPENT = '₦13,200';
const REFUND_AMOUNT = '₦1,800';

export default function ReceiptBilling() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleContinue = () => {
    router.replace({
      pathname: '/(customer)/errand/confirm-delivery',
      params,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[15px] font-gabarito text-text-dark">
          Receipt & Billing
        </Text>

        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Receipt image */}
          <View
            className="w-full rounded-2xl overflow-hidden bg-background-dark mb-3"
            style={{ height: 180 }}
          >
            <Image
              source={RECEIPT_IMAGE}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Uploaded info */}
          <View className="flex-row items-center justify-center gap-1.5 mb-6">
            <Feather name="file-text" size={12} color="#94A3B8" />
            <Text className="text-[11px] font-figtree text-text-gray">
              David uploaded receipt at 10:14 AM
            </Text>
          </View>

          {/* PURCHASED ITEMS card */}
          <View className="border border-border rounded-2xl p-4 bg-white mb-5">
            <Text className="text-[11px] font-figtree-bold text-text-dark tracking-wider mb-4">
              PURCHASED ITEMS
            </Text>

            {/* Item rows */}
            <View className="gap-3 mb-4">
              {PURCHASED_ITEMS.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between"
                >
                  <Text className="flex-1 text-[13px] font-figtree text-text-gray pr-3">
                    {item.name}
                  </Text>
                  <Text className="text-[13px] font-figtree-bold text-text-dark">
                    {item.price}
                  </Text>
                </View>
              ))}
            </View>

            <View className="h-[1px] bg-border mb-3" />

            {/* Budget rows */}
            <View className="gap-2 mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-figtree text-text-gray">
                  Approved Shopping Budget
                </Text>
                <Text className="text-[13px] font-figtree text-text-dark">
                  {APPROVED_BUDGET}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-figtree-bold text-text-dark">
                  Actual Amount Spent
                </Text>
                <Text className="text-[13px] font-figtree-bold text-text-dark">
                  {ACTUAL_SPENT}
                </Text>
              </View>
            </View>

            {/* Refund box */}
            <View className="rounded-xl px-4 py-3 flex-row items-center justify-between bg-status-successLight">
              <View className="flex-row items-center gap-2">
                <View className="w-5 h-5 rounded-full bg-status-success items-center justify-center">
                  <Feather name="check" size={11} color="#FFFFFF" />
                </View>
                <Text className="text-[13px] font-figtree-bold text-status-successDark">
                  Refund to Wallet
                </Text>
              </View>

              <Text className="text-[14px] font-gabarito text-status-successDark">
                {REFUND_AMOUNT}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}