import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { PaymentStatus } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Bank Payment Confirmation — wired to the payments API
//
// The customer has already sent the bank transfer externally
// (via their banking app). This screen's job is to wait for the
// backend to confirm receipt, then route forward.
//
// Data flow:
//   1. Read `paymentId` from route params (set by bank-transfer).
//   2. Poll api.payments.checkBankTransferStatus(paymentId)
//      every POLL_MS.
//   3. Status transitions:
//        'processing' → keep polling, progress bar animates
//        'confirmed'  → snap progress to 100%, wait ~600ms, then
//                       route to errand-confirmed
//        'failed'     → stop polling, show error UI
//   4. Manual "Check payment status" fires an immediate poll.
//
// Progress bar behaviour:
//   The bar animates independently on a fixed timeline (GROWTH_MS
//   → 95%). It's decorative — it doesn't reflect the real backend
//   state, just gives the user a sense that something is happening.
//   On confirmation, we snap it to 100%.
//
// Why a fixed growth timeline:
//   Real bank transfers settle in 2–60 seconds. A bar that jumps
//   to 100% the instant the backend confirms would look frozen
//   during the wait. A slow, steady growth communicates "we're
//   working on it" even when the backend is quiet.
//
// Cancellation safety:
//   The polling effect uses a `cancelled` ref. Late responses
//   after unmount are silently dropped — no setState warnings,
//   no phantom navigation.
// ─────────────────────────────────────────────────────────────

const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

// ─── Timing ───
// How often to ask the backend if the transfer has settled.
// 2s feels responsive without hammering the server.
const POLL_MS = 2000;

// How long the progress bar takes to reach 95%. Independent of
// the actual confirmation time — just a smooth visual.
const GROWTH_MS = 20_000;

// Pause after "confirmed" so the user sees the success state
// before we route away.
const CONFIRM_PAUSE_MS = 600;

export default function BankPaymentConfirmation() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
    paymentId?: string;
    // Pass-through wizard params
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    runnerName?: string;
    runnerPrice?: string;
    runnerRating?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
  }>();

  const amount = params.amount ? parseInt(params.amount, 10) : 1_750_000;
  const errandId = params.errandId ?? '';
  const paymentId = params.paymentId ?? '';

  // ─── Data state ───
  const [status, setStatus] = useState<PaymentStatus | 'unknown'>('unknown');
  const [checking, setChecking] = useState(false); // manual check in flight
  const [error, setError] = useState<string | null>(null);

  // ─── Progress bar ───
  // 0 → 1 over GROWTH_MS, independently of the backend.
  const progress = useRef(new Animated.Value(0)).current;

  // ─── Refs for cancellation ───
  const cancelled = useRef(false);

  // ─── Progress animation ───
  // Runs once on mount. Caps at 0.95. When we confirm, another
  // effect snaps it to 1.
  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 0.95,
      duration: GROWTH_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width interpolation is not native-drivable
    });
    anim.start();
    return () => anim.stop();
  }, [progress]);

  // ─── Polling ───
  useEffect(() => {
    cancelled.current = false;

    // Guard: no paymentId means we can't poll. Show an error.
    if (!paymentId) {
      setError(
        'Missing payment reference. Please go back and try again.'
      );
      setStatus('failed');
      return;
    }

    const poll = async () => {
      try {
        const res = await api.payments.checkBankTransferStatus(paymentId);
        if (cancelled.current) return;

        setStatus(res.status);

        // Stop polling once we have a terminal status.
        if (res.status === 'confirmed' || res.status === 'failed') {
          clearInterval(interval);
        }
      } catch (e) {
        if (cancelled.current) return;
        // A single failed poll isn't fatal — the next one might
        // succeed. We don't want to error out just because of a
        // brief network hiccup. But we do surface the message.
        setError(
          e instanceof Error ? e.message : 'Could not check payment status.'
        );
      }
    };

    // Immediate first poll
    poll();
    const interval = setInterval(poll, POLL_MS);

    return () => {
      cancelled.current = true;
      clearInterval(interval);
    };
  }, [paymentId]);

  // ─── Route away on confirmed ───
  useEffect(() => {
    if (status !== 'confirmed') return;

    // Snap the progress bar to full before routing.
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      router.replace({
        pathname: '/(customer)/errand/errand-confirmed',
        params: { ...params, amount: String(amount), errandId },
      });
    }, CONFIRM_PAUSE_MS);

    return () => clearTimeout(t);
  }, [status, amount, errandId, params, progress]);

  // ─── Manual check ───
  // Fires an immediate poll. Useful when a customer says
  // "I just sent it, check now."
  const handleCheckStatus = useCallback(async () => {
    if (checking || !paymentId) return;
    setChecking(true);
    setError(null);
    try {
      const res = await api.payments.checkBankTransferStatus(paymentId);
      setStatus(res.status);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not check payment status.'
      );
    } finally {
      setChecking(false);
    }
  }, [paymentId, checking]);

  // ─── Help ───
  const handleHelp = () => {
    router.push('/(customer)/account/help');
  };

  // ─── Derived render values ───
  const isConfirmed = status === 'confirmed';
  const isFailed = status === 'failed';

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  const heading = isConfirmed
    ? 'Payment confirmed'
    : isFailed
    ? 'Payment not confirmed'
    : 'Confirming your payment';

  const subtitle = isConfirmed
    ? `Your ${formatNaira(amount)} transfer has been verified.`
    : isFailed
    ? error ?? 'We could not verify your transfer. Please try again or contact support.'
    : `We're checking your ${formatNaira(amount)} bank transfer. This usually takes less than a minute.`;

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

        <Text className="text-body font-gabarito text-ink">
          Confirm transfer
        </Text>

        <View className="w-9" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6">
        {/* Icon badge — swaps per state */}
        <View
          className={`
            w-16 h-16 rounded-full items-center justify-center mb-6 mt-4
            ${isConfirmed ? 'bg-status-successLight' : isFailed ? 'bg-status-errorLight' : 'bg-accent-light'}
          `}
        >
          <Feather
            name={isConfirmed ? 'check' : isFailed ? 'alert-triangle' : 'refresh-cw'}
            size={26}
            color={
              isConfirmed
                ? colors.success
                : isFailed
                ? colors.danger
                : colors.accent
            }
          />
        </View>

        {/* Heading */}
        <Text className="text-heading-sm font-gabarito text-ink mb-2">
          {heading}
        </Text>

        {/* Subtitle */}
        <Text className="text-body-sm font-figtree text-muted mb-7">
          {subtitle}
        </Text>

        {/* Progress bar — only when not failed */}
        {!isFailed ? (
          <View className="h-1.5 bg-border rounded-full overflow-hidden mb-8">
            <Animated.View
              className={`
                h-full rounded-full
                ${isConfirmed ? 'bg-status-success' : 'bg-primary'}
              `}
              style={{ width: widthInterp }}
            />
          </View>
        ) : (
          <View className="mb-8" />
        )}

        {/* Primary CTA — hidden once confirmed (we're about to route) */}
        {!isConfirmed ? (
          <Button
            variant={isFailed ? 'primary' : 'primary'}
            fullWidth
            loading={checking}
            disabled={isFailed && !paymentId}
            onPress={handleCheckStatus}
            className="mb-3"
          >
            {isFailed ? 'Try again' : 'Check payment status'}
          </Button>
        ) : null}

        {/* Secondary CTA */}
        <Button variant="secondary" fullWidth onPress={handleHelp}>
          I need help
        </Button>
      </View>
    </SafeAreaView>
  );
}