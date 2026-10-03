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
// Cash Correction — final step in the dispute flow
//
// Customer enters the actual cash they handed over. Submitting
// calls api.payments.disputeCash with everything (reason, note,
// correctAmount), then returns to cash-review with the updated
// amount so the customer can agree to it.
//
// Units:
//   `originalAmount` arrives in KOBO from cash-review.
//   Input field works in NAIRA (users type naira).
//   Convert:
//     display = originalKobo / 100
//     submit  = correctNaira * 100
//
// Flow:
//   cash-review → cash-dispute (pick reason)
//              → cash-correction (this screen: enter amount)
//              → disputeCash API call
//              → cash-review (updated amount)
//              → confirmCashAmount → errand-confirmed
//
// The dispute is only submitted ONCE, here, with all four pieces
// (paymentId, reason, note, correctAmount). This is why
// cash-dispute doesn't hit the API itself.
// ─────────────────────────────────────────────────────────────

/** Display a kobo amount as naira: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

/** Format a raw digit string with thousand separators. */
const formatAmountInput = (v: string): string => {
  const digits = v.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
};

export default function CashCorrection() {
  const params = useLocalSearchParams<{
    // From cash-review + cash-dispute
    originalAmount?: string;    // KOBO
    amount?: string;            // KOBO (also set)
    errandId?: string;
    paymentId?: string;
    runnerName?: string;
    disputeReason?: string;
    disputeNote?: string;
    // Wizard pass-through
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    runnerId?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  // ─── Original amount (kobo) ───
  // Prefer `originalAmount` (set by dispute); fall back to
  // `amount` in case we're reached from a different path.
  const originalKobo = Number(
    params.originalAmount ?? params.amount ?? '0'
  );

  const paymentId = params.paymentId ?? '';
  const runnerName = params.runnerName ?? 'the runner';
  const reason = params.disputeReason ?? 'amount-wrong';
  const note = params.disputeNote ?? '';

  // ─── Form state (naira display string) ───
  // Prefilled with the original amount so the user can just tweak
  // it if only the cents differ.
  const [amount, setAmount] = useState(String(Math.round(originalKobo / 100)));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Derived ───
  const correctNaira = Number(amount.replace(/\D/g, '') || '0');
  const correctKobo = correctNaira * 100;
  const originalNaira = Math.round(originalKobo / 100);

  // Valid when:
  //   - a positive amount is entered
  //   - it differs from the original (otherwise why dispute?)
  const isValid =
    correctNaira > 0 && correctNaira !== originalNaira;

  // Difference for the delta line — positive if user paid more,
  // negative if runner over-claimed.
  const deltaNaira = correctNaira - originalNaira;

  const validationHint = useMemo(() => {
    if (correctNaira <= 0) return 'Enter the amount you handed over';
    if (correctNaira === originalNaira)
      return 'Amount matches what the runner said — no dispute needed';
    return null;
  }, [correctNaira, originalNaira]);

  // ─── Submit ───
  const handleSubmit = async () => {
    if (!isValid) return;
    if (!paymentId) {
      setError('Missing payment reference. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Full dispute submission — reason, note, and the correct
      // amount all go in one call.
      await api.payments.disputeCash(paymentId, {
        reason,
        note,
        correctAmount: correctKobo,   // kobo
      });

      // Back to cash-review so the customer can see the corrected
      // amount and tap "Yes, I agree".
      router.replace({
        pathname: '/(customer)/errand/payment/cash-review',
        params: {
          ...params,
          amount: String(correctKobo),   // updated kobo amount
          paymentMethod: 'cash',
          paymentId,
        },
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not submit correction. Please try again.'
      );
      setSubmitting(false);
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
                {runnerName} says you handed over {formatNaira(originalKobo)}.
                Input the correct cash amount you handed over.
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

            {/* ─── Amount input ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                CORRECT CASH AMOUNT
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
                    setAmount(formatAmountInput(v));
                    if (error) setError(null);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  editable={!submitting}
                />
              </View>

              {/* Delta helper — tells the user how much difference
                  their correction represents */}
              {isValid ? (
                <Text className="text-caption font-figtree text-text-light mt-1.5">
                  {deltaNaira > 0
                    ? `₦${deltaNaira.toLocaleString('en-US')} more than the runner claimed`
                    : `₦${Math.abs(deltaNaira).toLocaleString('en-US')} less than the runner claimed`}
                </Text>
              ) : validationHint ? (
                <Text className="text-caption font-figtree text-text-light mt-1.5">
                  {validationHint}
                </Text>
              ) : null}
            </View>

            {/* ─── Submitted reason recap ─── */}
            <View className="bg-primary-light rounded-2xl px-4 py-3.5">
              <Text className="text-micro font-figtree-bold text-primary uppercase tracking-wider mb-1">
                DISPUTE REASON
              </Text>
              <Text className="text-body-xs font-figtree text-ink">
                {reasonLabel(reason)}
              </Text>
              {note ? (
                <Text className="text-caption font-figtree text-muted mt-1.5">
                  “{note}”
                </Text>
              ) : null}
            </View>

          </View>
        </ScrollView>

        {/* ─── CTA ─── */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Human label for a dispute reason id. */
function reasonLabel(id: string): string {
  switch (id) {
    case 'amount-wrong':   return 'Amount is wrong';
    case 'never-received': return 'I never handed cash';
    case 'runner-changed': return 'Different runner';
    case 'other':          return 'Something else';
    default:               return id;
  }
}