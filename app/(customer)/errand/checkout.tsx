import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const SERVICE_FEE = 1500;
const DISTANCE_FEE = 800;
const PLATFORM_FEE = 200;

type PaymentMethod = 'wallet' | 'card' | 'transfer' | 'cash';

type Method = {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
};

const PAYMENT_METHODS: Method[] = [
  {
    id: 'wallet',
    label: 'Run4Me Wallet',
    subtitle: 'Balance: ₦22,500',
    icon: 'credit-card',
  },
  {
    id: 'card',
    label: 'GTBank Card **** 4910',
    subtitle: '',
    icon: 'credit-card',
  },
  {
    id: 'transfer',
    label: 'Bank Transfer',
    subtitle: '',
    icon: 'repeat',
  },
  {
    id: 'cash',
    label: 'Cash',
    subtitle: '',
    icon: 'x-circle',
  },
];

export default function Checkout() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const budget = Number(params.budget ?? '15000') || 15000;

  // Promo discount
  const promoDiscount = params.promo === 'FIRST4ME' ? 1000 : 0;

  const serviceTotal = SERVICE_FEE + DISTANCE_FEE + PLATFORM_FEE - promoDiscount;
  const dueNow = serviceTotal + budget;

  const [selected, setSelected] = useState<PaymentMethod>('wallet');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString('en-US')}`;

  const handleConfirm = () => {
    // Navigate to finding-runner (which auto-forwards to runner-secured)
    router.replace({
      pathname: '/(customer)/errand/finding-runner',
      params: { ...params, paymentMethod: selected },
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
          Cost Estimate
        </Text>

        {/* Floating chat placeholder */}
        <View
          className="w-10 h-10 rounded-full bg-text-dark items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
            <Text className="text-[10px] font-gabarito text-text-dark">T</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title */}
          <Text className="text-[20px] font-gabarito text-text-dark mb-4 mt-1">
            Cost Breakdown
          </Text>

          {/* Cost breakdown card */}
          <View className="border border-border rounded-2xl p-4 mb-6 bg-white">
            <Row label="Errand Service Fee" value={formatNaira(SERVICE_FEE)} />
            <Row label="Distance Fee" value={formatNaira(DISTANCE_FEE)} />
            <Row label="Platform Fee" value={formatNaira(PLATFORM_FEE)} />

            <View className="h-[1px] bg-border my-3" />

            <Row label="Shopping Budget" value={formatNaira(budget)} />

            <View className="h-[1px] bg-border my-3" />

            {/* Estimated total */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[13px] font-gabarito text-text-dark">
                  Estimated Service Total
                </Text>
                <Text className="text-[10px] font-figtree text-text-light mt-0.5">
                  Excludes actual shopping spend
                </Text>
              </View>
              <Text className="text-[15px] font-gabarito text-primary">
                {formatNaira(serviceTotal)}
              </Text>
            </View>

            {/* Promo row */}
            {promoDiscount > 0 && (
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                <View className="flex-row items-center gap-2">
                  <Feather name="gift" size={12} color="#006B75" />
                  <Text className="text-[11px] font-figtree-bold text-primary">
                    Promo {params.promo} applied
                  </Text>
                </View>
                <Text className="text-[12px] font-figtree-bold text-primary">
                  -{formatNaira(promoDiscount)}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <Text className="text-[14px] font-gabarito text-text-dark mb-3">
            Payment Method
          </Text>

          <View className="gap-3 mb-6">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selected === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelected(method.id)}
                  activeOpacity={0.8}
                  className={`rounded-2xl p-4 flex-row items-center gap-3 bg-white ${
                    isSelected
                      ? 'border-2 border-primary'
                      : 'border border-border'
                  }`}
                >
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center ${
                      isSelected ? 'bg-primary-light' : 'bg-background-dark'
                    }`}
                  >
                    <Feather
                      name={method.icon}
                      size={16}
                      color={isSelected ? '#006B75' : '#475569'}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[13px] font-gabarito text-text-dark">
                      {method.label}
                    </Text>
                    {method.subtitle ? (
                      <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                        {method.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {/* Radio indicator */}
                  {isSelected ? (
                    <View className="w-5 h-5 rounded-full border-[5px] border-primary" />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-border-light" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom: due now + CTA */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-border">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[12px] font-figtree text-text-gray">
            Due Now (Total + Budget):
          </Text>
          <Text className="text-[16px] font-gabarito text-text-dark">
            {formatNaira(dueNow)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            Confirm & Pay {formatNaira(dueNow)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-[13px] font-figtree text-text-gray">{label}</Text>
      <Text className="text-[13px] font-figtree-bold text-text-dark">
        {value}
      </Text>
    </View>
  );
}