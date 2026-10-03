import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Delivery Preference (timeline) — step 7 of 8
//
// Figma: Delivery Preference
//   Deliver Now (teal) · Schedule for Later (orange) with
//   date/time pills.
//
// IMPORTANT: all wizard params accumulate forward. `items` is
// forwarded from items.tsx via budget/instructions; forgetting it
// here silently drops it before the runner-matching phase.
//
// After this screen: finding-runner (matching) → available-runners
// → runner-secured → payment/checkout → pay → errand-confirmed.
// ─────────────────────────────────────────────────────────────

type Timeline = 'now' | 'later';

export default function DeliveryPreference() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    store?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    photoCount?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const [selected, setSelected] = useState<Timeline>(
    (params.timeline as Timeline) ?? 'later'
  );
  const [date] = useState(params.scheduledDate ?? 'Oct 26, 2026');
  const [time] = useState(params.scheduledTime ?? '2:00 PM');

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/finding-runner',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        store: params.store ?? '',
        pickup: params.pickup ?? '',
        dropoff: params.dropoff ?? '',
        items: params.items ?? '',   // ← forward the shopping list
        budget: params.budget ?? '',
        instructions: params.instructions ?? '',
        photoCount: params.photoCount ?? '0',
        timeline: selected,
        scheduledDate: selected === 'later' ? date : '',
        scheduledTime: selected === 'later' ? time : '',
      },
    });
  };

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
          Delivery Preference
        </Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          7<Text className="text-text-light font-figtree">/8</Text>
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Title */}
        <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-2">
          Choose your timeline
        </Text>

        <Text className="text-body-xs font-figtree text-muted mb-6">
          When do you want your Errand Runner to execute this task?
        </Text>

        {/* Deliver Now */}
        <TouchableOpacity
          onPress={() => setSelected('now')}
          activeOpacity={0.8}
          className={`
            rounded-2xl p-4 flex-row items-center gap-3 mb-3
            ${selected === 'now'
              ? 'border-2 border-primary bg-primary-light'
              : 'border border-border bg-surface'
            }
          `}
        >
          <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center">
            <Feather name="zap" size={18} color={colors.primary} />
          </View>

          <View className="flex-1">
            <Text className="text-body-sm font-gabarito-bold text-ink">
              Deliver Now
            </Text>
            <Text className="text-caption-sm font-figtree text-muted mt-0.5">
              Instantly assign to the closest runner
            </Text>
          </View>

          {selected === 'now' ? (
            <Feather name="check-circle" size={22} color={colors.primary} />
          ) : (
            <View className="w-5 h-5 rounded-full border-2 border-border-light" />
          )}
        </TouchableOpacity>

        {/* Schedule for Later */}
        <TouchableOpacity
          onPress={() => setSelected('later')}
          activeOpacity={0.8}
          className={`
            rounded-2xl p-4 mb-3
            ${selected === 'later'
              ? 'border-2 border-primary bg-primary-light'
              : 'border border-border bg-surface'
            }
          `}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-accent-light items-center justify-center">
              <Feather name="calendar" size={18} color={colors.accent} />
            </View>

            <View className="flex-1">
              <Text className="text-body-sm font-gabarito-bold text-ink">
                Schedule for Later
              </Text>
              <Text className="text-caption-sm font-figtree text-muted mt-0.5">
                Choose a convenient time window
              </Text>
            </View>

            {selected === 'later' ? (
              <Feather name="check-circle" size={22} color={colors.primary} />
            ) : (
              <View className="w-5 h-5 rounded-full border-2 border-border-light" />
            )}
          </View>

          {selected === 'later' ? (
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                <Feather name="calendar" size={14} color={colors.muted} />
                <Text className="text-caption font-figtree text-ink">
                  {date}
                </Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                <Feather name="clock" size={14} color={colors.muted} />
                <Text className="text-caption font-figtree text-ink">
                  {time}
                </Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleContinue}>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}