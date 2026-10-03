import React, { useState } from 'react';
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

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Rate Runner
//
// Post-errand screen. Overall rating + per-category ratings +
// feedback + optional tip. Submitting returns to customer home.
//
// Figma: rate-runner
//   5 large stars · 3 category rows · feedback textarea ·
//   tip pill selector · submit CTA.
//
// MOCK: submit routes to (customer) with no API call.
// Replace with POST /errands/:id/rate when backend ships.
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
  { id: '500',    label: '₦500' },
  { id: '1000',   label: '₦1,000' },
  { id: '2000',   label: '₦2,000' },
  { id: 'custom', label: 'Custom' },
];

// ─── MOCK: replace with the runner's name from route params ───
const RUNNER_NAME = 'David';

export default function RateRunner() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
    runnerName?: string;
  }>();

  const runnerName = params.runnerName ?? RUNNER_NAME;

  const [overallRating, setOverallRating] = useState(5);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    speed: 5,
    communication: 5,
    professionalism: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [selectedTip, setSelectedTip] = useState('1000');
  const [customTip, setCustomTip] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateCategory = (id: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // ─── MOCK: replace with POST /errands/:id/rate ───
      await new Promise((r) => setTimeout(r, 800));

      // Real call would send:
      // {
      //   overallRating,
      //   categoryRatings,
      //   feedback,
      //   tipAmount: selectedTip === 'custom' ? Number(customTip) : Number(selectedTip),
      // }
      router.replace('/(customer)');
    } finally {
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
            {/* Title */}
            <Text className="text-heading-sm font-gabarito text-ink text-center mt-2 mb-5">
              How was your experience?
            </Text>

            {/* Overall rating — 5 large stars */}
            <View className="flex-row justify-center gap-2 mb-7">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setOverallRating(star)}
                  activeOpacity={0.7}
                  hitSlop={6}
                >
                  <Feather
                    name={star <= overallRating ? 'star' : 'star'}
                    size={34}
                    color={star <= overallRating ? colors.accent : colors.borderLight}
                    // Feather "star" is always filled — using color to
                    // distinguish selected (accent) vs unselected (light gray).
                    // For unfilled outline, Ionicons has `star-outline`.
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Category ratings card */}
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

            {/* Feedback textarea */}
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
              />
            </View>

            {/* Tip section */}
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
                    className={`
                      rounded-full px-5 py-2.5
                      ${isSelected
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

            {/* Custom tip input — only when Custom selected */}
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
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="px-6 pb-6 pt-3">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            onPress={handleSubmit}
          >
            Submit Rating
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}