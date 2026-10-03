import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Shopping Progress
//
// Live shopping checklist while the runner is at the store.
// Shows found/unavailable/pending items + a substitution card
// when an item needs a decision.
//
// Figma: shopping-progress
//   Checklist card · substitution card with approve / choose
//   another / skip actions.
//
// MOCK: CHECKLIST below. Replace with GET /errands/:id/items.
// ─────────────────────────────────────────────────────────────

type ItemStatus = 'done' | 'unavailable' | 'pending';

type ChecklistItem = {
  id: string;
  name: string;
  price: string;
  status: ItemStatus;
};

const CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'Golden Penny Pasta x2',   price: '₦1,200',      status: 'done' },
  { id: '2', name: 'Eva Table Water Case',    price: '₦2,500',      status: 'done' },
  { id: '3', name: 'Peak Milk Powder 400g',   price: 'Unavailable', status: 'unavailable' },
  { id: '4', name: 'Kellogg Cornflakes Large', price: 'Pending',    status: 'pending' },
];

// ─── MOCK: swap for product image from API later ───
const PRODUCT_IMAGE = require('@/assets/map.png');

export default function ShoppingProgress() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
    runnerName?: string;
  }>();

  const runnerName = params.runnerName ?? 'David';

  // ─── Status → circle styling ───
  const STATUS_STYLES: Record<ItemStatus, string> = {
    done: 'bg-status-successLight',
    unavailable: 'bg-status-errorLight',
    pending: 'bg-background-dark',
  };

  const handleApprove = () => {
    router.replace({
      pathname: '/(customer)/errand/receipt',
      params,
    });
  };

  const handleChooseAnother = () => {
    // ─── MOCK: opens a product search sheet in a future session ───
  };

  const handleSkip = () => {
    // ─── MOCK: marks item as skipped and returns to checklist ───
    router.replace({
      pathname: '/(customer)/errand/receipt',
      params,
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
          Shopping Progress
        </Text>

        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title row */}
          <View className="flex-row items-center justify-between mb-4 mt-1">
            <Text className="text-title font-gabarito text-ink">
              Lekki Spar Checklist
            </Text>
            <Text className="text-body-xs font-figtree-bold text-primary">
              3 of 5 Items
            </Text>
          </View>

          {/* Checklist card */}
          <View className="border border-border rounded-2xl p-4 bg-surface mb-5">
            {CHECKLIST.map((item, index) => {
              const isLast = index === CHECKLIST.length - 1;

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
                      ${STATUS_STYLES[item.status]}
                    `}
                  >
                    {item.status === 'done' ? (
                      <Feather name="check" size={13} color={colors.success} />
                    ) : item.status === 'unavailable' ? (
                      <Feather name="x" size={13} color={colors.danger} />
                    ) : (
                      <View className="w-2 h-2 rounded-full bg-text-light" />
                    )}
                  </View>

                  {/* Item name */}
                  <Text className="flex-1 text-body-sm font-figtree text-ink">
                    {item.name}
                  </Text>

                  {/* Price / status */}
                  <Text
                    className={`
                      text-body-xs font-figtree
                      ${item.status === 'done'
                        ? 'text-ink'
                        : item.status === 'unavailable'
                        ? 'text-status-error'
                        : 'text-text-light'
                      }
                    `}
                  >
                    {item.price}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Substitution card */}
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
              Peak Milk Powder 400g is out of stock. {runnerName} suggests this
              alternative:
            </Text>

            {/* Suggested product row */}
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-14 h-14 rounded-xl bg-background-dark overflow-hidden">
                <Image
                  source={PRODUCT_IMAGE}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="flex-1">
                <Text className="text-body-xs font-gabarito-bold text-ink mb-0.5">
                  Lano Milk Powder 400g
                </Text>
                <Text className="text-caption font-figtree-bold text-status-success">
                  ₦2,100 (Saves ₦300)
                </Text>
              </View>
            </View>

            {/* Approve Alternative */}
            <Button
              variant="primary"
              fullWidth
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
                  onPress={handleSkip}
                >
                  Skip Item
                </Button>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}