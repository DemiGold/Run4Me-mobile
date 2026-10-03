import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Confirm Delivery
//
// Shows the 4-digit delivery code the customer reads to the
// runner. Tapping the code copies it — that's the primary
// interaction (customers often paste it into the chat if they're
// not face-to-face).
//
// Figma: confirm-delivery
//   Lock icon · title · 4-digit code boxes · success banner ·
//   Continue CTA.
// ─────────────────────────────────────────────────────────────

// ─── MOCK: replace with GET /errands/:id/delivery-code ───
const DELIVERY_CODE = ['5', '8', '1', '9'];

export default function ConfirmDelivery() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
    runnerName?: string;
  }>();

  const runnerName = params.runnerName ?? 'David';

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(DELIVERY_CODE.join(''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleContinue = () => {
    router.replace({
      pathname: '/(customer)/errand/rate-runner',
      params,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">
          Confirm Delivery
        </Text>

        <View className="w-9" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 items-center justify-center pb-20">

        {/* Lock icon badge */}
        <View className="w-20 h-20 rounded-full bg-accent-light items-center justify-center mb-6">
          <View className="w-14 h-14 rounded-2xl bg-accent items-center justify-center">
            <Feather name="lock" size={26} color={colors.white} />
          </View>
        </View>

        {/* Title */}
        <Text className="text-heading-sm font-gabarito text-ink text-center mb-2">
          Share Delivery Code
        </Text>

        {/* Subtitle */}
        <Text className="text-body-xs font-figtree text-muted text-center mb-8 px-4">
          Share this code with your Errand Runner to confirm delivery.
        </Text>

        {/* 4-digit code — tap to copy */}
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.75}
          className="mb-3"
        >
          <View className="flex-row justify-center gap-3">
            {DELIVERY_CODE.map((digit, index) => (
              <View
                key={index}
                className="w-[64px] h-[72px] border-2 border-primary rounded-2xl items-center justify-center bg-surface"
              >
                <Text className="text-[32px] font-gabarito text-primary">
                  {digit}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Copy hint */}
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          hitSlop={8}
          className="flex-row items-center gap-1.5 mb-8"
        >
          <Feather
            name={copied ? 'check' : 'copy'}
            size={13}
            color={copied ? colors.success : colors.primary}
          />
          <Text
            className={`
              text-caption-sm font-figtree-bold
              ${copied ? 'text-status-success' : 'text-primary'}
            `}
          >
            {copied ? 'Code copied' : 'Tap to copy code'}
          </Text>
        </TouchableOpacity>

        {/* Success banner */}
        <View className="w-full rounded-2xl px-4 py-4 flex-row items-start gap-3 bg-status-successLight">
          <View className="w-6 h-6 rounded-full bg-status-success items-center justify-center mt-0.5">
            <Feather name="check" size={14} color={colors.white} />
          </View>
          <View className="flex-1">
            <Text className="text-body-sm font-figtree-bold text-status-successDark mb-0.5">
              Delivery Confirmed!
            </Text>
            <Text className="text-caption font-figtree text-status-successDark">
              Errand successfully completed with {runnerName}.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleContinue}>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}