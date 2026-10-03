import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, AntDesign } from '@expo/vector-icons';

import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { isValidEmail, isValidPhone } from '@/constants/validators';

// ─────────────────────────────────────────────────────────────
// Sign In — wired to the auth API
//
// Two flows:
//   1. Email/phone → asks the API to send an OTP → routes to OTP
//      screen where verification completes and logs us in.
//   2. Google → (mock) exchanges an idToken for our own session.
//
// IMPORTANT — pending user is NOT seeded here anymore.
// Previously we called `setUser({ name: '', phone: undefined, ... })`
// before routing to OTP. That "pending" user leaked into Settings
// and other screens with null fields. Now:
//
//   - Sign-in: no user stored. Just identifier → OTP.
//   - OTP verify: calls api.auth.verifyOtp → gets { user, token }
//     → calls authStore.login(user, token). The REAL user lands in
//     the store, fully populated.
//
// If the user backs out of OTP, they return to sign-in with an
// empty store — which is the correct state for "not signed in".
// ─────────────────────────────────────────────────────────────

const isEmailOrPhone = (v: string) => isValidEmail(v) || isValidPhone(v);

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // login() sets both user AND token in one state update.
  // Used only for the Google path (email path goes through OTP).
  const login = useAuthStore((state) => state.login);

  // ─── Email / phone sign-in ───
  const handleContinue = async () => {
    const value = identifier.trim();

    if (!value) {
      setError('Enter your email or phone number to continue.');
      return;
    }
    if (!isEmailOrPhone(value)) {
      setError('Enter a valid email or Nigerian phone number.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Asks the backend to send an OTP to this identifier.
      // The mock just resolves after ~600ms; a real backend would
      // return { otpSent: true, channel: 'email' | 'sms' }.
      await api.auth.signin(value);

      // Hand off to the OTP screen. It reads `identifier` from
      // params to know where to send the code, and its own verify
      // flow will call api.auth.verifyOtp() and log us in.
      router.push({
        pathname: '/(auth)/otp',
        params: { identifier: value },
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Google sign-in (MOCK) ───
  // Real implementation needs:
  //   1. `npx expo install @react-native-google-signin/google-signin`
  //   2. Google Cloud Console OAuth clients (web + android + ios)
  //   3. Development build (Google SDK doesn't work in Expo Go)
  //
  // When ready, replace the string with the real idToken:
  //   const result = await GoogleSignin.signIn();
  //   const idToken = result.data?.idToken;
  //   const response = await api.auth.googleSignIn(idToken);
  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // api.auth.googleSignIn returns the same shape as verifyOtp:
      // { token, refreshToken, user }. The mock returns a demo
      // user so the flow is fully testable.
      const response = await api.auth.googleSignIn('mock-google-id-token');

      // Persist the real user + token, then route home.
      login(response.user, response.token);
      router.replace('/(customer)');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Google sign-in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const isBusy = loading || googleLoading;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6">

          {/* ─── Top Row: Back + Logo ─── */}
          <View className="flex-row items-center justify-between pt-4 pb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 items-center"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="arrow-left" size={24} color={colors.ink} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-primary items-center justify-center">
                <Feather name="x" size={16} color={colors.white} />
              </View>
              <Text className="text-title font-gabarito text-primary">
                Run<Text className="text-accent">4</Text>Me
              </Text>
            </View>

            <View className="w-8" />
          </View>

          {/* ─── Centered content ─── */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header text */}
            <View className="mb-8">
              <Text className="text-heading font-gabarito text-ink mb-2">
                Welcome back
              </Text>
              <Text className="text-body-sm font-figtree text-muted">
                Please sign in with your details to access your errands.
              </Text>
            </View>

            {/* Email / phone input */}
            <Input
              label="Email Address or Phone"
              value={identifier}
              onChangeText={(v) => {
                setIdentifier(v);
                if (error) setError(null);
              }}
              placeholder="e.g. tobi@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error ?? undefined}
              editable={!isBusy}
            />

            {/* Forgot password */}
            <TouchableOpacity
              className="self-end mt-2 mb-6"
              onPress={() => router.push('/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-body-sm font-figtree-bold text-primary">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Continue */}
            <Button
              variant="primary"
              fullWidth
              loading={loading}
              disabled={isBusy}
              onPress={handleContinue}
              className="mb-6"
            >
              Continue
            </Button>

            {/* OR divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="mx-4 text-caption font-figtree-bold text-text-light">
                OR
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            {/* Google — mock, see comment above */}
            <TouchableOpacity
              onPress={handleGoogle}
              disabled={isBusy}
              activeOpacity={0.85}
              className={`
                flex-row border border-border rounded-2xl py-4
                items-center justify-center gap-3 bg-surface mb-6
                ${googleLoading ? 'opacity-60' : ''}
              `}
            >
              {googleLoading ? (
                <Text className="text-body font-figtree-bold text-muted">
                  Signing in...
                </Text>
              ) : (
                <>
                  <AntDesign name="google" size={18} color={colors.ink} />
                  <Text className="text-body font-figtree-bold text-ink">
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity
              className="items-center py-2"
              onPress={() => router.push('/choose-account')}
              disabled={isBusy}
            >
              <Text className="text-body-sm font-figtree text-muted">
                New to Run4Me?{' '}
                <Text className="font-figtree-bold text-primary">
                  Register Now
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}