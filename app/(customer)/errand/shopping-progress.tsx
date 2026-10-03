import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
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
// Shopping Progress — wired to the errands API
//
// Live shopping checklist while the runner is at the store.
// Shows found/out-of-stock/pending items + a substitution card
// when an item needs a customer decision.
//
// Data flow:
//   1. Parallel fetch: api.errands.getErrand(errandId) for the
//      pickup address (used as the title), and
//      api.errands.listItems(errandId) for the checklist.
//   2. The substitution card renders for the FIRST item with
//      status 'out_of_stock' that has a `suggestedSubstitute`.
//      If there are multiple, we handle them one at a time.
//   3. Approve → api.errands.approveSubstitution(...) → route to receipt
//   4. Skip    → api.errands.rejectSubstitution(...)   → route to receipt
//   5. Choose Another → stub (opens a product search in a future pass)
//
// Units:
//   Item prices are in KOBO (integer). formatNaira divides by 100.
//
// Backend status → display status:
//   'found' | 'substituted' → done       (green check)
//   'out_of_stock'          → unavailable (red X)
//   'pending'               → pending    (gray dot)
// ─────────────────────────────────────────────────────────────

/** Display a kobo amount as naira: 210000 → "₦2,100". */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

/** Collapse the backend status to the three we render. */
type DisplayStatus = 'done' | 'unavailable' | 'pending';

const displayStatus = (s: ErrandItem['status']): DisplayStatus => {
  if (s === 'found' || s === 'substituted') return 'done';
  if (s === 'out_of_stock') return 'unavailable';
  return 'pending';
};

// ─── Status → circle styling ───
const STATUS_STYLES: Record<DisplayStatus, string> = {
  done:        'bg-status-successLight',
  unavailable: 'bg-status-errorLight',
  pending:     'bg-background-dark',
};

