import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Cash Amount
//
// Customer declares the exact cash they will hand the runner.
// The runner must agree to this amount before the errand begins.
//
// Figma: Cash amount
//   393 × 442 content, header "Cash payment"
//   CTA "Confirm cash amount"
//
// MOCK flow: submits → routes to cash-review where the runner
// accepts or corrects the amount.
// ─────────────────────────────────────────────────────────────

// Format with thousand separators as the user types
const formatAmount = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (!d) return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function CashAmount() {
  const params = useLocalSearchParams<{ errandId?: string }>();
  const [amount, setAmount] = useState('17,500');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseInt(amount.replace(/\D/g, '') || '0', 10);
  const isValid = numericAmount > 0;

  const handleConfirm = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      // ─── MOCK: replace with real API call ───
      await new Promise((r) => setTimeout(r, 800));

      router.push({
        pathname: '/(customer)/errand/payment/cash-review',
        params: {
          errandId: params.errandId ?? '',
          amount: String(numericAmount),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </TouchableOpacity>

          <Text className="text-body font-gabarito text-ink">
            Cash payment
          </Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-5">

            {/* Heading + subtitle */}
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-2">
                How much cash are you handing over?
              </Text>
              <Text className="text-body-sm font-figtree text-muted">
                Enter the exact amount the runner will receive for the errand.
              </Text>
            </View>

            {/* Cash amount field — ₦ prefix inside the container */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                CASH AMOUNT
              </Text>
              <View className="flex-row items-center h-14 rounded-field px-4 border border-border bg-surface">
                <Text className="text-body font-figtree text-ink mr-1.5">₦</Text>
                <TextInput
                  className="flex-1 text-body font-figtree text-ink"
                  value={amount}
                  onChangeText={(v) => setAmount(formatAmount(v))}
                  placeholder="0"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Info banner — warm cream, no border */}
            <View className="bg-accent-light rounded-2xl px-4 py-3.5">
              <Text className="text-caption font-figtree text-muted">
                The runner must agree to this amount before the errand begins.
              </Text>
            </View>

          </View>
        </ScrollView>

        {/* CTA */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!isValid}
            onPress={handleConfirm}
          >
            Confirm cash amount
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}