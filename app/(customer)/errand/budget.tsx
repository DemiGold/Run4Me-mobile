import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Errand Budget — step 5 of 8
//
// Figma: budget screen
//   Giant ₦ input (36px Gabarito) · info box · primary CTA.
//
// IMPORTANT: all wizard params accumulate forward. `items` is
// forwarded from items.tsx; forgetting it here silently drops it
// before checkout.
//
// Units: NAIRA (integer). This screen is upstream of checkout,
// which is the naira→kobo boundary for the rest of the flow.
//
// ─── How the ".00" suffix works ───
// The number displayed is: "₦" + formatted digits + ".00"
//
//   State stores:   "15000"  (digits only)
//   Display shows:  "15,000" (in the TextInput, right-aligned)
//   Suffix shows:   ".00"    (a sibling Text, not editable)
//
// The `.00` is NOT part of the TextInput — it's a separate Text
// next to it. If we put it inside the input's value, pressing
// backspace on the last `0` would strip a digit, then the input
// would re-render with a fresh `.00`, and the user could never
// delete the trailing digits. Classic formatting bug.
//
// Keeping the suffix separate means backspace behaves normally:
//   Display: 15,000.00
//   Backspace → text is "15,000.0" → strip non-digits → "15000"
//   → re-render as "15,000" + ".00" → looks identical (no change!)
//
// Wait — that IS a problem. The user presses backspace and
// nothing changes visually.
//
// ─── The fix: right-aligned input + fixed-width number slot ───
// We constrain the number input to a fixed width (200px) with
// `textAlign: 'right'`. The `.00` sits immediately after. Now:
//   "15,000" right-aligns against the input's right edge
//   ".00" sits to its right
// Backspace strips the last digit → "1,500" right-aligns →
// visually the number shrinks by one digit, `.00` stays put.
//
// That's correct and consistent with how money inputs work in
// banking apps (Wise, Revolut, Monzo all do this).
// ─────────────────────────────────────────────────────────────

// Cap at 7 digits → max ₦9,999,999 (way above any real errand budget)
const MAX_DIGITS = 7;

// Fixed width of the number slot (px at 36pt Gabarito).
// 200px fits "9,999,999" comfortably. If the Figma shows a
// different max value, adjust here.
const NUMBER_SLOT_WIDTH = 200;

export default function ErrandBudget() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
  }>();

  // Strip any non-digits from an incoming budget (handles back-nav
  // where params.budget might be "15000" or a formatted string).
  const [budget, setBudget] = useState(
    (params.budget ?? '15000').replace(/\D/g, '')
  );

  // Digits only → grouped display ("15000" → "15,000"). Empty shows "".
  const displayValue = budget
    ? Number(budget).toLocaleString('en-US')
    : '';

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
    setBudget(digits);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/instructions',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        pickup: params.pickup ?? '',
        dropoff: params.dropoff ?? '',
        items: params.items ?? '',
        budget: budget || '0',
      },
    });
  };

  const isValid = budget.length > 0 && Number(budget) > 0;

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

        <Text className="text-body font-gabarito text-ink">Errand Budget</Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          5<Text className="text-text-light font-figtree">/8</Text>
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Title */}
        <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-2">
          Set your maximum shopping budget
        </Text>

        <Text className="text-body-xs font-figtree text-muted mb-10">
          How much money should we approve for buying these items?
        </Text>

        {/* ─── Giant amount input with ".00" suffix ─── */}
        <View className="items-center mb-10">
          <View className="flex-row items-end justify-center">
            {/* ₦ prefix */}
            <Text className="text-[36px] font-gabarito text-ink mr-2">
              ₦
            </Text>

            {/* Number — right-aligned in a fixed-width slot so the
                ".00" suffix stays anchored in place as digits
                are added/removed. */}
            <TextInput
              value={displayValue}
              onChangeText={handleChange}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.subtle}
              className="text-[36px] font-gabarito text-ink"
              style={{
                width: NUMBER_SLOT_WIDTH,
                textAlign: 'right',
              }}
            />

            {/* .00 suffix — decorative, non-editable. Sits to the
                right of the number input. */}
            <Text className="text-[36px] font-gabarito text-ink">
              .00
            </Text>
          </View>

          {/* Underline */}
          <View className="w-[280px] h-[1px] bg-border mt-2" />
        </View>

        {/* Info box */}
        <View className="bg-primary-light rounded-2xl p-4 flex-row items-start gap-3">
          <Feather
            name="info"
            size={16}
            color={colors.primary}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-caption font-figtree text-muted leading-5">
            The runner cannot spend more than your approved budget without your
            permission.
          </Text>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button
          variant="primary"
          fullWidth
          disabled={!isValid}
          onPress={handleContinue}
        >
          Confirm budget &amp; continue
        </Button>
      </View>
    </SafeAreaView>
  );
}