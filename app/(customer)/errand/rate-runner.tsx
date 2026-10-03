import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Rate Runner — wired to the errands API
//
// Post-errand feedback screen. Captures:
//   - Overall star rating (1-5)
//   - Per-category ratings (speed, communication, professionalism)
//   - Optional comment
//   - Optional tip
//
// Submitting calls api.errands.rateErrand(errandId, payload) and
// then returns to the customer home tab.
//
// Units:
//   User picks a tip in NAIRA (₦500, ₦1000, ₦2000, custom).
//   The API expects KOBO. We convert once at submission:
//     tipKobo = tipNaira * 100
//   Same convention as the payment screens.
//
// Defaults:
//   Overall + category ratings start at 5 (best). This is
//   deliberate — it's easier to lower a rating than raise one,
//   and most customers are happy with the service.
//   Tip defaults to ₦1,000. If the customer doesn't want to tip,
//   they can... well, there's no "no tip" option in Figma.
//   Keeping the default as-is to match design.
// ─────────────────────────────────────────────────────────────

type RatingCategory = {
  id: string;
  label: string;
};

const RATING_CATEGORIES: RatingCategory[] = [
  { id: 'speed',           label: 'Delivery Speed' },
  { id: 'communication',   label: 'Communication' },
  { id: 'professionalism', label: 'Professionalism' },
];

const TIP_OPTIONS = [
  { id: '500',    label: '₦500',   amountNaira: 500   },
  { id: '1000',   label: '₦1,000', amountNaira: 1000  },
  { id: '2000',   label: '₦2,000', amountNaira: 2000  },
  { id: 'custom', label: 'Custom', amountNaira: 0     },
] as const;

export default function RateRunner() {
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

  // ─── Form state ───
  const [overallRating, setOverallRating] = useState(5);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    speed: 5,
    communication: 5,
    professionalism: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [selectedTip, setSelectedTip] = useState<string>('1000');
  const [customTip, setCustomTip] = useState('');

  // ─── Submission state ───
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Category rating updater ───
  const updateCategory = (id: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [id]: value }));
  };

  // ─── Derived tip amount in kobo ───
  // If 'custom' is selected, use the typed value. Otherwise use
  // the preset amount. Always convert naira → kobo.
  const tipKobo = useMemo(() => {
    if (selectedTip === 'custom') {
      const customNaira = Number(customTip.replace(/\D/g, '') || '0');
      return customNaira * 100;
    }
    const option = TIP_OPTIONS.find((o) => o.id === selectedTip);
    return (option?.amountNaira ?? 0) * 100;
  }, [selectedTip, customTip]);

  // Can we submit?
  //   - Need an errandId
  //   - If 'custom' is selected, the tip field must be valid (>0)
  const canSubmit = useMemo(() => {
    if (!errandId) return false;
    if (submitting) return false;
    if (selectedTip === 'custom' && Number(customTip) <= 0) return false;
    return true;
  }, [errandId, submitting, selectedTip, customTip]);

  // ─── Submit ───
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      // Rate the errand on the backend. The API also records the
      // tip — when the runner side ships, that tip is what ends
      // up in their earnings ledger.
      await api.errands.rateErrand(errandId, {
        stars: overallRating,
        categoryRatings,
        comment: feedback.trim() || undefined,
        tip: tipKobo > 0 ? tipKobo : undefined,
      });

      // Back to customer home. Use replace so the user can't
      // navigate back into the rating flow.
      router.replace('/(customer)');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not submit rating. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={18} color={colors.ink} />
          </TouchableOpacity>

          <Text className="text-body font-gabarito text-ink">Rate Runner</Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* ─── Title ─── */}
            <Text className="text-heading-sm font-gabarito text-ink text-center mt-2 mb-5">
              How was your experience?
            </Text>

            {/* ─── Error banner ─── */}
            {error ? (
              <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5 mb-5">
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

            {/* ─── Overall rating — 5 large stars ─── */}
            <View className="flex-row justify-center gap-2 mb-7">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setOverallRating(star)}
                  activeOpacity={0.7}
                  hitSlop={6}
                  disabled={submitting}
                >
                  <Feather
                    name="star"
                    size={34}
                    color={
                      star <= overallRating ? colors.accent : colors.borderLight
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* ─── Category ratings card ─── */}
            <View className="border border-border rounded-2xl p-4 bg-surface mb-5">
              {RATING_CATEGORIES.map((cat, index) => {
                const isLast = index === RATING_CATEGORIES.length - 1;
                const rating = categoryRatings[cat.id] ?? 5;

                return (
                  <View
                    key={cat.id}
                    className={`
                      flex-row items-center justify-between py-3
                      ${!isLast ? 'border-b border-border' : ''}
                    `}
                  >
                    <Text className="text-body-sm font-figtree-bold text-ink">
                      {cat.label}
                    </Text>

                    <View className="flex-row gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => updateCategory(cat.id, star)}
                          activeOpacity={0.7}
                          hitSlop={4}
                          disabled={submitting}
                        >
                          <Feather
                            name="star"
                            size={16}
                            color={
                              star <= rating ? colors.accent : colors.borderLight
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ─── Feedback textarea ─── */}
            <View
              className="border border-border rounded-2xl bg-surface mb-6"
              style={{ height: 110 }}
            >
              <TextInput
                className="flex-1 p-4 text-body-xs font-figtree text-ink"
                placeholder="Add a comment or feedback (optional)..."
                placeholderTextColor={colors.subtle}
                multiline
                textAlignVertical="top"
                value={feedback}
                onChangeText={setFeedback}
                editable={!submitting}
              />
            </View>

            {/* ─── Tip section ─── */}
            <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
              Support {runnerName} with a Tip
            </Text>

            <View className="flex-row gap-2 flex-wrap mb-4">
              {TIP_OPTIONS.map((tip) => {
                const isSelected = selectedTip === tip.id;
                return (
                  <TouchableOpacity
                    key={tip.id}
                    onPress={() => setSelectedTip(tip.id)}
                    activeOpacity={0.75}
                    disabled={submitting}
                    className={`
                      rounded-full px-5 py-2.5
                      ${
                        isSelected
                          ? 'bg-primary'
                          : 'bg-surface border border-border'
                      }
                    `}
                  >
                    <Text
                      className={`
                        text-body-xs font-figtree-bold
                        ${isSelected ? 'text-white' : 'text-ink'}
                      `}
                    >
                      {tip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ─── Custom tip input — only when Custom selected ─── */}
            {selectedTip === 'custom' ? (
              <View className="flex-row items-center h-14 rounded-field px-4 border border-border bg-surface mb-4">
                <Text className="text-body font-figtree text-ink mr-1.5">₦</Text>
                <TextInput
                  className="flex-1 text-body font-figtree text-ink"
                  placeholder="Enter amount"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  value={customTip}
                  onChangeText={(v) => setCustomTip(v.replace(/\D/g, ''))}
                  editable={!submitting}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* ─── Bottom CTA ─── */}
        <View className="px-6 pb-6 pt-3">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            Submit Rating
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}