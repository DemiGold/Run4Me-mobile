import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { WalletTransaction } from '@/services/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Customer Wallet — wired to the API layer
//
// Second reference implementation. Same 4-state pattern as
// Activity, but with a twist: TWO parallel fetches (balance +
// transactions) instead of one.
//
// Data flow:
//   1. On mount, fire both api.wallet.getBalance() and
//      api.wallet.listTransactions() in parallel via Promise.all.
//   2. Show skeleton for balance card + transaction rows while
//      either is loading.
//   3. Empty state if transactions list is empty (unlikely but
//      possible for new accounts).
//   4. Pull-to-refresh re-fires both fetches.
//
// Why Promise.all: sequential awaits would take 2× as long.
// Running them in parallel means the screen is ready when the
// slower of the two completes — usually ~400ms in mock.
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Format a kobo amount (integer) as a signed naira string.
 *   +100000  → "+₦1,000"
 *   -1750000 → "-₦17,500"
 *   0        → "₦0"
 *
 * Backend always sends kobo — never floats — so we round to the
 * nearest naira for display.
 */
const formatSignedNaira = (kobo: number): string => {
  const naira = Math.round(Math.abs(kobo) / 100);
  const formatted = naira.toLocaleString('en-US');
  if (kobo > 0) return `+₦${formatted}`;
  if (kobo < 0) return `-₦${formatted}`;
  return `₦${formatted}`;
};

/**
 * Format a plain (unsigned) kobo amount as naira.
 * Used for the main balance figure.
 */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

/**
 * Human-friendly time from an ISO string.
 *   Today     → "Today, 9:02 AM"
 *   Yesterday → "Yesterday, 3:15 PM"
 *   Older     → "24 Nov, 9:02 AM"
 *
 * Transaction subtitles in the mock come pre-formatted ("24 Nov,
 * 9:02 AM") so this mostly matters when the backend sends real
 * ISO timestamps.
 */
const formatTransactionTime = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();

  const sameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (sameDay(d, now)) return `Today, ${time}`;
  if (sameDay(d, yesterday)) return `Yesterday, ${time}`;

  const date = d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  return `${date}, ${time}`;
};

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function CustomerWallet() {
  // ─── State ───
  // Balance in kobo (integer). null while loading first time.
  const [balance, setBalance] = useState<number | null>(null);

  // Transaction list from the API.
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // First-paint loading — shows skeletons.
  const [loading, setLoading] = useState(true);

  // Pull-to-refresh state.
  const [refreshing, setRefreshing] = useState(false);

  // Error message; if set, replaces list with a retry screen.
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ───
  // Two calls in parallel. `isRefresh` keeps the current list
  // visible during a pull-to-refresh (no skeleton swap).
  const fetchWallet = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      // Promise.all → both requests run concurrently. Total time
      // = max(t1, t2) not t1 + t2.
      const [balanceRes, txRes] = await Promise.all([
        api.wallet.getBalance(),
        api.wallet.listTransactions(),
      ]);

      setBalance(balanceRes.balance);
      setTransactions(txRes);
    } catch {
      setError('Could not load your wallet. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // ─── Add Money (stub) ───
  // Real flow will push to a top-up screen. For now, mock topup
  // through the API so the balance visibly changes.
  const handleAddMoney = async () => {
    try {
      const res = await api.wallet.topup({
        amount: 500_000, // ₦5,000
        method: 'card',
      });
      setBalance(res.balance);
    } catch {
      // silent — a toast primitive would surface this later
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* ─── Header ─── */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-5">
        <Text className="text-heading-sm font-gabarito text-ink">
          My Wallet
        </Text>

        <TouchableOpacity
          onPress={handleAddMoney}
          disabled={loading}
          className={`
            rounded-full px-4 py-2.5 flex-row items-center gap-1.5
            ${loading ? 'bg-border' : 'bg-primary'}
          `}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="plus" size={14} color={colors.white} />
          <Text className="text-caption font-figtree-bold text-white">
            Add Money
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══ Loading — skeleton balance + transactions ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Skeleton balance card */}
            <View className="border border-border rounded-2xl p-6 mb-7">
              <Skeleton width="50%" height={10} />
              <View className="mt-3 mb-5">
                <Skeleton width="70%" height={34} radius={8} />
              </View>
              <View className="flex-row items-center gap-2">
                <Skeleton width={8} height={8} radius={4} />
                <Skeleton width="60%" height={10} />
              </View>
            </View>

            {/* Skeleton ledger heading */}
            <Skeleton width="40%" height={14} className="mb-4" />

            {/* Skeleton transaction rows */}
            <View className="gap-3">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="border border-border rounded-2xl p-4 flex-row items-center gap-3"
                >
                  <Skeleton width={40} height={40} radius={20} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="40%" height={10} />
                  </View>
                  <Skeleton width={70} height={14} />
                </View>
              ))}
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
              onRefresh={() => fetchWallet(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Something went wrong"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchWallet()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded — balance card + list ═══ */}
      {!loading && !error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWallet(true)}
              tintColor={colors.primary}
            />
          }
        >
          <View className="px-6">
            {/* ─── Balance card ─── */}
            <View className="bg-surface border border-border rounded-2xl p-6 mb-7">
              <Text className="text-caption-sm font-figtree-bold text-text-light uppercase tracking-wider mb-3">
                Current Balance
              </Text>

              <View className="flex-row items-end gap-2 mb-5">
                <Text className="text-[36px] font-gabarito text-ink leading-none">
                  {formatNaira(balance ?? 0)}
                </Text>
                <Text className="text-body-xs font-figtree text-text-light mb-1">
                  NGN
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-status-success" />
                <Text className="text-caption-sm font-figtree text-muted">
                  256-bit Secure bank connection verified
                </Text>
              </View>
            </View>

            {/* ─── Ledger heading ─── */}
            <Text className="text-body font-gabarito text-ink mb-4">
              Transaction Ledger
            </Text>

            {/* ─── Empty state ─── */}
            {transactions.length === 0 ? (
              <EmptyState
                icon="file-text"
                title="No transactions yet"
                body="Top up your wallet or complete an errand to see activity here."
                actionLabel="Add Money"
                onAction={handleAddMoney}
              />
            ) : (
              /* ─── Transaction list ─── */
              <View className="gap-3">
                {transactions.map((tx) => {
                  // Positive amount = credit (green). Negative = debit (ink).
                  const isCredit = tx.amount > 0;

                  return (
                    <View
                      key={tx.id}
                      className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-surface"
                    >
                      {/* Icon circle — always primary teal for consistency */}
                      <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
                        <Feather
                          name={tx.icon as any}
                          size={18}
                          color={colors.primary}
                        />
                      </View>

                      {/* Title + timestamp */}
                      <View className="flex-1">
                        <Text className="text-body-sm font-figtree-bold text-ink mb-1">
                          {tx.title}
                        </Text>
                        <Text className="text-caption-sm font-figtree text-muted">
                          {formatTransactionTime(tx.createdAt)}
                        </Text>
                      </View>

                      {/* Signed amount */}
                      <Text
                        className={`
                          text-body-sm font-gabarito
                          ${isCredit ? 'text-status-success' : 'text-ink'}
                        `}
                      >
                        {formatSignedNaira(tx.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}