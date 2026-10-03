import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Checkout / Cost Estimate
//
// Figma: Cost Estimate
//   Cost breakdown card + payment method radio list +
//   sticky "Due Now" bar at the bottom.
//
// Runs AFTER the customer picks a runner, so the runner's fee
// folds into the final total here (not at the earlier wizard
// step). The runnerPrice param arrives from runner-secured as a
// formatted string like "₦2,500".
//
// Payment branches:
//   wallet   → payment/wallet
//   card     → payment/card
//   transfer → payment/bank-transfer
//   cash     → payment/cash
// ─────────────────────────────────────────────────────────────

const SERVICE_FEE = 1500;
const DISTANCE_FEE = 800;
const PLATFORM_FEE = 200;

type PaymentMethod = 'wallet' | 'card' | 'transfer' | 'cash';

type Method = {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const PAYMENT_METHODS: Method[] = [
  {
    id: 'wallet',
    label: 'Run4Me Wallet',
    subtitle: 'Balance: ₦22,500',
    icon: 'credit-card',
  },
  {
    id: 'card',
    label: 'GTBank Card **** 4910',
    subtitle: '',
    icon: 'credit-card',
  },
  {
    id: 'transfer',
    label: 'Bank Transfer',
    subtitle: '',
    icon: 'repeat',
  },
  {
    id: 'cash',
    label: 'Cash',
    subtitle: '',
    icon: 'x-circle',
  },
];

export default function Checkout() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    photoCount?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    // Runner details from runner-secured
    runnerId?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerPrice?: string;      // formatted, e.g. "₦2,500"
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
  }>();

  const budget = Number(params.budget ?? '15000') || 15000;
  const promoDiscount = params.promo === 'FIRST4ME' ? 1000 : 0;

  // Extract numeric runner fee from "₦2,500" → 2500
  const runnerFee =
    Number((params.runnerPrice ?? '').replace(/\D/g, '')) || 0;

  const serviceTotal =
    SERVICE_FEE + DISTANCE_FEE + PLATFORM_FEE - promoDiscount;
  const dueNow = serviceTotal + runnerFee + budget;

  const [selected, setSelected] = useState<PaymentMethod>('wallet');

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString('en-US')}`;

  // ─── Branch to the correct payment screen ───
  const handleConfirm = () => {
    const routeMap: Record<PaymentMethod, string> = {
      wallet: '/(customer)/errand/payment/wallet',
      card: '/(customer)/errand/payment/card',
      transfer: '/(customer)/errand/payment/bank-transfer',
      cash: '/(customer)/errand/payment/cash',
    };

    router.replace({
      pathname: routeMap[selected] as any,
      params: {
        ...params,
        amount: String(dueNow),
        paymentMethod: selected,
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

        <Text className="text-body font-gabarito text-ink">Cost Estimate</Text>

        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title */}
          <Text className="text-title font-gabarito text-ink mb-4 mt-1">
            Cost Breakdown
          </Text>

          {/* Cost breakdown card */}
          <View className="border border-border rounded-2xl p-4 mb-6 bg-surface">
            <Row label="Errand Service Fee" value={formatNaira(SERVICE_FEE)} />
            <Row label="Distance Fee" value={formatNaira(DISTANCE_FEE)} />
            <Row label="Platform Fee" value={formatNaira(PLATFORM_FEE)} />

            <View className="h-[1px] bg-border my-3" />

            <Row label="Shopping Budget" value={formatNaira(budget)} />

            {/* Runner fee — only when a runner has been selected */}
            {runnerFee > 0 ? (
              <>
                <View className="h-[1px] bg-border my-3" />
                <Row
                  label={
                    params.runnerName
                      ? `Runner Fee (${params.runnerName})`
                      : 'Runner Fee'
                  }
                  value={formatNaira(runnerFee)}
                />
              </>
            ) : null}

            <View className="h-[1px] bg-border my-3" />

            {/* Estimated service total */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-body-xs font-gabarito-bold text-ink">
                  Estimated Service Total
                </Text>
                <Text className="text-micro font-figtree text-text-light mt-0.5">
                  Excludes actual shopping spend
                </Text>
              </View>
              <Text className="text-body font-gabarito-bold text-primary">
                {formatNaira(serviceTotal)}
              </Text>
            </View>

            {/* Promo row */}
            {promoDiscount > 0 ? (
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                <View className="flex-row items-center gap-2">
                  <Feather name="gift" size={12} color={colors.primary} />
                  <Text className="text-caption font-figtree-bold text-primary">
                    Promo {params.promo} applied
                  </Text>
                </View>
                <Text className="text-caption font-figtree-bold text-primary">
                  -{formatNaira(promoDiscount)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Payment Method */}
          <Text className="text-body-sm font-gabarito text-ink mb-3">
            Payment Method
          </Text>

          <View className="gap-3 mb-6">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selected === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelected(method.id)}
                  activeOpacity={0.8}
                  className={`
                    rounded-2xl p-4 flex-row items-center gap-3 bg-surface
                    ${isSelected
                      ? 'border-2 border-primary'
                      : 'border border-border'
                    }
                  `}
                >
                  <View
                    className={`
                      w-9 h-9 rounded-xl items-center justify-center
                      ${isSelected ? 'bg-primary-light' : 'bg-background-dark'}
                    `}
                  >
                    <Feather
                      name={method.icon}
                      size={16}
                      color={isSelected ? colors.primary : colors.muted}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-body-xs font-gabarito-bold text-ink">
                      {method.label}
                    </Text>
                    {method.subtitle ? (
                      <Text className="text-caption font-figtree text-muted mt-0.5">
                        {method.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {/* Radio */}
                  {isSelected ? (
                    <View className="w-5 h-5 rounded-full border-[5px] border-primary" />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-border-light" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom: due now + CTA */}
      <View className="px-6 pb-6 pt-4 bg-surface border-t border-border">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-caption font-figtree text-muted">
            Due Now (Total + Budget):
          </Text>
          <Text className="text-body font-gabarito-bold text-ink">
            {formatNaira(dueNow)}
          </Text>
        </View>

        <Button variant="primary" fullWidth onPress={handleConfirm}>
          Confirm &amp; Pay {formatNaira(dueNow)}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-body-xs font-figtree text-muted">{label}</Text>
      <Text className="text-body-xs font-figtree-bold text-ink">{value}</Text>
    </View>
  );
}