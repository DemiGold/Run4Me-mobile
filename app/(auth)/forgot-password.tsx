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

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { isValidEmail, isValidPhone } from '@/constants/validators';

// ─────────────────────────────────────────────────────────────
// Forgot Password
//
// 3-step recovery flow in one screen (linear, no separate routes):
//   1. Identify — enter email or phone
//   2. Verify   — enter 6-digit OTP
//   3. Reset    — new password + confirm
//
// MOCK: correct OTP is '123456'. Any password ≥ 8 chars is accepted.
// Replace with real POST /auth/password/reset when backend ships.
//
// Optionally accepts `identifier` route param to prefill step 1
// (wire from sign-in if you want to pass the user's input through).
// ─────────────────────────────────────────────────────────────

type Step = 'identify' | 'verify' | 'reset' | 'done';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MOCK_CORRECT_OTP = '123456';
const MIN_PASSWORD_LENGTH = 8;

// Mask an email or phone for the "sent to" line
const maskIdentifier = (raw: string): string => {
  if (!raw) return 'your contact';
  const t = raw.trim();

  if (t.includes('@')) {
    const [user, domain] = t.split('@');
    const visible = user.slice(0, 3);
    return `${visible}${'*'.repeat(Math.max(user.length - 3, 2))}@${domain}`;
  }

  const digits = t.replace(/\D/g, '');
  if (digits.length < 6) return t;
  return `${digits.slice(0, 4)}${'*'.repeat(digits.length - 6)}${digits.slice(-2)}`;
};

