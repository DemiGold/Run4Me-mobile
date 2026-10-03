import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Confirm Delivery — wired to the errands API
//
// Shows the 4-digit code the customer reads to the runner.
// Tapping the code copies it (customers often paste it into the
// chat when they're not face-to-face).
//
// Data flow:
//   1. On mount, fetch the code via
//      api.errands.getDeliveryCode(errandId).
//   2. Render the digits, hook up copy-to-clipboard.
//   3. On Continue, call api.errands.confirmDelivery(errandId, code)
//      — this marks the errand `completed` on the backend.
//   4. Route to rate-runner with the full param chain.
//
// Why we call confirmDelivery on Continue:
//   In production the runner would enter the code on their own
//   device, and the customer's app would see the status flip via
//   polling. For the mock, we let the customer trigger it directly
//   so the whole flow is demoable end-to-end.
//
// Edge cases handled:
//   - Code fetch fails → error screen with retry
//   - User taps Continue before code loads → button disabled
//   - Copy feedback reverts after 1.8s
// ─────────────────────────────────────────────────────────────

export default function ConfirmDelivery() {
  const params = useLocalSearchParams<{
    errandId?: string;
    id?: string;              // legacy alias
    pickup?: string;
    dropoff?: string;
    runnerName?: string;
    // Wizard pass-through
    amount?: string;
    paymentMethod?: string;
    paymentId?: string;
    type?: string;
    promo?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    runnerId?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
  }>();

  // Prefer `errandId`, fall back to legacy `id`.
  const errandId = params.errandId || params.id || '';
  const runnerName = params.runnerName ?? 'your Runner';

  // ─── Data state ───
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Interaction state ───
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // ─── Fetch the code ───
  const fetchCode = useCallback(
    async (isRefresh = false) => {
      if (!errandId) {
        setError('Missing errand reference. Please go back and try again.');
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      try {
        const res = await api.errands.getDeliveryCode(errandId);
        setCode(res.code);
      } catch {
        setError('Could not load the delivery code. Pull down to try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [errandId]
  );

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  // ─── Copy to clipboard ───
  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ─── Confirm delivery ───
  // Marks the errand complete on the backend, then routes to the
  // rating screen.
  const handleContinue = async () => {
    if (!code || confirming) return;

    setConfirming(true);
    try {
      await api.errands.confirmDelivery(errandId, code);

      router.replace({
        pathname: '/(customer)/errand/rate-runner',
        params: { ...params, errandId },
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not confirm delivery. Please try again.'
      );
      setConfirming(false);
    }
  };

  // Split the code into digits for display.
  const codeDigits = code ? code.split('') : [];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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

      {/* ═══ Loading — skeleton code boxes ═══ */}
      {loading ? (
        <View className="flex-1 px-6 items-center justify-center pb-20">
          {/* Icon skeleton */}
          <Skeleton width={80} height={80} radius={40} className="mb-6" />

          {/* Title skeletons */}
          <Skeleton width="70%" height={20} className="mb-3" />
          <Skeleton width="85%" height={12} className="mb-8" />

          {/* Code box skeletons */}
          <View className="flex-row justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width={64} height={72} radius={16} />
            ))}
          </View>

          <Skeleton width={140} height={12} />
        </View>
      ) : null}

      {/* ═══ Error ═══ */}
      {!loading && error && !code ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCode(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Couldn't load the code"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchCode()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && code ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchCode(true)}
                tintColor={colors.primary}
              />
            }
          >
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
                {codeDigits.map((digit, index) => (
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

            {/* Inline error — shown if confirmDelivery fails */}
            {error ? (
              <View className="w-full mt-4 bg-status-errorLight rounded-2xl px-4 py-3 flex-row items-start gap-2.5">
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
          </ScrollView>

          {/* Bottom CTA */}
          <View className="px-6 pb-6 pt-3">
            <Button
              variant="primary"
              fullWidth
              loading={confirming}
              onPress={handleContinue}
            >
              Continue
            </Button>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}