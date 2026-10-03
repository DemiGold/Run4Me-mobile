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
import type { SavedCard } from '@/services/api/payments';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Payment Methods — wired to the API layer
//
// Fifth reference implementation. New patterns:
//
//   1. TWO write operations with different UX:
//        - setDefault: optimistic (badge moves instantly)
//        - remove:     confirmed via Alert, then optimistic
//
//   2. Per-row busy state via `busyCardId` — dims the specific
//      card being mutated while others remain interactive.
//
//   3. Empty state has TWO flavours:
//        - No cards at all → "Add your first card"
//        - Only 1 card → still shows list, add button below
//
// Data flow:
//   fetch  → listCards()
//   setDef → setDefaultCard(id) with optimistic update
//   remove → removeCard(id) with optimistic update after Alert confirm
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function PaymentMethods() {
  // ─── State ───
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which card has a mutation in flight. Used to dim that row
  // and prevent double-taps. null = nothing pending.
  const [busyCardId, setBusyCardId] = useState<string | null>(null);

  // ─── Fetch ───
  const fetchCards = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const list = await api.payments.listCards();
      setCards(list);
    } catch {
      setError('Could not load your cards. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // ─── Set default — optimistic ───
  // Sequence:
  //   1. Snapshot current list (for rollback)
  //   2. Flip local state immediately → badge moves
  //   3. Fire API call
  //   4. On failure: revert + silent (in a real app, toast)
  const handleSetDefault = async (id: string) => {
    if (busyCardId) return;

    const snapshot = cards;
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    setBusyCardId(id);

    try {
      await api.payments.setDefaultCard(id);
    } catch {
      setCards(snapshot);
    } finally {
      setBusyCardId(null);
    }
  };

  // ─── Remove — confirmed via Alert, then optimistic ───
  // We DON'T optimistically remove before the Alert resolves —
  // the user might cancel, so nothing should change yet.
  const handleRemove = (card: SavedCard) => {
    Alert.alert(
      'Remove card?',
      `Remove ${card.brand} ending ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (busyCardId) return;

            const snapshot = cards;
            setBusyCardId(card.id);

            // Optimistically remove from list
            const next = cards.filter((c) => c.id !== card.id);
            // If we removed the default, promote the first remaining
            if (card.isDefault && next.length > 0 && !next.some((c) => c.isDefault)) {
              next[0] = { ...next[0], isDefault: true };
            }
            setCards(next);

            try {
              await api.payments.removeCard(card.id);
            } catch {
              setCards(snapshot);
            } finally {
              setBusyCardId(null);
            }
          },
        },
      ]
    );
  };

  // ─── Add card — stub ───
  // Real flow will push to a card-entry screen (like the checkout one)
  // that captures details and calls POST /payment-methods/cards.
  const handleAddCard = () => {
    Alert.alert(
      'Add card',
      'The card entry flow is coming soon. For now you can pay with a new card at checkout.'
    );
  };

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
          Payment Methods
        </Text>
      </View>

      {/* ═══ Loading — skeleton rows ═══ */}
      {loading ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3 mb-5">
            {[0, 1].map((i) => (
              <View
                key={i}
                className="rounded-2xl p-4 border border-border bg-surface"
              >
                <View className="flex-row items-center gap-3 mb-3">
                  <Skeleton width={44} height={44} radius={12} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="40%" height={10} />
                  </View>
                </View>
                <View className="border-t border-border pt-3">
                  <Skeleton width={80} height={12} />
                </View>
              </View>
            ))}
          </View>

          <Skeleton width="100%" height={52} radius={16} />
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
              onRefresh={() => fetchCards(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="alert-circle"
            title="Something went wrong"
            body={error}
            actionLabel="Retry"
            onAction={() => fetchCards()}
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
              onRefresh={() => fetchCards(true)}
              tintColor={colors.primary}
            />
          }
        >
          {cards.length === 0 ? (
            /* ─── Empty state ─── */
            <EmptyState
              icon="credit-card"
              title="No saved cards"
              body="Add a card to make checkout faster next time."
              actionLabel="Add New Card"
              onAction={handleAddCard}
            />
          ) : (
            /* ─── Card list ─── */
            <>
              <View className="gap-3 mb-5">
                {cards.map((card) => {
                  const isBusy = busyCardId === card.id;

                  return (
                    <View
                      key={card.id}
                      className={`
                        rounded-2xl p-4 border bg-surface
                        ${card.isDefault ? 'border-primary' : 'border-border'}
                        ${isBusy ? 'opacity-60' : 'opacity-100'}
                      `}
                    >
                      {/* Top row: icon + brand + last4/expiry */}
                      <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                          <Feather
                            name="credit-card"
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-0.5">
                            <Text className="text-body-sm font-gabarito-bold text-ink">
                              {card.brand}
                            </Text>
                            {card.isDefault ? (
                              <View className="bg-primary-light px-2 py-0.5 rounded">
                                <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                                  DEFAULT
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text className="text-caption-sm font-figtree text-muted">
                            •••• {card.last4} · Exp {card.expiry}
                          </Text>
                        </View>
                      </View>

                      {/* Bottom row: set-default / remove */}
                      <View className="flex-row items-center justify-between border-t border-border pt-3">
                        {!card.isDefault ? (
                          <TouchableOpacity
                            onPress={() => handleSetDefault(card.id)}
                            disabled={isBusy || !!busyCardId}
                            hitSlop={6}
                          >
                            <Text className="text-body-xs font-figtree-bold text-primary">
                              Set as default
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <Text className="text-body-xs font-figtree text-text-light">
                            Default card
                          </Text>
                        )}
                        <TouchableOpacity
                          onPress={() => handleRemove(card)}
                          disabled={isBusy || !!busyCardId}
                          hitSlop={6}
                        >
                          <Feather name="trash-2" size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Add new card */}
              <TouchableOpacity
                onPress={handleAddCard}
                activeOpacity={0.75}
                className="border border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2"
              >
                <Feather name="plus" size={16} color={colors.primary} />
                <Text className="text-body-sm font-figtree-bold text-primary">
                  Add New Card
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}