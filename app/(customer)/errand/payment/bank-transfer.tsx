import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { api } from '@/services/api';
import type { BankDetails, Payment } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Bank Transfer — wired to the payments API
//
// Shows the virtual account the customer must transfer to.
// The account is generated per-errand by the backend and expires
// after ~30 minutes.
//
// Data flow:
//   1. On mount, call api.payments.initiateBankTransfer(errandId, amount).
//      Returns { payment, bankDetails } — the real bank account
//      details and a paymentId we'll reference later.
//   2. Countdown uses `bankDetails.expiresAt` (real expiry from
//      the backend), not a fixed 30-min-from-load timer. If the
//      customer backgrounds the app and comes back, the countdown
//      is still accurate.
//   3. "I've made the transfer" routes to the confirmation screen
//      with the paymentId attached so it can poll status.
//
// Failure modes handled:
//   - initiateBankTransfer fails → full-screen error with retry
//   - account expired → banner turns red, CTA disabled
//   - copy to clipboard → success feedback via icon swap
// ─────────────────────────────────────────────────────────────

const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

export default function BankTransfer() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
    // Wizard params pass through
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

  // amount comes in kobo (integer). Default if missing.
  const amount = params.amount ? parseInt(params.amount, 10) : 1_750_000;
  const errandId = params.errandId ?? '';

  // ─── Data state ───
  const [payment, setPayment] = useState<Payment | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Countdown state ───
  // secondsLeft drives the display; `expired` is a separate derived
  // flag so we don't flip the CTA in the middle of a render pass.
  const [secondsLeft, setSecondsLeft] = useState(0);

  // ─── Copy feedback ───
  const [copied, setCopied] = useState(false);

  // ─── Initiate the transfer ───
  const initiate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.payments.initiateBankTransfer(errandId, amount);
      setPayment(res.payment);
      setBankDetails(res.bankDetails);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not set up bank transfer. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [errandId, amount]);

  useEffect(() => {
    initiate();
  }, [initiate]);

  // ─── Countdown timer ───
  // Recomputed from the backend's expiresAt on every tick, so
  // backgrounding / foregrounding doesn't drift the timer.
  useEffect(() => {
    if (!bankDetails) return;

    const tick = () => {
      const expires = new Date(bankDetails.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setSecondsLeft(remaining);
    };

    // Immediate tick so we don't wait 1s for the first render
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [bankDetails]);

  const expired = secondsLeft === 0 && bankDetails !== null;

  // Format as MM:SS
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // ─── Copy account number ───
  const handleCopy = async () => {
    if (!bankDetails) return;
    await Clipboard.setStringAsync(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ─── Confirm — routes forward to the polling screen ───
  const handleConfirm = () => {
    if (!payment || expired) return;

    router.replace({
      pathname: '/(customer)/errand/payment/bank-payment-confirmation',
      params: {
        ...params,
        amount: String(amount),
        paymentId: payment.id,
        paymentMethod: 'bank',
      },
    });
  };

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

        <Text className="text-body font-gabarito text-ink">Bank transfer</Text>

        <View className="w-9" />
      </View>

      {/* ═══ Loading — skeleton cards ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-4">
            {/* Total to pay */}
            <View className="border border-border rounded-2xl p-4">
              <Skeleton width="40%" height={10} className="mb-3" />
              <Skeleton width="60%" height={26} className="mb-2" />
              <Skeleton width="80%" height={11} />
            </View>

            {/* Bank details */}
            <View className="border border-border rounded-2xl p-4 gap-4">
              <View className="gap-2">
                <Skeleton width="25%" height={10} />
                <Skeleton width="50%" height={14} />
              </View>
              <View className="gap-2">
                <Skeleton width="40%" height={10} />
                <Skeleton width="70%" height={14} />
              </View>
              <View className="gap-2">
                <Skeleton width="35%" height={10} />
                <Skeleton width="60%" height={14} />
              </View>
            </View>

            {/* Expiry banner */}
            <Skeleton width="100%" height={44} radius={16} />
          </View>
        </ScrollView>
      ) : null}

      {/* ═══ Error ═══ */}
      {!loading && error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <EmptyState
            icon="alert-circle"
            title="Couldn't set up transfer"
            body={error}
            actionLabel="Retry"
            onAction={initiate}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && !error && bankDetails ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-4">

            {/* ─── Total to pay card ─── */}
            <View className="border border-border rounded-2xl p-4 gap-1.5">
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                TOTAL TO PAY
              </Text>
              <Text className="text-heading-sm font-gabarito text-primary">
                {formatNaira(amount)}
              </Text>
              <Text className="text-caption font-figtree text-muted">
                Transfer the exact amount below
              </Text>
            </View>

            {/* ─── Bank details card ─── */}
            <View className="border border-border rounded-2xl p-4 gap-4">
              {/* Bank */}
              <View className="gap-1">
                <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                  BANK
                </Text>
                <Text className="text-body-sm font-figtree-bold text-ink">
                  {bankDetails.bank}
                </Text>
              </View>

              {/* Account number — tap to copy */}
              <TouchableOpacity
                onPress={handleCopy}
                activeOpacity={0.7}
                className="gap-1"
              >
                <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                  ACCOUNT NUMBER
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-body-sm font-figtree-bold text-ink tracking-wider">
                    {bankDetails.accountNumber}
                  </Text>
                  <Feather
                    name={copied ? 'check' : 'copy'}
                    size={14}
                    color={copied ? colors.success : colors.primary}
                  />
                </View>
              </TouchableOpacity>

              {/* Account name */}
              <View className="gap-1">
                <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                  ACCOUNT NAME
                </Text>
                <Text className="text-body-sm font-figtree-bold text-ink">
                  {bankDetails.accountName}
                </Text>
              </View>
            </View>

            {/* ─── Expiry banner ─── */}
            <View
              className={`
                rounded-2xl px-4 py-3.5
                ${expired ? 'bg-status-errorLight' : 'bg-accent-light'}
              `}
            >
              <Text
                className={`
                  text-caption font-figtree
                  ${expired ? 'text-status-error' : 'text-muted'}
                `}
              >
                {expired
                  ? 'This account has expired. Please go back and start again.'
                  : `This account expires in ${mm}:${ss}`}
              </Text>
            </View>

          </View>
        </ScrollView>
      ) : null}

      {/* ─── CTA ─── */}
      {!loading && !error && bankDetails ? (
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            disabled={expired}
            onPress={handleConfirm}
          >
            I've made the transfer
          </Button>
        </View>
      ) : null}
    </SafeAreaView>
  );
}