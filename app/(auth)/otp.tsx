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
import { Feather } from '@expo/vector-icons';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// OTP Screen
//
// Reads `identifier` from route params (set by Sign In or
// Customer Registration) and displays a masked version in the
// "sent to ..." line.
//
// MOCK verification — the correct code is '123456'. Replace
// with a real API call when Samuel ships the endpoint.
// ─────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MOCK_CORRECT_CODE = '123456';

// Mask a phone or email for display.
const maskIdentifier = (raw: string): string => {
  if (!raw) return 'your contact';
  const trimmed = raw.trim();

  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    const visible = user.slice(0, 3);
    return `${visible}${'*'.repeat(Math.max(user.length - 3, 2))}@${domain}`;
  }

  // Phone: keep first 4 and last 2 visible
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 6) return trimmed;
  const first = digits.slice(0, 4);
  const last = digits.slice(-2);
  return `${first}${'*'.repeat(digits.length - 6)}${last}`;
};

export default function OTPScreen() {
  const params = useLocalSearchParams<{ identifier?: string }>();
  const identifier = params.identifier ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const user = useAuthStore((state) => state.user);

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

        const userRole = user?.role || 'customer';
        router.replace({
          pathname: '/(auth)/location-permission',
          params: { role: userRole },
        });
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    },
    [otpString, user]
  );

  // ─── Auto-submit when 6 digits are filled ───
  useEffect(() => {
    if (isComplete && !loading) {
      handleVerify(otpString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // ─── Input handlers ───
  const handleChange = (text: string, index: number) => {
    // Clear error as soon as user starts typing
    if (error) setError(null);

    // Paste: user pastes 6 digits into one box → distribute
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < OTP_LENGTH; i++) {
        if (digitsOnly[i]) next[i] = digitsOnly[i];
      }
      setOtp(next);
      const lastIndex = Math.min(digitsOnly.length, OTP_LENGTH) - 1;
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    // Normal single-digit entry
    const newOtp = [...otp];
    newOtp[index] = digitsOnly.slice(-1);
    setOtp(newOtp);

    if (digitsOnly && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      // If current box has a digit, clear it (default behavior handles this).
      // If it's empty, jump back and clear the previous one.
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // ─── Resend ───
  const handleResend = () => {
    if (resendIn > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError(null);
    setResendIn(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    // ─── MOCK: replace with real resend API call ───
  };

  const mm = String(Math.floor(resendIn / 60)).padStart(2, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 w-8"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text className="text-body font-gabarito text-ink text-center">
            Verify
          </Text>
          <View className="w-8" />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center px-6">
          <Text className="text-heading-sm font-gabarito text-ink mb-2">
            Verify your account
          </Text>
          <Text className="text-body-sm font-figtree text-muted mb-8">
            We've sent a 6-digit verification code to{' '}
            <Text className="font-figtree-bold text-ink">
              {maskIdentifier(identifier)}
            </Text>
          </Text>

          {/* OTP Input Row */}
          <View className="flex-row justify-between mb-5 gap-1.5">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className={`
                  flex-1 h-14 border rounded-2xl text-center text-title font-gabarito text-ink
                  ${error
                    ? 'border-status-error bg-status-errorLight'
                    : focusedIndex === index
                    ? 'border-primary bg-surface'
                    : 'border-border bg-background-light'
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

          {/* Error Banner — only when there's an error */}
          {error ? (
            <View className="bg-status-errorLight border border-status-error/30 rounded-2xl px-4 py-3.5 flex-row items-start mb-8">
              <View className="mt-0.5 mr-2.5">
                <Feather name="alert-triangle" size={16} color={colors.danger} />
              </View>
              <Text className="flex-1 text-body-xs font-figtree text-status-error">
                {error}
              </Text>
            </View>
          ) : (
            <View className="mb-8" />
          )}

          {/* Verify Button — always full teal, always tappable.
              Missing digits → shows error in the banner above. */}
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={() => handleVerify()}
            className="mb-7"
          >
            Verify & Continue
          </Button>

          {/* Footer Links */}
          <View className="flex-row items-center justify-between">
            <Text className="text-body-xs font-figtree text-muted">
              {resendIn > 0
                ? `Resend code in ${mm}:${ss}`
                : "Didn't get the code?"}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendIn > 0}
              hitSlop={8}
            >
              <Text
                className={`text-body-xs font-figtree-bold ${
                  resendIn > 0 ? 'text-text-light' : 'text-primary'
                }`}
              >
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Change contact details */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center mt-6"
          >
            <Text className="text-body-xs font-figtree-bold text-primary">
              Change Contact Details
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}