export default function ShoppingProgress() {
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
  const [items, setItems] = useState<ErrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Action state ───
  // Which item is currently being mutated (approve/skip).
  // Dims the substitution card + prevents double-taps.
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  // ─── Derived ───
  const runnerName = errand?.runner?.name ?? params.runnerName ?? 'Your Runner';

  // Title = "Lekki Spar Checklist" style, derived from the pickup
  // address. We take the first comma-separated segment so long
  // addresses get truncated naturally.
  const pickupShort =
    errand?.pickup?.address?.split(',')[0]?.trim() ??
    params.pickup?.split(',')[0]?.trim() ??
    'Shopping';
  const title = `${pickupShort} Checklist`;

  // Progress counter: how many items have been resolved
  // (found or substituted).
  const resolvedCount = items.filter(
    (i) => i.status === 'found' || i.status === 'substituted'
  ).length;
  const totalCount = items.length;

  // The item that needs a substitution decision right now. We pick
  // the first out_of_stock item with a suggestion, so if there are
  // multiple, they get handled sequentially.
  const pendingSubstitution = items.find(
    (i) => i.status === 'out_of_stock' && i.suggestedSubstitute
  );

  // ─── Fetch ───
  const fetchData = useCallback(
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
        const [errandRes, itemsRes] = await Promise.all([
          api.errands.getErrand(errandId),
          api.errands.listItems(errandId),
        ]);
        setErrand(errandRes);
        setItems(itemsRes);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Could not load your shopping list. Pull down to try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [errandId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Approve substitution ───
  const handleApprove = async () => {
    if (!pendingSubstitution || !pendingSubstitution.suggestedSubstitute) return;
    if (busyItemId) return;

    setBusyItemId(pendingSubstitution.id);
    try {
      // Server records the customer's choice and updates the item
      // status to 'substituted'.
      await api.errands.approveSubstitution(
        errandId,
        pendingSubstitution.id,
        {
          name: pendingSubstitution.suggestedSubstitute.name,
          price: pendingSubstitution.suggestedSubstitute.price,
        }
      );

      // Move forward to the receipt.
      router.replace({
        pathname: '/(customer)/errand/receipt',
        params: { ...params, errandId },
      });
    } catch (e) {
      Alert.alert(
        'Could not approve',
        e instanceof Error
          ? e.message
          : 'Please try again.'
      );
      setBusyItemId(null);
    }
  };

  // ─── Skip item (reject substitution) ───
  const handleSkip = async () => {
    if (!pendingSubstitution) return;
    if (busyItemId) return;

    setBusyItemId(pendingSubstitution.id);
    try {
      // Server marks the item 'out_of_stock' permanently — no
      // substitute, runner moves on.
      await api.errands.rejectSubstitution(errandId, pendingSubstitution.id);

      router.replace({
        pathname: '/(customer)/errand/receipt',
        params: { ...params, errandId },
      });
    } catch (e) {
      Alert.alert(
        'Could not skip',
        e instanceof Error
          ? e.message
          : 'Please try again.'
      );
      setBusyItemId(null);
    }
  };

  // ─── Choose another (stub) ───
  const handleChooseAnother = () => {
    Alert.alert(
      'Choose Another',
      'Browsing the product catalogue is coming soon. For now, approve the suggested substitute or skip the item.'
    );
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
          Shopping Progress
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
            {/* Title row skeleton */}
            <View className="flex-row items-center justify-between mb-4 mt-1">
              <Skeleton width="60%" height={20} />
              <Skeleton width={70} height={14} />
            </View>

            {/* Checklist skeleton */}
            <View className="border border-border rounded-2xl p-4 mb-5">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3 py-3"
                >
                  <Skeleton width={24} height={24} radius={12} />
                  <Skeleton width="60%" height={14} />
                  <View className="flex-1" />
                  <Skeleton width={60} height={12} />
                </View>
              ))}
            </View>

            {/* Substitution card skeleton */}
            <View className="border-2 border-border rounded-2xl p-4">
              <Skeleton width="60%" height={14} className="mb-3" />
              <Skeleton width="90%" height={12} className="mb-4" />
              <View className="flex-row items-center gap-3 mb-5">
                <Skeleton width={56} height={56} radius={12} />
                <View className="flex-1 gap-2">
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
              <Skeleton width="100%" height={48} radius={16} className="mb-3" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Skeleton width="100%" height={40} radius={14} />
                </View>
                <View className="flex-1">
                  <Skeleton width="100%" height={40} radius={14} />
                </View>
              </View>
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
              onRefresh={() => fetchData(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Couldn't load shopping list"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchData()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && !error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              tintColor={colors.primary}
            />
          }
        >
          <View className="px-6">
            {/* ─── Title row ─── */}
            <View className="flex-row items-center justify-between mb-4 mt-1">
              <Text className="text-title font-gabarito text-ink flex-1 pr-3" numberOfLines={1}>
                {title}
              </Text>
              <Text className="text-body-xs font-figtree-bold text-primary">
                {resolvedCount} of {totalCount} Items
              </Text>
            </View>

            {/* ─── Checklist card ─── */}
            {items.length === 0 ? (
              <View className="border border-border rounded-2xl p-4 mb-5">
                <Text className="text-body-xs font-figtree text-muted text-center py-4">
                  No items yet.
                </Text>
              </View>
            ) : (
              <View className="border border-border rounded-2xl p-4 bg-surface mb-5">
                {items.map((item, index) => {
                  const status = displayStatus(item.status);
                  const isLast = index === items.length - 1;

                  return (
                    <View
                      key={item.id}
                      className={`
                        flex-row items-center gap-3 py-3
                        ${!isLast ? 'border-b border-border' : ''}
                      `}
                    >
                      {/* Status circle */}
                      <View
                        className={`
                          w-6 h-6 rounded-full items-center justify-center
                          ${STATUS_STYLES[status]}
                        `}
                      >
                        {status === 'done' ? (
                          <Feather name="check" size={13} color={colors.success} />
                        ) : status === 'unavailable' ? (
                          <Feather name="x" size={13} color={colors.danger} />
                        ) : (
                          <View className="w-2 h-2 rounded-full bg-text-light" />
                        )}
                      </View>

                      {/* Item name + qty */}
                      <Text
                        className="flex-1 text-body-sm font-figtree text-ink"
                        numberOfLines={1}
                      >
                        {item.name}
                        {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                      </Text>

                      {/* Price / status */}
                      <Text
                        className={`
                          text-body-xs font-figtree
                          ${
                            status === 'done'
                              ? 'text-ink'
                              : status === 'unavailable'
                              ? 'text-status-error'
                              : 'text-text-light'
                          }
                        `}
                      >
                        {item.price != null
                          ? formatNaira(item.price)
                          : status === 'unavailable'
                          ? 'Unavailable'
                          : 'Pending'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ─── Substitution card ─── */}
            {pendingSubstitution && pendingSubstitution.suggestedSubstitute ? (
              <View className="border-2 border-accent rounded-2xl p-4 bg-surface">
                {/* Title row */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="alert-circle" size={16} color={colors.accent} />
                  <Text className="text-body-sm font-gabarito-bold text-ink">
                    Your item is unavailable.
                  </Text>
                </View>

                {/* Description */}
                <Text className="text-caption font-figtree text-muted mb-4">
                  {pendingSubstitution.name} is out of stock. {runnerName}{' '}
                  suggests this alternative:
                </Text>

                {/* Suggested product row */}
                <View className="flex-row items-center gap-3 mb-5">
                  <View className="w-14 h-14 rounded-xl bg-background-dark overflow-hidden items-center justify-center">
                    {pendingSubstitution.suggestedSubstitute.imageUrl ? (
                      <Image
                        source={{
                          uri: pendingSubstitution.suggestedSubstitute.imageUrl,
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Feather name="package" size={22} color={colors.subtle} />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-body-xs font-gabarito-bold text-ink mb-0.5">
                      {pendingSubstitution.suggestedSubstitute.name}
                    </Text>

                    {/* Price + savings (only when we have the original
                        price to compare against) */}
                    {pendingSubstitution.price != null ? (
                      <Text className="text-caption font-figtree-bold text-status-success">
                        {formatNaira(pendingSubstitution.suggestedSubstitute.price)}
                        {pendingSubstitution.price >
                        pendingSubstitution.suggestedSubstitute.price
                          ? ` (Saves ${formatNaira(
                              pendingSubstitution.price -
                                pendingSubstitution.suggestedSubstitute.price
                            )})`
                          : ''}
                      </Text>
                    ) : (
                      <Text className="text-caption font-figtree-bold text-status-success">
                        {formatNaira(pendingSubstitution.suggestedSubstitute.price)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Approve Alternative */}
                <Button
                  variant="primary"
                  fullWidth
                  loading={busyItemId === pendingSubstitution.id}
                  disabled={!!busyItemId}
                  onPress={handleApprove}
                  className="mb-3"
                >
                  Approve Alternative
                </Button>

                {/* Choose Another + Skip Item */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      disabled={!!busyItemId}
                      onPress={handleChooseAnother}
                    >
                      Choose Another
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      fullWidth
                      disabled={!!busyItemId}
                      onPress={handleSkip}
                    >
                      Skip Item
                    </Button>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}