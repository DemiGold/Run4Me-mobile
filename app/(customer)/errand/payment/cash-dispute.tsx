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
// Cash Dispute — reason collector
//
// Step 1 of 2 in the dispute flow. Customer picks a reason and
// optionally explains. The actual dispute (with the corrected
// amount) is submitted on cash-correction, not here.
//
// Why not call the API here:
//   `api.payments.disputeCash(paymentId, { reason, note, correctAmount })`
//   requires the CORRECT amount — which the customer enters on
//   the next screen. Recording a partial dispute without an
//   amount would leave the backend with an incomplete record.
//
//   Instead we pass { reason, note } forward and let
//   cash-correction call disputeCash with everything at once.
//
// Units:
//   `amount` arrives in KOBO from cash-review (which got it from
//   cash.tsx). formatNaira divides by 100 for display.
// ─────────────────────────────────────────────────────────────

/** Display a kobo amount as naira: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

type Reason =
  | 'amount-wrong'
  | 'never-received'
  | 'runner-changed'
  | 'other';

const REASONS: { id: Reason; label: string; hint: string }[] = [
  {
    id: 'amount-wrong',
    label: 'Amount is wrong',
    hint: 'The runner claimed more or less than what I gave',
  },
  {
    id: 'never-received',
    label: 'I never handed cash',
    hint: 'Payment method should be different',
  },
  {
    id: 'runner-changed',
    label: 'Different runner',
    hint: 'A different person showed up',
  },
  {
    id: 'other',
    label: 'Something else',
    hint: "I'll explain below",
  },
];

export default function CashDispute() {
  const params = useLocalSearchParams<{
    amount?: string;          // KOBO from cash-review
    errandId?: string;
    paymentId?: string;
    runnerName?: string;
    // Wizard pass-through
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    runnerNameUpper?: string;
    runnerId?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  // amount in kobo — display only here, forwarded unchanged.
  const amountKobo = params.amount ? parseInt(params.amount, 10) : 0;
  const runnerName = params.runnerName ?? 'the runner';

  const [reason, setReason] = useState<Reason | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason !== null && !submitting;

  // ─── Continue ───
  // We don't hit the API here — cash-correction submits the full
  // dispute with reason + note + corrected amount in one call.
  // We just forward the collected inputs.
  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitting(true);
    try {
      // Tiny delay so the button spinner is visible — makes the
      // navigation feel deliberate rather than instant.
      await new Promise((r) => setTimeout(r, 250));

      router.replace({
        pathname: '/(customer)/errand/payment/cash-correction',
        params: {
          ...params,
          // originalAmount preserves the amount we're disputing.
          // cash-correction will use this to compute the delta.
          originalAmount: String(amountKobo),
          disputeReason: reason,
          disputeNote: note.trim(),
        },
      });
    } catch {
      // Nothing to catch — the delay can't fail. But keeping the
      // try/finally makes the state cleanup bulletproof.
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

          <Text className="text-body font-gabarito text-ink">Dispute Amount</Text>

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
                {runnerName} says you handed over {formatNaira(amountKobo)}. If
                this is incorrect, tell us why and enter the correct amount on
                the next screen.
              </Text>
            </View>

            {/* ─── Reason picker ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-3">
                WHAT WENT WRONG?
              </Text>

              <View className="gap-2">
                {REASONS.map((r) => {
                  const isSelected = reason === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setReason(r.id)}
                      activeOpacity={0.8}
                      disabled={submitting}
                      className={`
                        rounded-2xl p-4 border flex-row items-center gap-3
                        ${
                          isSelected
                            ? 'border-primary bg-primary-light'
                            : 'border-border bg-surface'
                        }
                      `}
                    >
                      <View
                        className={`
                          w-5 h-5 rounded-full border-2 items-center justify-center
                          ${
                            isSelected
                              ? 'border-primary'
                              : 'border-border-light'
                          }
                        `}
                      >
                        {isSelected ? (
                          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                        ) : null}
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`
                            text-body-sm font-figtree-bold
                            ${isSelected ? 'text-primary' : 'text-ink'}
                          `}
                        >
                          {r.label}
                        </Text>
                        <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                          {r.hint}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ─── Optional note ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                OPTIONAL NOTE
              </Text>
              <View
                className="rounded-field border border-border bg-surface px-4 py-3.5"
                style={{ minHeight: 100 }}
              >
                <TextInput
                  className="flex-1 text-body font-figtree text-ink"
                  style={{ textAlignVertical: 'top' }}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add details that help us investigate"
                  placeholderTextColor={colors.subtle}
                  multiline
                  numberOfLines={4}
                  editable={!submitting}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ─── CTA ─── */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            Continue to correct amount
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}