import React, { useState, useEffect, useRef } from 'react';
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

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Bank Payment Confirmation
//
// Screen shown after the customer completes a bank transfer.
// We poll the payment status every few seconds until it settles,
// then route forward. Auto-advances after a mock delay so the
// demo shows the full flow.
//
// Figma: Bank payment confirmation
//   393 × 697 content, teal progress bar, two CTAs.
//
// MOCK: after ~12 seconds we simulate the transfer succeeding.
// Replace with a real GET /payments/:id/status poll.
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// How long the mock takes before it "succeeds"
const MOCK_SUCCESS_MS = 12_000;

export default function BankPaymentConfirmation() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
  }>();

  const amount = params.amount ? parseInt(params.amount, 10) : 17500;
  const errandId = params.errandId ?? '';

  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>(
    'pending'
  );

  // ─── Progress bar animation ───
  // Starts at 0, animates to 1 over MOCK_SUCCESS_MS so the bar
  // grows in sync with the (mock) polling window. Visually
  // matches the Figma's ~30% mid-flight fill at t≈3s.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: MOCK_SUCCESS_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width interpolation
    });
    anim.start();
    return () => anim.stop();
  }, [progress]);

  // ─── Auto-advance on mock success ───
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('confirmed');
      // Small beat so the user sees "confirmed" before we route
      setTimeout(() => {
        router.replace({
          pathname: '/(customer)/errand/errand-confirmed',
          params: { errandId, amount: String(amount) },
        });
      }, 600);
    }, MOCK_SUCCESS_MS);

    return () => clearTimeout(t);
  }, [amount, errandId]);

  // ─── Manual "Check status" — pulses the state briefly ───
  const handleCheckStatus = async () => {
    if (checking) return;
    setChecking(true);
    // ─── MOCK: replace with real GET /payments/:id/status call ───
    await new Promise((r) => setTimeout(r, 800));
    setChecking(false);
  };

  const handleHelp = () => {
    router.push('/(customer)/account/help');
  };

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

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

        {/* Icon badge — cream circle + orange refresh */}
        <View className="w-16 h-16 rounded-full bg-accent-light items-center justify-center mb-6 mt-4">
          <Feather name="refresh-cw" size={26} color={colors.accent} />
        </View>

        {/* Heading */}
        <Text className="text-heading-sm font-gabarito text-ink mb-2">
          {status === 'confirmed' ? 'Payment confirmed' : 'Confirming your payment'}
        </Text>

        {/* Subtitle */}
        <Text className="text-body-sm font-figtree text-muted mb-7">
          {status === 'confirmed'
            ? `Your ${formatNaira(amount)} transfer has been verified.`
            : `We're checking your ${formatNaira(amount)} bank transfer. This usually takes less than a minute.`}
        </Text>

        {/* Progress bar — 6px, rounded, animated fill */}
        <View className="h-1.5 bg-border rounded-full overflow-hidden mb-8">
          <Animated.View
            className="h-full bg-primary rounded-full"
            style={{ width: widthInterp }}
          />
        </View>

        {/* Primary CTA */}
        <Button
          variant="primary"
          fullWidth
          loading={checking}
          onPress={handleCheckStatus}
          className="mb-3"
        >
          Check payment status
        </Button>

        {/* Secondary CTA */}
        <Button
          variant="secondary"
          fullWidth
          onPress={handleHelp}
        >
          I need help
        </Button>

      </View>
    </SafeAreaView>
  );
}