import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Card OTP confirmation
//
// Vertical 6-digit OTP entered after the customer submits card
// details. Confirms the card payment and advances to the
// errand payment confirmation.
//
// Figma: Card OTP confirmation
//   393 × 712 content, vertical OTP layout (unlike the auth OTP
//   which is horizontal — kept separate on purpose).
//
// MOCK: correct code is '123456'. Replace with a real
// /payment/:id/otp call when the backend ships it.
// ─────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MOCK_CORRECT_CODE = '123456';

export default function CardOtp() {
  const params = useLocalSearchParams<{
    amount?: string;
    cardLast4?: string;
    errandId?: string;
  }>();

  const amount = params.amount ?? '17500';
  const cardLast4 = params.cardLast4 ?? '4910';
  const errandId = params.errandId ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ─── Resend countdown ───
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const otpString = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH;

  // ─── Verify ───
  const handleVerify = useCallback(
    async (code?: string) => {
      const value = code ?? otpString;
      if (value.length !== OTP_LENGTH) {
        setError('Enter the 6-digit code to continue.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // ─── MOCK: replace with real API call ───
        await new Promise((r) => setTimeout(r, 800));

        if (value !== MOCK_CORRECT_CODE) {
          setError('The code you entered is incorrect. Please try again.');
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
          setLoading(false);
          return;
        }

        // ─── Success → bank-payment-confirmation (or next step) ───
        router.replace({
          pathname: '/(customer)/errand/errand-confirmed',
          params: { amount, errandId },
        });
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    },
    [otpString, amount, errandId]
  );

  // ─── Auto-submit on completion ───
  useEffect(() => {
    if (isComplete && !loading) {
      handleVerify(otpString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // ─── Input handlers ───
  const handleChange = (text: string, index: number) => {
    if (error) setError(null);

    const digitsOnly = text.replace(/\D/g, '');

    // Paste of 6 digits → distribute
    if (digitsOnly.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < OTP_LENGTH; i++) {
        if (digitsOnly[i]) next[i] = digitsOnly[i];
      }
      setOtp(next);
      const last = Math.min(digitsOnly.length, OTP_LENGTH) - 1;
      inputRefs.current[last]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digitsOnly.slice(-1);
    setOtp(newOtp);

    if (digitsOnly && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError(null);
    setResendIn(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    // ─── MOCK: real resend API call ───
  };

  const mm = String(Math.floor(resendIn / 60)).padStart(2, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

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
            Confirm payment
          </Text>

          <View className="w-9" />
        </View>

        {/* Content — top-aligned, scrollable */}
        <View className="flex-1 px-6">
          {/* Icon badge */}
          <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center mb-6 mt-4">
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>

          {/* Heading */}
          <Text className="text-heading-sm font-gabarito text-ink mb-2">
            Enter your OTP
          </Text>
          <Text className="text-body-sm font-figtree text-muted mb-7">
            We sent a 6-digit code to the phone number linked to card ending{' '}
            {cardLast4}.
          </Text>

          {/* OTP — vertical, 6 boxes */}
          <View className="gap-3 mb-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className={`
                  w-full h-14 rounded-field px-4
                  text-center text-title font-gabarito text-ink
                  border
                  ${error
                    ? 'border-status-error bg-status-errorLight'
                    : focusedIndex === index
                    ? 'border-primary bg-surface'
                    : 'border-border bg-surface'
                  }
                `}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
            ))}
          </View>

          {/* Error banner */}
          {error ? (
            <View className="bg-status-errorLight border border-status-error/30 rounded-2xl px-4 py-3 flex-row items-start mb-3">
              <Feather
                name="alert-triangle"
                size={16}
                color={colors.danger}
                style={{ marginTop: 1, marginRight: 10 }}
              />
              <Text className="flex-1 text-body-xs font-figtree text-status-error">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Resend */}
          <Text className="text-body-xs font-figtree text-muted mb-6">
            {resendIn > 0
              ? `Resend code in ${mm}:${ss}`
              : 'You can resend the code now.'}
          </Text>

          {resendIn === 0 ? (
            <TouchableOpacity
              onPress={handleResend}
              className="mb-6"
              activeOpacity={0.7}
            >
              <Text className="text-body-sm font-figtree-bold text-primary">
                Resend code
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* CTA */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={() => handleVerify()}
          >
            Confirm card payment
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}