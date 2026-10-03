import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Wallet Payment — wired to the payments API
//
// Runs after checkout when the customer chose the wallet method.
//
// Data flow:
//   1. Read `amount` (naira string) and `errandId` from params.
//   2. Fetch real wallet balance via api.wallet.getBalance().
//      The API returns kobo, so we hold balance in kobo.
//   3. Customer enters a 4-digit PIN.
//   4. On confirm:
//        api.payments.payWithWallet(errandId, amountKobo, pin)
//      which either:
//        - returns { payment, newBalance }  → route to confirmed
//        - throws ApiError('PIN_INVALID')   → show "Incorrect PIN"
//        - throws ApiError('INSUFFICIENT_FUNDS') → show balance warning
//
// Units — this is important:
//   - `params.amount` is in NAIRA (that's what checkout sends).
//   - Everything in services/types + services/mocks is in KOBO.
//   - We convert ONCE at the top: `amountKobo = amountNaira * 100`.
//   - All subsequent math and API calls use kobo.
//   - `formatNaira(kobo)` divides by 100 for display.
//
// This screen is where the conversion happens. It's a known
// inconsistency in the wizard; ideally checkout would send kobo,
// but for now the wallet screen absorbs the fix so it's correct
// regardless of what upstream sends.
// ─────────────────────────────────────────────────────────────

/** Convert a kobo amount (integer) to a display string: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

export default function WalletPayment() {
  // ─── Route params — full wizard chain ───
  const params = useLocalSearchParams<{
    amount?: string;          // naira string from checkout
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

  // ─── Units conversion — do this ONCE ───
  // params.amount is naira ("20000"). Everything downstream uses
  // kobo. Convert here so the rest of the file is unit-consistent.
  const amountNaira = params.amount ? parseInt(params.amount, 10) : 20_000;
  const amountKobo = amountNaira * 100;

  const errandId = params.errandId ?? '';

  // ─── State ───
  // Balance comes from the API and is in kobo. `null` while loading.
  const [balance, setBalance] = useState<number | null>(null);

  // Loading state for the balance fetch (shows skeleton).
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Pull-to-refresh for a stale balance.
  const [refreshing, setRefreshing] = useState(false);

  // PIN + submission
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch balance ───
  const fetchBalance = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingBalance(true);

    try {
      const res = await api.wallet.getBalance();
      setBalance(res.balance); // kobo
    } catch {
      // Silent — a failed balance fetch falls back to unknown.
      // `sufficient` below treats null as "assume OK, let the API
      // reject if funds are actually short."
      setBalance(null);
    } finally {
      setLoadingBalance(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ─── Balance sufficiency ───
  // If we don't know the balance yet, we optimistically assume
  // it's enough — the API will reject with INSUFFICIENT_FUNDS if
  // not, and we show that error. Better UX than blocking up front.
  const sufficient = balance === null || balance >= amountKobo;

  // ─── Confirm payment ───
  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError('Enter your 4-digit transaction PIN.');
      return;
    }
    if (!errandId) {
      setError('Missing errand reference. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Calls POST /payments/wallet (or mock).
      // Server checks PIN + balance + errand status atomically.
      // Returns the created Payment and the new balance.
      const result = await api.payments.payWithWallet(
        errandId,
        amountKobo,
        pin
      );

      // Update local balance display — user might catch a glimpse
      // of it before navigation.
      setBalance(result.newBalance);

      // Route forward with the full param chain. The downstream
      // screens (errand-confirmed, live-tracking, chat, etc.) all
      // need this data.
      router.replace({
        pathname: '/(customer)/errand/errand-confirmed',
        params: {
          ...params,
          amount: String(amountNaira), // keep the wizard's naira convention
          paymentMethod: 'wallet',
          paymentId: result.payment.id,
        },
      });
    } catch (e) {
      // ApiError carries a human-readable message. Common cases:
      //   - "Incorrect PIN. Please try again."
      //   - "Wallet balance is too low."
      const message =
        e instanceof Error
          ? e.message
          : 'Payment failed. Please try again.';
      setError(message);

      // Wrong PIN — clear input so the user can retype
      if (message.toLowerCase().includes('pin')) {
        setPin('');
      }
    } finally {
      setSubmitting(false);
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

          <Text className="text-body font-gabarito text-ink">
            Run4Me Wallet
          </Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBalance(true)}
              tintColor={colors.primary}
            />
          }
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

              {/* Balance line — skeleton while loading */}
              {loadingBalance ? (
                <Skeleton width={180} height={12} />
              ) : (
                <Text className="text-caption font-figtree text-muted">
                  Wallet balance:{' '}
                  {balance === null ? '—' : formatNaira(balance)}
                </Text>
              )}
            </View>

            {/* ─── Escrow info banner ─── */}
            <View className="bg-primary-light rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
              <View className="mt-0.5">
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text className="flex-1 text-body-xs font-figtree text-ink leading-5">
                {formatNaira(amountKobo)} will be held securely until your
                errand is completed.
              </Text>
            </View>

            {/* ─── Insufficient balance warning ─── */}
            {!sufficient ? (
              <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.danger}
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-body-xs font-figtree text-status-error">
                  Your wallet balance is too low. Top up or choose another
                  payment method.
                </Text>
              </View>
            ) : null}

            {/* ─── Transaction PIN ─── */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                TRANSACTION PIN
              </Text>
              <View
                className={`
                  flex-row items-center h-14 rounded-field px-4 border bg-surface
                  ${error ? 'border-status-error' : 'border-border'}
                `}
              >
                <TextInput
                  className="flex-1 text-body font-figtree text-ink tracking-[8px]"
                  value={pin}
                  onChangeText={(v) => {
                    setPin(v.replace(/\D/g, '').slice(0, 4));
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  editable={!submitting && sufficient}
                />
              </View>
              {error ? (
                <Text className="text-caption font-figtree text-status-error mt-1.5">
                  {error}
                </Text>
              ) : null}
            </View>

            {/* ─── Forgot PIN ─── */}
            <TouchableOpacity
              className="self-end"
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text className="text-body-sm font-figtree-bold text-primary">
                Forgot PIN?
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* ─── CTA ─── */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={!sufficient || pin.length !== 4}
            onPress={handleConfirm}
          >
            Confirm wallet payment
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}