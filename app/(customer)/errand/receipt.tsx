import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { Errand, ErrandItem } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Receipt & Billing — wired to the errands API
//
// Shows the runner's uploaded receipt, the itemised list, and
// how it compares against the customer's approved budget.
//
// Data flow — TWO parallel fetches:
//   1. api.errands.getErrand(errandId)   → budget, runner, completedAt
//   2. api.errands.getReceipt(errandId)  → imageUrl, items, total
//
// Why two: the receipt endpoint gives us what the runner bought.
// The errand endpoint gives us the approved budget + runner info
// so we can compute the refund. Fetching both in parallel is a
// single round-trip worth of latency.
//
// Units:
//   All amounts from the API are in KOBO. formatNaira divides
//   by 100 for display.
//
// Fallback image:
//   The mock returns imageUrl: '' — we fall back to the local
//   placeholder so the screen looks complete during development.
//   When the backend ships a real receipt photo URL, the <Image>
//   will load from the network instead.
// ─────────────────────────────────────────────────────────────

// Fallback receipt image while the backend doesn't return a URL.
const FALLBACK_RECEIPT_IMAGE = require('@/assets/receipt-photo.png');

/** Display a kobo amount as naira: 2000000 → "₦20,000". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

/**
 * Format a time for the "uploaded at ..." line.
 *   10:14 AM
 */
const formatUploadTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function ReceiptBilling() {
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

  // ─── Data state ───
  const [errand, setErrand] = useState<Errand | null>(null);
  const [receipt, setReceipt] = useState<{
    imageUrl: string;
    total: number;
    items: ErrandItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch both endpoints in parallel ───
  const fetchReceipt = useCallback(
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
        // Promise.all — both requests hit in parallel. Total time
        // is max(t1, t2), not t1 + t2.
        const [errandRes, receiptRes] = await Promise.all([
          api.errands.getErrand(errandId),
          api.errands.getReceipt(errandId),
        ]);
        setErrand(errandRes);
        setReceipt(receiptRes);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Could not load your receipt. Pull down to try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [errandId]
  );

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  // ─── Derived values ───
  const runnerName = errand?.runner?.name ?? params.runnerName ?? 'Runner';
  const uploadedAt = errand?.completedAt
    ? formatUploadTime(errand.completedAt)
    : '';

  // Approved budget = what the customer authorized.
  const approvedBudget = errand?.budget ?? 0;

  // Actual spent = what the receipt total says (sum of item prices).
  const actualSpent = receipt?.total ?? 0;

  // Refund = whatever wasn't spent. Never negative — if the
  // runner overspent, that's a different flow (customer pays
  // the difference) which we don't handle here.
  const refund = Math.max(0, approvedBudget - actualSpent);

  const items = receipt?.items ?? [];

  // ─── Continue ───
  const handleContinue = () => {
    router.replace({
      pathname: '/(customer)/errand/confirm-delivery',
      params: { ...params, errandId },
    });
  };

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
          Receipt &amp; Billing
        </Text>

        <View className="w-9" />
      </View>

      {/* ═══ Loading — skeleton ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Receipt image skeleton */}
            <Skeleton width="100%" height={180} radius={16} className="mb-3" />

            {/* Uploaded info skeleton */}
            <View className="items-center mb-6">
              <Skeleton width={220} height={12} />
            </View>

            {/* Card skeleton */}
            <View className="border border-border rounded-2xl p-4 mb-5">
              <Skeleton width="40%" height={12} className="mb-4" />

              <View className="gap-3 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="flex-row items-center justify-between"
                  >
                    <Skeleton width="60%" height={12} />
                    <Skeleton width={70} height={12} />
                  </View>
                ))}
              </View>

              <View className="h-[1px] bg-border mb-3" />

              <View className="gap-2 mb-4">
                <View className="flex-row justify-between">
                  <Skeleton width={140} height={12} />
                  <Skeleton width={70} height={12} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={120} height={12} />
                  <Skeleton width={70} height={12} />
                </View>
              </View>

              <Skeleton width="100%" height={44} radius={12} />
            </View>
          </View>
        </ScrollView>
      ) : null}

      {/* ═══ Error ═══ */}
      {!loading && error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReceipt(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Couldn't load receipt"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchReceipt()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && !error && receipt && errand ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchReceipt(true)}
                tintColor={colors.primary}
              />
            }
          >
            <View className="px-6">
              {/* ─── Receipt image ─── */}
              <View
                className="w-full rounded-2xl overflow-hidden bg-background-dark mb-3"
                style={{ height: 180 }}
              >
                {receipt.imageUrl ? (
                  <Image
                    source={{ uri: receipt.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={FALLBACK_RECEIPT_IMAGE}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* ─── Uploaded info ─── */}
              <View className="flex-row items-center justify-center gap-1.5 mb-6">
                <Feather name="file-text" size={12} color={colors.subtle} />
                <Text className="text-caption-sm font-figtree text-muted">
                  {runnerName} uploaded receipt
                  {uploadedAt ? ` at ${uploadedAt}` : ''}
                </Text>
              </View>

              {/* ─── Purchased items card ─── */}
              <View className="border border-border rounded-2xl p-4 bg-surface mb-5">
                <Text className="text-micro font-figtree-bold text-ink uppercase tracking-wider mb-4">
                  PURCHASED ITEMS
                </Text>

                {/* Item rows */}
                {items.length === 0 ? (
                  <Text className="text-body-xs font-figtree text-muted mb-4">
                    No items recorded.
                  </Text>
                ) : (
                  <View className="gap-3 mb-4">
                    {items.map((item) => (
                      <View
                        key={item.id}
                        className="flex-row items-center justify-between"
                      >
                        <Text
                          className="flex-1 text-body-xs font-figtree text-muted pr-3"
                          numberOfLines={1}
                        >
                          {item.name}
                          {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                        </Text>
                        <Text className="text-body-xs font-figtree-bold text-ink">
                          {formatNaira(item.price ?? 0)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="h-[1px] bg-border mb-3" />

                {/* ─── Budget comparison ─── */}
                <View className="gap-2 mb-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-body-xs font-figtree text-muted">
                      Approved Shopping Budget
                    </Text>
                    <Text className="text-body-xs font-figtree text-ink">
                      {formatNaira(approvedBudget)}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-body-xs font-figtree-bold text-ink">
                      Actual Amount Spent
                    </Text>
                    <Text className="text-body-xs font-figtree-bold text-ink">
                      {formatNaira(actualSpent)}
                    </Text>
                  </View>
                </View>

                {/* ─── Refund highlight box ─── */}
                <View className="rounded-xl px-4 py-3 flex-row items-center justify-between bg-status-successLight">
                  <View className="flex-row items-center gap-2">
                    <View className="w-5 h-5 rounded-full bg-status-success items-center justify-center">
                      <Feather name="check" size={11} color={colors.white} />
                    </View>
                    <Text className="text-body-xs font-figtree-bold text-status-successDark">
                      Refund to Wallet
                    </Text>
                  </View>

                  <Text className="text-body-sm font-gabarito text-status-successDark">
                    {formatNaira(refund)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ─── Bottom CTA ─── */}
          <View className="px-6 pb-6 pt-3">
            <Button variant="primary" fullWidth onPress={handleContinue}>
              Continue
            </Button>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}