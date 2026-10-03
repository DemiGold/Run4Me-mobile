import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Card Payment — wired to the payments API
//
// Collects card details, sends them to api.payments.payWithCard,
// and routes to card-otp with the returned paymentId.
//
// Units:
//   `amount` arrives from checkout ALREADY in KOBO. Never
//   multiply here. `formatNaira(kobo)` divides by 100 for display.
//
// Flow:
//   1. Validate card fields locally (16 digits, valid MM/YY,
//      3–4 digit CVV, non-empty name). We catch the obvious
//      errors before hitting the network.
//   2. Call api.payments.payWithCard(errandId, amountKobo, card).
//   3. On success, the API returns:
//        { paymentId, otpRequired: true }
//      We route to card-otp with amount + paymentId + cardLast4
//      so the OTP screen knows what to verify against.
//   4. On failure, show the error inline. Card details stay
//      filled so the user can retry without re-typing.
//
// Amount to card-otp is still kobo. Same convention all the way
// through to errand-confirmed.
// ─────────────────────────────────────────────────────────────

/** Display a kobo amount as naira: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

// ═══════════════════════════════════════════════════════════════
// INPUT FORMATTERS
// Each one is idempotent — running it twice on the same value
// produces the same output, which is important because the input
// fires on every keystroke.
// ═══════════════════════════════════════════════════════════════

/** "4242424242424242" → "4242 4242 4242 4242". Caps at 16 digits. */
const formatCardNumber = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(.{4})/g, '$1 ').trim();
};

/** "0828" → "08 / 28". Caps at MMYY (4 digits). */
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
};

/** Digits only, up to 4 (Amex uses 4). */
const formatCVV = (v: string) => v.replace(/\D/g, '').slice(0, 4);

/** Uppercase letters + spaces only. */
const formatName = (v: string) =>
  v.replace(/[^A-Za-z ]/g, '').toUpperCase();

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Return the last 4 digits of a card number, or '' if the
 * number doesn't have enough digits yet.
 */
const getCardLast4 = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
};

/**
 * Check if the expiry string represents a date in the future.
 * Accepts "MM / YY" or "MMYY". Returns false if the month is
 * out of range or the year is in the past.
 */
const isExpiryValid = (expiry: string): boolean => {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length !== 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));

  if (month < 1 || month > 12) return false;

  // Compare against the current year/month.
  const now = new Date();
  const expiryDate = new Date(year, month); // first day of month AFTER expiry
  return expiryDate > now;
};

export default function CardPayment() {
  // ─── Route params — full wizard chain ───
  const params = useLocalSearchParams<{
    amount?: string;          // KOBO string from checkout
    errandId?: string;
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
    runnerName?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  // amount is kobo, straight from checkout. No conversion here.
  const amountKobo = params.amount ? parseInt(params.amount, 10) : 2_000_000;
  const errandId = params.errandId ?? '';

  // ─── Form state ───
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // ─── Submission state ───
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Live validation ───
  // `canPay` gates the CTA. Uses `useMemo` so we only recompute
  // when the fields actually change.
  const { canPay, validationHint } = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) {
      return { canPay: false, validationHint: 'Enter a 16-digit card number' };
    }
    if (!isExpiryValid(expiry)) {
      return { canPay: false, validationHint: 'Check your expiry date' };
    }
    if (cvv.length < 3) {
      return { canPay: false, validationHint: 'Enter your CVV' };
    }
    if (!nameOnCard.trim()) {
      return { canPay: false, validationHint: 'Enter the name on card' };
    }
    return { canPay: true, validationHint: null };
  }, [cardNumber, expiry, cvv, nameOnCard]);

  // ─── Pay ───
  const handlePay = async () => {
    if (!canPay) return;
    if (!errandId) {
      setError('Missing errand reference. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ask the backend to create the payment. It responds with
      // a paymentId and (usually) `otpRequired: true`. The actual
      // charge happens on OTP verification.
      const result = await api.payments.payWithCard(errandId, amountKobo, {
        number: cardNumber.replace(/\s/g, ''),
        expiry: expiry.replace(/\s/g, ''),
        cvv,
        nameOnCard: nameOnCard.trim(),
        saveCard,
      });

      // Extract the last 4 digits locally so the OTP screen can
      // show "card ending 4910".
      const cardLast4 = getCardLast4(cardNumber) || '0000';

      // Route to OTP. If the backend ever returns otpRequired:false
      // (some banks skip step-up), route straight to confirmed.
      if (!result.otpRequired) {
        router.replace({
          pathname: '/(customer)/errand/errand-confirmed',
          params: {
            ...params,
            amount: String(amountKobo),
            paymentMethod: 'card',
            paymentId: result.paymentId,
          },
        });
        return;
      }

      router.push({
        pathname: '/(customer)/errand/payment/card-otp',
        params: {
          ...params,
          amount: String(amountKobo),   // kobo
          paymentId: result.paymentId,
          cardLast4,
          paymentMethod: 'card',
        },
      });
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Could not process card. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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

          <Text className="text-body font-gabarito text-ink">Card payment</Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-5">

            {/* ─── Total to Pay ─── */}
            <View className="border border-border rounded-2xl p-4 gap-1.5">
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                TOTAL TO PAY
              </Text>
              <Text className="text-heading-sm font-gabarito text-primary">
                {formatNaira(amountKobo)}
              </Text>
              <Text className="text-caption font-figtree text-muted">
                Pay securely with your debit card
              </Text>
            </View>

            {/* ─── Error banner ─── */}
            {error ? (
              <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
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

            {/* ─── Card number ─── */}
            <Input
              label="CARD NUMBER"
              uppercaseLabel
              value={cardNumber}
              onChangeText={(v) => {
                setCardNumber(formatCardNumber(v));
                if (error) setError(null);
              }}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              autoComplete="cc-number"
              editable={!loading}
            />

            {/* ─── Expiry + CVV ─── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="EXP DATE"
                  uppercaseLabel
                  value={expiry}
                  onChangeText={(v) => {
                    setExpiry(formatExpiry(v));
                    if (error) setError(null);
                  }}
                  placeholder="MM / YY"
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="CVV"
                  uppercaseLabel
                  value={cvv}
                  onChangeText={(v) => {
                    setCvv(formatCVV(v));
                    if (error) setError(null);
                  }}
                  placeholder="•••"
                  keyboardType="number-pad"
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            {/* ─── Name on card ─── */}
            <Input
              label="NAME ON CARD"
              uppercaseLabel
              value={nameOnCard}
              onChangeText={(v) => {
                setNameOnCard(formatName(v));
                if (error) setError(null);
              }}
              placeholder="CHIOMA NWACHUKWU"
              autoCapitalize="characters"
              editable={!loading}
            />

            {/* ─── Save card toggle ─── */}
            <View className="flex-row items-center gap-3">
              <Toggle value={saveCard} onChange={setSaveCard} />
              <Text className="text-body-sm font-figtree text-ink">
                Save card for future payments
              </Text>
            </View>

            {/* ─── Validation hint (shows when button is disabled) ─── */}
            {!canPay && validationHint && !error ? (
              <Text className="text-caption font-figtree text-text-light">
                {validationHint}
              </Text>
            ) : null}

          </View>
        </ScrollView>

        {/* ─── Pay button ─── */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!canPay}
            onPress={handlePay}
          >
            Pay {formatNaira(amountKobo)}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}