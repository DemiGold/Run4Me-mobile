import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { Errand, ErrandStatus } from '@/services/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Customer Activity — wired to the API layer
//
// Reference implementation for list screens:
//   fetch → loading (Skeleton) → error (retry) → empty → list
//   Pull-to-refresh · client-side tab filtering
//
// Data flow:
//   1. On mount, fetch ALL errands from api.errands.listErrands()
//   2. Filter client-side per tab (instant, no re-fetch)
//   3. Pull-to-refresh re-fetches everything
//   4. "Active" cards navigate to live-tracking by errand id
//
// Why client-side filtering: tab switching should feel instant.
// Server-side would re-fetch on every tap, adding 400ms latency
// for no reason since the customer rarely has hundreds of errands.
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

/** The three tabs a user can pick. */
type Tab = 'active' | 'completed' | 'cancelled';

/** What we show on the badge — derived from the long ErrandStatus. */
type DisplayStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/** A display-shaped row. Errands get mapped into this. */
type DisplayActivity = {
  id: string;
  time: string;
  title: string;
  runner: string;
  price: string;
  status: DisplayStatus;
  icon: React.ComponentProps<typeof Feather>['name'];
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TABS: { id: Tab; label: string }[] = [
  { id: 'active',    label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

/**
 * Maps a backend serviceType (e.g. "shop-for-me") to a human
 * title and Feather icon. Fallback to DEFAULT_META if the backend
 * ever sends a service we don't recognize yet.
 */
const SERVICE_META: Record<
  string,
  { title: string; icon: React.ComponentProps<typeof Feather>['name'] }
> = {
  'shop-for-me':     { title: 'Shop for Me',       icon: 'shopping-bag' },
  'pick-up-deliver': { title: 'Pick Up & Deliver', icon: 'package' },
  'run-errand':      { title: 'Run an Errand',     icon: 'clipboard' },
  'pharmacy':        { title: 'Pharmacy Run',      icon: 'activity' },
  'food-groceries':  { title: 'Food & Groceries',  icon: 'coffee' },
  'multiple-stops':  { title: 'Multiple Stops',    icon: 'map-pin' },
};

const DEFAULT_META = {
  title: 'Errand',
  icon: 'briefcase' as React.ComponentProps<typeof Feather>['name'],
};

/**
 * Status badge styling per display status.
 *   ACTIVE    → orange accent (in-flight)
 *   COMPLETED → teal primary (success-neutral)
 *   CANCELLED → red (did not complete)
 */
const STATUS_STYLES: Record<
  DisplayStatus,
  { bg: string; text: string }
> = {
  ACTIVE:    { bg: 'bg-accent-light',      text: 'text-accent' },
  COMPLETED: { bg: 'bg-primary-light',     text: 'text-primary' },
  CANCELLED: { bg: 'bg-status-errorLight', text: 'text-status-error' },
};

// ═══════════════════════════════════════════════════════════════
// MAPPING HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Collapse the nine possible backend statuses down to three
 * display statuses. Everything not "completed" or "cancelled"
 * is considered "active" (in flight).
 */
const mapStatus = (status: ErrandStatus): DisplayStatus => {
  if (status === 'completed') return 'COMPLETED';
  if (status === 'cancelled') return 'CANCELLED';
  return 'ACTIVE';
};

/**
 * Human-friendly timestamp from an ISO string.
 *   Today     → "Today, 11:30 AM"
 *   Yesterday → "Yesterday, 3:15 PM"
 *   Older     → "15 Nov, 10:00 AM"
 */
const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();

  // Helper: are two dates the same calendar day?
  const sameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();

  // Compute yesterday for comparison
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // "11:30 AM"
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (sameDay(d, now)) return `Today, ${time}`;
  if (sameDay(d, yesterday)) return `Yesterday, ${time}`;

  // "15 Nov"
  const date = d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  return `${date}, ${time}`;
};

/**
 * Convert a kobo amount (integer) into "₦3,400".
 * Backend always sends kobo — never floats — so we round to the
 * nearest naira for display.
 */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

/**
 * Map a raw Errand into a display row.
 * Handles missing fields gracefully so nothing crashes.
 */
const mapErrand = (e: Errand): DisplayActivity => {
  const meta = SERVICE_META[e.serviceType] ?? DEFAULT_META;

  // Short place label — first part of the pickup address
  const place = e.pickup?.address?.split(',')[0]?.trim();

  // Title: "Shop for Me · Shoprite" or just "Shop for Me"
  const title = place ? `${meta.title} · ${place}` : meta.title;

  // Price: prefer the actual amount charged. Fall back to the
  // runner's fee (for unpaid/in-flight errands), then 0.
  const priceKobo = e.totalCharged ?? e.runner?.price ?? 0;

  return {
    id: e.id,
    time: formatTime(e.createdAt),
    title,
    runner: e.runner?.name ?? 'Unassigned',
    price: formatNaira(priceKobo),
    status: mapStatus(e.status),
    icon: meta.icon,
  };
};

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function CustomerActivity() {
  // ─── State ───
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // Raw errands from the API. Filtering happens downstream.
  const [errands, setErrands] = useState<Errand[]>([]);

  // Loading: first paint before any data has arrived
  const [loading, setLoading] = useState(true);

  // Refreshing: user pulled down to refresh
  const [refreshing, setRefreshing] = useState(false);

  // Error message shown when the fetch fails
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ───
  // `isRefresh` distinguishes pull-to-refresh (keeps list visible)
  // from initial load (shows skeleton).
  const fetchErrands = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      // In the mock this returns MOCK_ERRANDS after ~400ms.
      // When Samuel ships the backend, this same call hits
      // GET /errands (optionally filtered by status).
      const list = await api.errands.listErrands();
      setErrands(list);
    } catch {
      setError('Could not load your activity. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    fetchErrands();
  }, [fetchErrands]);

  // ─── Derived: filter by active tab ───
  // Done client-side so tab switching is instant.
  const filtered: DisplayActivity[] = errands
    .map(mapErrand)
    .filter((a) => {
      if (activeTab === 'active') return a.status === 'ACTIVE';
      if (activeTab === 'completed') return a.status === 'COMPLETED';
      return a.status === 'CANCELLED';
    });

  // ─── Card tap → live-tracking (only for active errands) ───
  const handleCardPress = (item: DisplayActivity) => {
    if (item.status !== 'ACTIVE') return;
    router.push({
      pathname: '/(customer)/errand/live-tracking',
      params: { id: item.id },
    });
  };

  // ─── Empty-state copy varies per tab ───
  const emptyCopy = (() => {
    switch (activeTab) {
      case 'active':
        return {
          icon: 'clock' as const,
          title: 'No active errands',
          body: 'Errands you create will show up here while they run.',
          actionLabel: 'Create errand',
          onAction: () =>
            router.push('/(customer)/errand/select-type'),
        };
      case 'completed':
        return {
          icon: 'check-circle' as const,
          title: 'No completed errands yet',
          body: 'Finished errands will appear here for reference.',
        };
      case 'cancelled':
        return {
          icon: 'x-circle' as const,
          title: 'No cancelled errands',
          body: "You're all caught up.",
        };
    }
  })();

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* ─── Header + Tabs ─── */}
      <View className="px-6 pt-6 pb-5">
        <Text className="text-heading-sm font-gabarito text-ink mb-5">
          Errand Activity
        </Text>

        <View className="flex-row gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
                className={`
                  px-4 py-2.5 rounded-full
                  ${isActive ? 'bg-primary' : 'bg-background-dark'}
                `}
              >
                <Text
                  className={`
                    text-body-xs font-figtree-bold
                    ${isActive ? 'text-white' : 'text-ink'}
                  `}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ═══ Loading — skeleton rows ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className="border border-border rounded-2xl p-4 bg-surface"
              >
                {/* Fake: time + badge row */}
                <View className="flex-row items-center justify-between mb-3">
                  <Skeleton width="40%" height={10} />
                  <Skeleton width={70} height={16} radius={4} />
                </View>

                {/* Fake: icon + title + meta row */}
                <View className="flex-row items-center gap-3">
                  <Skeleton width={44} height={44} radius={12} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="70%" height={12} />
                    <Skeleton width="50%" height={10} />
                  </View>
                </View>
              </View>
            ))}
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
              onRefresh={() => fetchErrands(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Something went wrong"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchErrands()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ List (covers both empty and populated) ═══ */}
      {!loading && !error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchErrands(true)}
              tintColor={colors.primary}
            />
          }
        >
          <View className="px-6 gap-3">
            {filtered.length === 0 ? (
              <EmptyState
                icon={emptyCopy.icon}
                title={emptyCopy.title}
                body={emptyCopy.body}
                actionLabel={emptyCopy.actionLabel}
                onAction={emptyCopy.onAction}
              />
            ) : (
              filtered.map((item) => {
                const style = STATUS_STYLES[item.status];
                const isActive = item.status === 'ACTIVE';

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleCardPress(item)}
                    activeOpacity={isActive ? 0.75 : 1}
                    disabled={!isActive}
                    className="border border-border rounded-2xl p-4 bg-surface"
                  >
                    {/* Row 1: time + status badge */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-caption-sm font-figtree text-text-light">
                        {item.time}
                      </Text>

                      <View className={`${style.bg} px-2.5 py-1 rounded`}>
                        <Text
                          className={`
                            text-micro font-figtree-bold tracking-wider
                            ${style.text}
                          `}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    {/* Row 2: icon + title + meta */}
                    <View className="flex-row items-center gap-3">
                      <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                        <Feather
                          name={item.icon}
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-body-sm font-figtree-bold text-ink mb-0.5">
                          {item.title}
                        </Text>
                        <Text className="text-caption-sm font-figtree text-muted">
                          Runner: {item.runner} • {item.price}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}