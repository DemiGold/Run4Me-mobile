import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { UserSession } from '@/services/api/user';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Login Devices — wired to the user API
//
// Same pattern as payment-methods:
//   fetch → loading (skeleton) → error → list
//   Per-row revoke with confirmation + optimistic removal
//   Bulk "sign out all other devices" action
//
// The current device row is protected — no revoke button. Its
// border is teal and it carries a THIS DEVICE badge.
//
// Data flow:
//   fetch          → api.user.listSessions()
//   revoke one     → api.user.revokeSession(id) after confirm
//   revoke others  → api.user.revokeAllOtherSessions()
// ─────────────────────────────────────────────────────────────

export default function LoginDevices() {
  // ─── State ───
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which session has a mutation in flight. Dims that row
  // and prevents parallel taps. null = idle.
  const [busyId, setBusyId] = useState<string | null>(null);

  // Which bulk action is running (currently only "sign out all").
  const [bulkBusy, setBulkBusy] = useState(false);

  // ─── Fetch ───
  const fetchSessions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const list = await api.user.listSessions();
      setSessions(list);
    } catch {
      setError('Could not load your devices. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ─── Revoke single session (confirmed, then optimistic) ───
  const handleRevoke = (session: UserSession) => {
    Alert.alert(
      'Revoke session?',
      `${session.device} in ${session.location} will be signed out.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            if (busyId) return;

            const snapshot = sessions;
            setBusyId(session.id);
            // Optimistic: remove immediately
            setSessions((prev) => prev.filter((s) => s.id !== session.id));

            try {
              await api.user.revokeSession(session.id);
            } catch {
              // Rollback on failure
              setSessions(snapshot);
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  // ─── Sign out all other devices (bulk) ───
  const handleSignOutAll = () => {
    Alert.alert(
      'Sign out all other devices?',
      "You'll stay signed in on this device.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out others',
          style: 'destructive',
          onPress: async () => {
            if (bulkBusy || busyId) return;

            const snapshot = sessions;
            setBulkBusy(true);
            // Optimistic: keep only the current device
            setSessions((prev) => prev.filter((s) => s.isCurrent));

            try {
              const survivors = await api.user.revokeAllOtherSessions();
              // API returns the surviving list — authoritative
              setSessions(survivors);
            } catch {
              setSessions(snapshot);
            } finally {
              setBulkBusy(false);
            }
          },
        },
      ]
    );
  };

  // Derived: how many non-current sessions exist?
  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* ─── Header ─── */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-heading-sm font-gabarito text-ink">
          Login Devices
        </Text>
      </View>

      {/* ═══ Loading — skeleton rows ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton width="40%" height={12} className="mb-5" />

          <View className="gap-3 mb-5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="rounded-2xl p-4 border border-border flex-row items-center gap-3"
              >
                <Skeleton width={44} height={44} radius={12} />
                <View className="flex-1 gap-2">
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="40%" height={10} />
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
              onRefresh={() => fetchSessions(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Something went wrong"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchSessions()}
          />
        </ScrollView>
      ) : null}

      {/* ═══ Loaded ═══ */}
      {!loading && !error ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSessions(true)}
              tintColor={colors.primary}
            />
          }
        >
          {sessions.length === 0 ? (
            /* ─── Empty state (rare — should have at least current) ─── */
            <EmptyState
              icon="smartphone"
              title="No sessions found"
              body="Sign in on a device to see it here."
            />
          ) : (
            <>
              {/* ─── Count line ─── */}
              <Text className="text-body-sm font-figtree text-muted mb-5">
                {sessions.length} active{' '}
                {sessions.length === 1 ? 'session' : 'sessions'}
              </Text>

              {/* ─── Session rows ─── */}
              <View className="gap-3 mb-5">
                {sessions.map((s) => {
                  const isBusy = busyId === s.id;

                  return (
                    <View
                      key={s.id}
                      className={`
                        rounded-2xl p-4 border bg-surface
                        flex-row items-center gap-3
                        ${s.isCurrent ? 'border-primary' : 'border-border'}
                        ${isBusy ? 'opacity-60' : 'opacity-100'}
                      `}
                    >
                      {/* Device icon */}
                      <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                        <Feather name={s.icon} size={20} color={colors.primary} />
                      </View>

                      {/* Device name + meta */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-0.5">
                          <Text className="text-body-sm font-gabarito-bold text-ink">
                            {s.device}
                          </Text>
                          {s.isCurrent ? (
                            <View className="bg-primary-light px-2 py-0.5 rounded">
                              <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                                THIS DEVICE
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-caption-sm font-figtree text-muted">
                          {s.location} · {s.lastActive}
                        </Text>
                      </View>

                      {/* Revoke action (hidden on current device) */}
                      {!s.isCurrent ? (
                        <TouchableOpacity
                          onPress={() => handleRevoke(s)}
                          disabled={isBusy || !!busyId || bulkBusy}
                          hitSlop={8}
                        >
                          <Feather
                            name="x-circle"
                            size={20}
                            color={colors.danger}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              {/* ─── Bulk sign-out (only when there are other sessions) ─── */}
              {otherCount > 0 ? (
                <Button
                  variant="destructive"
                  fullWidth
                  loading={bulkBusy}
                  disabled={!!busyId}
                  onPress={handleSignOutAll}
                >
                  Sign out all other devices
                </Button>
              ) : null}
            </>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}