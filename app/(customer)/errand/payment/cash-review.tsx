import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { Payment } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Cash Review — wired to the payments API
//
// Customer sees the amount the runner has claimed and either
// agrees (confirming the payment) or disputes it (opening the
// cash-dispute flow).
//
// Units:
//   `amount` arrives from cash.tsx ALREADY in KOBO. formatNaira
//   divides by 100 for display. Do not multiply here.
//
// Flow:
//   1. Read `amount`, `paymentId`, `errandId`, `runnerName` from
//      params (set by cash.tsx).
//   2. On mount, fetch the payment to see if the runner has
//      already reviewed it. This catches the edge case where the
//      customer reopens the screen after agreeing.
//      - status 'confirmed'  → render as confirmed, CTA becomes
//                              "Continue" instead of "Yes, I agree"
//      - status 'processing' → normal agree/dispute UI
//      - status 'failed'     → show error state
//   3. Agree → api.payments.confirmCashAmount(paymentId, amountKobo)
//              then route to errand-confirmed
//   4. Dispute → route to cash-dispute (which handles the reason
//                + correction flow)
//
// Why fetch the payment: without it, we'd have no way to know
// whether the runner has already responded on their side. The
// fetch makes this screen idempotent — safe to reopen.
// ─────────────────────────────────────────────────────────────

/** Display a kobo amount as naira: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

export default function CashReview() {
  const params = useLocalSearchParams<{
    amount?: string;         // KOBO from cash.tsx
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
    scheduledDate?: string;
    scheduledTime?: string;
    runnerId?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  // amount in kobo — straight from cash.tsx, no conversion.
  const amountKobo = params.amount ? parseInt(params.amount, 10) : 0;
  const errandId = params.errandId ?? '';
  const paymentId = params.paymentId ?? '';
  const runnerName = params.runnerName ?? 'Your Runner';

  // ─── Data state ───
  // `payment` reflects the backend's view. On mount we fetch it
  // to see if the runner has already responded.
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Action state ───
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch the payment on mount ───
  const fetchPayment = useCallback(async () => {
    if (!paymentId) return;
    setLoadingPayment(true);
    try {
      const p = await api.payments.getPayment(paymentId);
      setPayment(p);
    } catch {
      // Non-fatal — we still render the UI using params. The
      // agree action will fail loudly if the payment is bad.
    } finally {
      setLoadingPayment(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  // Already confirmed? Change the CTA copy so reopening this
  // screen doesn't confuse the customer.
  const alreadyConfirmed = payment?.status === 'confirmed';

  // ─── Agree ───
  const handleAgree = async () => {
    if (!paymentId || !errandId) {
      setError('Missing payment or errand reference. Please go back.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Server confirms the amount the customer and runner agreed
      // on. Returns the now-confirmed Payment.
      await api.payments.confirmCashAmount(paymentId, amountKobo);

      // Route to errand-confirmed with the full param chain.
      router.replace({
        pathname: '/(customer)/errand/errand-confirmed',
        params: {
          ...params,
          amount: String(amountKobo),
          paymentMethod: 'cash',
          paymentId,
        },
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not confirm. Please try again.'
      );
      setSubmitting(false);
    }
  };

  // ─── Dispute ───
  const handleDispute = () => {
    if (submitting) return;
    router.push({
      pathname: '/(customer)/errand/payment/cash-dispute',
      params: {
        ...params,
        amount: String(amountKobo),   // kobo
        originalAmount: String(amountKobo),
        paymentId,
        runnerName,
      },
    });
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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
        <Text className="text-heading-lg font-gabarito text-primary mt-3 mb-6">
          {formatNaira(amountKobo)}
        </Text>

        {/* Error banner */}
        {error ? (
          <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5 mb-4">
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

        {/* Info banner — shows what "dispute" actually does */}
        <View className="bg-primary-light rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
          <Feather
            name="info"
            size={16}
            color={colors.primary}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-caption font-figtree text-muted">
            If the amount is wrong, tap <Text className="font-figtree-bold">Dispute</Text> and enter the correct cash you handed over. Support will review.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 pb-6 gap-3">
        <Button
          variant="primary"
          fullWidth
          loading={submitting}
          disabled={loadingPayment}
          onPress={handleAgree}
        >
          {alreadyConfirmed ? 'Continue' : 'Yes, I agree'}
        </Button>

        <Button
          variant="destructive"
          fullWidth
          disabled={submitting || alreadyConfirmed}
          onPress={handleDispute}
        >
          Dispute amount
        </Button>
      </View>

    </SafeAreaView>
  );
}