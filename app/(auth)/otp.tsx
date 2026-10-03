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

import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// OTP Screen — wired to the auth API
//
// Reads `identifier` from route params (set by Sign In, Customer
// Registration, or Runner Registration) and displays a masked
// version in the "sent to ..." line.
//
// Flow:
//   1. User enters 6 digits.
//   2. On the 6th digit, auto-submit fires handleVerify.
//   3. handleVerify calls api.auth.verifyOtp(identifier, code).
//   4. On success, the API returns { token, refreshToken, user }.
//   5. We call authStore.login(user, token) to replace the
//      "pending" user seeded at sign-in with the real one.
//   6. Route to location-permission with the user's role.
//
// Mock: correct code is '123456' (enforced inside
// services/api/auth.ts). Wrong code throws ApiError('OTP_INVALID').
//
// Why `login(user, token)` and not `setUser(user)`:
//   - We need BOTH the user AND the token in the store.
//   - login() sets both in a single state update → one render.
//   - setUser alone would leave the token null and break any
//     downstream call that needs auth headers.
// ─────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/**
 * Mask a phone or email for the "sent to ..." line.
 *   Email: adaaez.nwosu@gmail.com → ada***@gmail.com
 *   Phone: +2348123456789        → 2348***89
 */
const maskIdentifier = (raw: string): string => {
  if (!raw) return 'your contact';
  const trimmed = raw.trim();

  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    const visible = user.slice(0, 3);
    return `${visible}${'*'.repeat(Math.max(user.length - 3, 2))}@${domain}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 6) return trimmed;
  const first = digits.slice(0, 4);
  const last = digits.slice(-2);
  return `${first}${'*'.repeat(digits.length - 6)}${last}`;
};

export default function OTPScreen() {
  const params = useLocalSearchParams<{ identifier?: string }>();
  const identifier = params.identifier ?? '';

  // ─── Local UI state ───
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ─── Auth store ───
  // `login(user, token)` is our one call that populates both.
  // `pendingUser` is the half-empty user seeded by sign-in — we
  // use it ONLY to know which role to route to if the API fails
  // to return a role.
  const login = useAuthStore((state) => state.login);
  const pendingUser = useAuthStore((state) => state.user);

  // ─── Resend countdown ───
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const otpString = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH;

  // ─── Verify — calls the API and logs the user in ───
  const handleVerify = useCallback(
    async (code?: string) => {
      const value = code ?? otpString;

      // Guard: user tapped Verify with fewer than 6 digits
      if (value.length !== OTP_LENGTH) {
        setError('Enter the 6-digit code to continue.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // api.auth.verifyOtp returns { token, refreshToken, user }.
        // The mock throws ApiError('OTP_INVALID') on wrong code, so
        // we no longer branch on the code ourselves.
        const response = await api.auth.verifyOtp(identifier, value);

        // Persist the real user + session token. This REPLACES the
        // "pending" user that sign-in seeded with empty fields.
        // After this line, useAuthStore().user has the full profile
        // (name, phone, dob) and useAuthStore().token is populated.
        login(response.user, response.token);

        // Route based on the authenticated user's role.
        // Falls back to the pending user's role if the API didn't
        // return one (shouldn't happen, but defensive).
        const userRole = response.user.role ?? pendingUser?.role ?? 'customer';

        router.replace({
          pathname: '/(auth)/location-permission',
          params: { role: userRole },
        });
      } catch (e) {
        // ApiError has a `message` (human-readable) we can show
        // directly. Non-ApiError throws fall back to a generic.
        const message =
          e instanceof Error
            ? e.message
            : 'The code you entered is incorrect. Please try again.';

        setError(message);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        setLoading(false);
      }
    },
    [otpString, identifier, login, pendingUser]
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

  // ─── Resend — asks the API for a fresh code ───
  const handleResend = async () => {
    if (resendIn > 0) return;

    // Optimistic UI: reset immediately so the user sees feedback
    setOtp(Array(OTP_LENGTH).fill(''));
    setError(null);
    setResendIn(RESEND_SECONDS);
    inputRefs.current[0]?.focus();

    try {
      await api.auth.resendOtp(identifier);
    } catch {
      // Silent — the countdown is already running. If this matters,
      // we'd show a Toast. For now, the user can just try again.
    }
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
                  ${
                    error
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

          {/* Verify Button */}
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={() => handleVerify()}
            className="mb-7"
          >
            Verify &amp; Continue
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