export default function ForgotPassword() {
  const params = useLocalSearchParams<{ identifier?: string }>();

  const [step, setStep] = useState<Step>('identify');

  // Step 1 — identifier
  const [identifier, setIdentifier] = useState(params.identifier ?? '');
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Step 2 — OTP
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Step 3 — password
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // ─── Resend countdown (only runs on step 2) ───
  useEffect(() => {
    if (step !== 'verify' || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === OTP_LENGTH;

  // ─── Step 1: Send code ───
  const handleSendCode = async () => {
    const value = identifier.trim();

    if (!value) {
      setIdentifierError('Enter your email or phone number.');
      return;
    }
    if (!isValidEmail(value) && !isValidPhone(value)) {
      setIdentifierError('Enter a valid email or Nigerian phone number.');
      return;
    }

    setIdentifierError(null);
    setSending(true);
    try {
      // ─── MOCK: POST /auth/password/send-otp ───
      await new Promise((r) => setTimeout(r, 800));

      setStep('verify');
      setResendIn(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setIdentifierError('Could not send the code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── Step 2: Verify OTP ───
  const handleVerify = useCallback(
    async (code?: string) => {
      const value = code ?? otpString;
      if (value.length !== OTP_LENGTH) {
        setOtpError('Enter the 6-digit code.');
        return;
      }

      setVerifying(true);
      setOtpError(null);
      try {
        // ─── MOCK: POST /auth/password/verify-otp ───
        await new Promise((r) => setTimeout(r, 800));

        if (value !== MOCK_CORRECT_OTP) {
          setOtpError('That code is incorrect. Please try again.');
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
          setVerifying(false);
          return;
        }

        setStep('reset');
      } catch {
        setOtpError('Something went wrong. Please try again.');
        setVerifying(false);
      }
    },
    [otpString]
  );

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (step === 'verify' && isOtpComplete && !verifying) {
      handleVerify(otpString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtpComplete, step]);

  // ─── OTP input handlers ───
  const handleOtpChange = (text: string, index: number) => {
    if (otpError) setOtpError(null);
    const digits = text.replace(/\D/g, '');

    // Paste: distribute
    if (digits.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < OTP_LENGTH; i++) {
        if (digits[i]) next[i] = digits[i];
      }
      setOtp(next);
      const last = Math.min(digits.length, OTP_LENGTH) - 1;
      inputRefs.current[last]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = digits.slice(-1);
    setOtp(next);

    if (digits && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError(null);
    setResendIn(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    // ─── MOCK: POST /auth/password/resend-otp ───
  };

  // ─── Step 3: Reset password ───
  const handleReset = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError(null);
    setResetting(true);
    try {
      // ─── MOCK: POST /auth/password/reset ───
      await new Promise((r) => setTimeout(r, 900));
      setStep('done');
    } catch {
      setPasswordError('Could not reset password. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  // ─── Render ───

  const headerTitle =
    step === 'identify'
      ? 'Reset Password'
      : step === 'verify'
      ? 'Verify Code'
      : step === 'reset'
      ? 'New Password'
      : 'Success';

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

          <Text className="text-body font-gabarito text-ink">{headerTitle}</Text>

          <View className="w-9" />
        </View>

        <View className="flex-1 px-6">

          {/* ═══ STEP 1 — Identify ═══ */}
          {step === 'identify' ? (
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-4">
                Forgot your password?
              </Text>
              <Text className="text-body-sm font-figtree text-muted mb-8">
                Enter the email or phone number linked to your Run4Me account.
                We'll send you a code to reset your password.
              </Text>

              <Input
                label="Email or Phone"
                value={identifier}
                onChangeText={(v) => {
                  setIdentifier(v);
                  if (identifierError) setIdentifierError(null);
                }}
                placeholder="e.g. tobi@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={identifierError ?? undefined}
                editable={!sending}
              />

              <View className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  loading={sending}
                  disabled={!identifier.trim() || sending}
                  onPress={handleSendCode}
                >
                  Send code
                </Button>
              </View>

              <TouchableOpacity
                onPress={() => router.back()}
                className="items-center py-3 mt-4"
                activeOpacity={0.7}
              >
                <Text className="text-body-sm font-figtree text-muted">
                  Remembered it?{' '}
                  <Text className="font-figtree-bold text-primary">
                    Back to sign in
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ═══ STEP 2 — Verify OTP ═══ */}
          {step === 'verify' ? (
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-4">
                Enter the 6-digit code
              </Text>
              <Text className="text-body-sm font-figtree text-muted mb-8">
                We sent a code to{' '}
                <Text className="font-figtree-bold text-ink">
                  {maskIdentifier(identifier)}
                </Text>
                .
              </Text>

              {/* OTP row */}
              <View className="flex-row justify-between mb-5 gap-1.5">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    className={`
                      flex-1 h-14 border rounded-2xl text-center
                      text-title font-gabarito text-ink
                      ${otpError
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
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    editable={!verifying}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                ))}
              </View>

              {/* Error */}
              {otpError ? (
                <View className="bg-status-errorLight border border-status-error/30 rounded-2xl px-4 py-3 flex-row items-start mb-5">
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={colors.danger}
                    style={{ marginTop: 1, marginRight: 10 }}
                  />
                  <Text className="flex-1 text-body-xs font-figtree text-status-error">
                    {otpError}
                  </Text>
                </View>
              ) : null}

              <Button
                variant="primary"
                fullWidth
                loading={verifying}
                disabled={!isOtpComplete || verifying}
                onPress={() => handleVerify()}
              >
                Verify code
              </Button>

              {/* Resend */}
              <View className="flex-row items-center justify-between mt-6">
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
                    className={`
                      text-body-xs font-figtree-bold
                      ${resendIn > 0 ? 'text-text-light' : 'text-primary'}
                    `}
                  >
                    Resend code
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setStep('identify')}
                className="items-center py-3 mt-2"
                activeOpacity={0.7}
              >
                <Text className="text-body-xs font-figtree-bold text-primary">
                  Change {identifier.includes('@') ? 'email' : 'number'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ═══ STEP 3 — New password ═══ */}
          {step === 'reset' ? (
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-4">
                Create a new password
              </Text>
              <Text className="text-body-sm font-figtree text-muted mb-8">
                Choose a password you haven't used before. Must be at least{' '}
                {MIN_PASSWORD_LENGTH} characters.
              </Text>

              {/* New password */}
              <View className="mb-5">
                <Input
                  label="New Password"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword((s) => !s)}
                      hitSlop={8}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {/* Confirm */}
              <View className="mb-5">
                <Input
                  label="Confirm Password"
                  value={confirm}
                  onChangeText={(v) => {
                    setConfirm(v);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Re-enter new password"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowConfirm((s) => !s)}
                      hitSlop={8}
                    >
                      <Feather
                        name={showConfirm ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {/* Error */}
              {passwordError ? (
                <View className="bg-status-errorLight border border-status-error/30 rounded-2xl px-4 py-3 flex-row items-start mb-4">
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={colors.danger}
                    style={{ marginTop: 1, marginRight: 10 }}
                  />
                  <Text className="flex-1 text-body-xs font-figtree text-status-error">
                    {passwordError}
                  </Text>
                </View>
              ) : null}

              <Button
                variant="primary"
                fullWidth
                loading={resetting}
                disabled={
                  password.length < MIN_PASSWORD_LENGTH ||
                  confirm.length < MIN_PASSWORD_LENGTH ||
                  resetting
                }
                onPress={handleReset}
              >
                Reset password
              </Button>
            </View>
          ) : null}

          {/* ═══ STEP 4 — Success ═══ */}
          {step === 'done' ? (
            <View className="flex-1 justify-center items-center">
              <View className="w-20 h-20 rounded-full bg-status-successLight items-center justify-center mb-6">
                <Feather name="check" size={36} color={colors.success} />
              </View>

              <Text className="text-heading-sm font-gabarito text-ink text-center mb-2">
                Password reset!
              </Text>
              <Text className="text-body-sm font-figtree text-muted text-center mb-10 px-4">
                Your password has been changed successfully. You can now sign
                in with your new password.
              </Text>

              <Button
                variant="primary"
                fullWidth
                onPress={() => router.replace('/sign-in')}
              >
                Back to sign in
              </Button>
            </View>
          ) : null}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}