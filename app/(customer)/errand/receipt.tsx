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
// Receipt & Billing
//
// Post-errand screen. Shows the runner's uploaded receipt, the
// itemised purchase list, budget comparison, and any refund that
// goes back to the wallet.
//
// Figma: receipt
//   Receipt photo · uploaded timestamp · itemised list ·
//   budget/actual comparison · refund highlight box · CTA.
//
// MOCK: all values are placeholders. Real implementation pulls
// from GET /errands/:id/receipt.
// ─────────────────────────────────────────────────────────────

const RECEIPT_IMAGE = require('@/assets/receipt-photo.png');

const PURCHASED_ITEMS = [
  { id: '1', name: 'Golden Penny Pasta x2',    price: '₦1,200' },
  { id: '2', name: 'Eva Table Water Case',     price: '₦2,500' },
  { id: '3', name: 'Lano Milk Powder 400g',    price: '₦2,100' },
  { id: '4', name: 'Kellogg Cornflakes Large', price: '₦7,400' },
];

const APPROVED_BUDGET = '₦15,000';
const ACTUAL_SPENT    = '₦13,200';
const REFUND_AMOUNT   = '₦1,800';

export default function ReceiptBilling() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const handleContinue = () => {
    router.replace({
      pathname: '/(customer)/errand/confirm-delivery',
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
          Receipt &amp; Billing
        </Text>

        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Receipt image */}
          <View
            className="w-full rounded-2xl overflow-hidden bg-background-dark mb-3"
            style={{ height: 180 }}
          >
            <Image
              source={RECEIPT_IMAGE}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Uploaded info */}
          <View className="flex-row items-center justify-center gap-1.5 mb-6">
            <Feather name="file-text" size={12} color={colors.subtle} />
            <Text className="text-caption-sm font-figtree text-muted">
              David uploaded receipt at 10:14 AM
            </Text>
          </View>

          {/* Purchased items card */}
          <View className="border border-border rounded-2xl p-4 bg-surface mb-5">
            <Text className="text-micro font-figtree-bold text-ink uppercase tracking-wider mb-4">
              PURCHASED ITEMS
            </Text>

            {/* Item rows */}
            <View className="gap-3 mb-4">
              {PURCHASED_ITEMS.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between"
                >
                  <Text className="flex-1 text-body-xs font-figtree text-muted pr-3">
                    {item.name}
                  </Text>
                  <Text className="text-body-xs font-figtree-bold text-ink">
                    {item.price}
                  </Text>
                </View>
              ))}
            </View>

            <View className="h-[1px] bg-border mb-3" />

            {/* Budget comparison */}
            <View className="gap-2 mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-xs font-figtree text-muted">
                  Approved Shopping Budget
                </Text>
                <Text className="text-body-xs font-figtree text-ink">
                  {APPROVED_BUDGET}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-body-xs font-figtree-bold text-ink">
                  Actual Amount Spent
                </Text>
                <Text className="text-body-xs font-figtree-bold text-ink">
                  {ACTUAL_SPENT}
                </Text>
              </View>
            </View>

            {/* Refund highlight box */}
            <View className="rounded-xl px-4 py-3 flex-row items-center justify-between bg-status-successLight">
              <View className="flex-row items-center gap-2">
                <View className="w-5 h-5 rounded-full bg-status-success items-center justify-center">
                  <Feather name="check" size={11} color={colors.white} />
                </View>
                <Text className="text-body-xs font-figtree-bold text-status-successDark">
                  Refund to Wallet
                </Text>
              </View>

              <Text className="text-body-sm font-gabarito text-status-successDark">
                {REFUND_AMOUNT}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button variant="primary" fullWidth onPress={handleContinue}>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}