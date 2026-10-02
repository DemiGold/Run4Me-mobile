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
// Cash Amount Correction
//
// Figma: Cash amount correction
//   Warning banner · ₦-prefixed field · multi-line note · CTA
//
// Figma's copy is runner-facing ("David disputed ₦17,500").
// This file uses the customer-side mirror ("You disputed ₦X").
// To reuse for runner-side, swap the BANNER_TEXT and NOTE_PLACEHOLDER
// constants below — layout is identical.
//
// MOCK: submits → back to cash-review.
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatAmount = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (!d) return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function CashCorrection() {
  const params = useLocalSearchParams<{
    amount?: string;
    originalAmount?: string;
    errandId?: string;
  }>();

  const disputed = params.originalAmount
    ? parseInt(params.originalAmount, 10)
    : 17500;
  const errandId = params.errandId ?? '';

  const [amount, setAmount] = useState('15,000');
  const [note, setNote] = useState('I handed over ₦15,000 at pickup.');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseInt(amount.replace(/\D/g, '') || '0', 10);
  const isValid = numericAmount > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      // ─── MOCK: replace with real API call ───
      await new Promise((r) => setTimeout(r, 800));

      router.replace({
        pathname: '/(customer)/errand/payment/cash-review',
        params: {
          errandId,
          amount: String(numericAmount),
          note,
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
            Correct cash amount
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

            {/* ─── Warning banner ─── */}
            <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start">
              <Feather
                name="alert-triangle"
                size={18}
                color={colors.danger}
                style={{ marginTop: 2, marginRight: 10 }}
              />
              <Text className="flex-1 text-body-xs font-figtree text-ink leading-5">
                You disputed {formatNaira(disputed)}. Input the correct cash
                amount you handed over.
              </Text>
            </View>

            {/* ─── Correct cash amount ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                CORRECT CASH AMOUNT
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

            {/* ─── Optional note (multi-line) ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                OPTIONAL NOTE
              </Text>
              <View className="rounded-field border border-border bg-surface px-4 py-3.5">
                <TextInput
                  className="text-body font-figtree text-ink"
                  style={{ minHeight: 72, textAlignVertical: 'top' }}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add any detail that helps (e.g. time, place)"
                  placeholderTextColor={colors.subtle}
                  multiline
                  numberOfLines={4}
                  editable={!loading}
                />
              </View>
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
            onPress={handleSubmit}
          >
            Send corrected amount
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}