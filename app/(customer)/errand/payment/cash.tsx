import React, { useState, useMemo } from 'react';
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

import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Cash Amount — wired to the payments API
//
// Customer declares the physical cash they'll hand to the
// runner. The runner reviews and accepts (or corrects) on
// the cash-review screen.
//
// Units — read carefully:
//   `params.amount` arrives from checkout in KOBO.
//   The input field is a NAIRA value (users type naira).
//   So we convert ONCE on read:
//     amountNaira = params.amount / 100
//   And once on submit:
//     amountKobo = numericAmount * 100
//
// Why convert here and not use kobo directly:
//   Users think in naira. Showing "2000000" in the input would
//   be absurd. The input is naira, the API contract is kobo,
//   we translate at the boundary.
//
// Flow:
//   1. Read `amount` (kobo) + `errandId` from params.
//   2. Initialize input with amountNaira so the customer sees
//      the total checkout already computed.
//   3. Customer can adjust (e.g. add tip, pay extra for shopping).
//   4. On confirm:
//        api.payments.payWithCash(errandId, amountKobo)
//      → returns a Payment in 'processing' status.
//   5. Route to cash-review with the paymentId + amountKobo.
//
// Note on persistence:
//   The mock `payWithCash` creates a Payment in memory. When
//   the customer refreshes or re-enters, that payment is gone
//   from the mock store on app restart. When the backend ships,
//   it'll persist — no client changes needed.
// ─────────────────────────────────────────────────────────────

/** Format a number with thousand separators: 17500 → "17,500". */
const formatNairaInput = (v: string): string => {
  const digits = v.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
};

export default function CashAmount() {
  // ─── Route params — full wizard chain ───
  const params = useLocalSearchParams<{
    amount?: string;         // KOBO string from checkout
    errandId?: string;
    // Wizard pass-through
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    runnerId?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  const errandId = params.errandId ?? '';

  // ─── Convert kobo → naira for the input default ───
  // `params.amount` is kobo (from checkout). The input works in
  // naira. This is the ONLY place we need to convert on read.
  const defaultAmountNaira = useMemo(() => {
    const kobo = Number(params.amount ?? '0') || 0;
    return String(Math.round(kobo / 100));
  }, [params.amount]);

  // ─── Form state ───
  // `amount` state holds the display string WITH commas (e.g.
  // "17,500"). We strip non-digits when computing the numeric value.
  const [amount, setAmount] = useState(defaultAmountNaira);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Derived numeric value (naira) ───
  const numericAmount = Number(amount.replace(/\D/g, '') || '0');
  const isValid = numericAmount > 0;

  // ─── Confirm — send payment to the backend ───
  const handleConfirm = async () => {
    if (!isValid) return;
    if (!errandId) {
      setError('Missing errand reference. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert naira → kobo before the API call.
      const amountKobo = numericAmount * 100;

      // Server records the declared amount. Returns a Payment in
      // 'processing' status — the runner will review/accept on
      // their side, and this customer-facing flow polls or
      // refreshes after that.
      const payment = await api.payments.payWithCash(errandId, amountKobo);

      router.push({
        pathname: '/(customer)/errand/payment/cash-review',
        params: {
          ...params,
          amount: String(amountKobo),   // kobo — convention holds
          paymentId: payment.id,
          paymentMethod: 'cash',
        },
      });
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Could not submit cash amount. Please try again.';
      setError(message);
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

            {/* ─── Heading + subtitle ─── */}
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-2">
                How much cash are you handing over?
              </Text>
              <Text className="text-body-sm font-figtree text-muted">
                Enter the exact amount the runner will receive for the errand.
              </Text>
            </View>

            {/* ─── Error banner ─── */}
            {error ? (
              <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.danger}
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-body-xs font-figtree text-status-error">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* ─── Cash amount field — ₦ prefix inside the container ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                CASH AMOUNT
              </Text>
              <View
                className={`
                  flex-row items-center h-14 rounded-field px-4
                  border bg-surface
                  ${error ? 'border-status-error' : 'border-border'}
                `}
              >
                <Text className="text-body font-figtree text-ink mr-1.5">₦</Text>
                <TextInput
                  className="flex-1 text-body font-figtree text-ink"
                  value={amount}
                  onChangeText={(v) => {
                    // formatNairaInput strips non-digits and adds
                    // commas — same pattern we use in budget.tsx.
                    setAmount(formatNairaInput(v));
                    if (error) setError(null);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* ─── Info banner — warm cream ─── */}
            <View className="bg-accent-light rounded-2xl px-4 py-3.5">
              <Text className="text-caption font-figtree text-muted">
                The runner must agree to this amount before the errand begins.
              </Text>
            </View>

          </View>
        </ScrollView>

        {/* ─── CTA ─── */}
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