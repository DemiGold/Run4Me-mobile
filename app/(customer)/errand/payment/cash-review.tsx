import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Cash Review (customer-side mirror)
//
// Figma: Cash received / Confirm the cash amount
//   Green success badge · ₦ amount in Figma teal ·
//   Primary "Yes, I agree" · Destructive "Dispute amount"
//
// Runner version (in (runner)/) uses the same layout with
// different copy: "Chioma says she handed you:".
//
// MOCK: submit → errand confirmed → rate runner.
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function CashReview() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
    runnerName?: string;
  }>();

  const amount = params.amount ? parseInt(params.amount, 10) : 17500;
  const errandId = params.errandId ?? '';
  const runnerName = params.runnerName ?? 'Runner Tunde';

  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    setLoading(true);
    try {
      // ─── MOCK: replace with real API call ───
      await new Promise((r) => setTimeout(r, 700));

      router.replace({
        pathname: '/(customer)/errand/errand-confirmed',
        params: { errandId, amount: String(amount) },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = () => {
    // ─── MOCK: route to a support/chat flow ───
    router.push({
      pathname: '/(customer)/errand/payment/cash-dispute',
      params: { errandId, amount: String(amount) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">Cash received</Text>

        <View className="w-9" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6">

        {/* Green icon badge — success tone */}
        <View className="w-16 h-16 rounded-full bg-status-successLight items-center justify-center mb-6 mt-4">
          <Ionicons
            name="cash-outline"
            size={30}
            color={colors.successDark}
          />
        </View>

        {/* Heading + subtitle */}
        <Text className="text-heading-sm font-gabarito text-ink mb-2">
          Confirm the cash amount
        </Text>
        <Text className="text-body-sm font-figtree text-muted">
          {runnerName} says he received:
        </Text>

        {/* Big amount */}
        <Text className="text-heading-lg font-gabarito text-primary mt-3 mb-10">
          {formatNaira(amount)}
        </Text>

      </View>

      {/* Actions */}
      <View className="px-6 pb-6 gap-3">
        <Button
          variant="primary"
          fullWidth
          loading={loading}
          onPress={handleAgree}
        >
          Yes, I agree
        </Button>

        <Button
          variant="destructive"
          fullWidth
          disabled={loading}
          onPress={handleDispute}
        >
          Dispute amount
        </Button>
      </View>

    </SafeAreaView>
  );
}