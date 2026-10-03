import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Wallet Payment
//
// Figma: Wallet payment
//   Total to Pay card · escrow info banner · transaction PIN ·
//   confirm CTA.
//
// Funds are held in escrow until the errand completes. If the
// customer cancels, the amount refunds to their wallet.
//
// On success: routes to errand-confirmed with ALL wizard params
// forwarded so the confirmation + tracking screens have the
// runner, pickup/dropoff, and item data available.
//
// MOCK: correct PIN is '1234'. Replace with a real
// POST /payments/wallet call when backend ships.
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const MOCK_WALLET_BALANCE = 22500;
const MOCK_CORRECT_PIN = '1234';

export default function WalletPayment() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
    // Everything else from the wizard chain
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    runnerId?: string;
    runnerName?: string;
    runnerRating?: string;
    runnerPrice?: string;
    runnerPickupMins?: string;
    runnerCompleted?: string;
    runnerVehicle?: string;
    paymentMethod?: string;
  }>();

  const amount = params.amount ? parseInt(params.amount, 10) : 17500;
  const errandId = params.errandId ?? '';

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sufficient = MOCK_WALLET_BALANCE >= amount;

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError('Enter your 4-digit transaction PIN.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ─── MOCK: replace with real wallet payment API ───
      await new Promise((r) => setTimeout(r, 900));

      if (pin !== MOCK_CORRECT_PIN) {
        setError('Incorrect PIN. Please try again.');
        setPin('');
        setLoading(false);
        return;
      }

      router.replace({
        pathname: '/(customer)/errand/errand-confirmed',
        params: {
          ...params,
          amount: String(amount),
          paymentMethod: 'wallet',
        },
      });
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </TouchableOpacity>

          <Text className="text-body font-gabarito text-ink">
            Run4Me Wallet
          </Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 gap-5">

            {/* Total to Pay */}
            <View className="border border-border rounded-2xl p-4 gap-1.5">
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                TOTAL TO PAY
              </Text>
              <Text className="text-heading-sm font-gabarito text-primary">
                {formatNaira(amount)}
              </Text>
              <Text className="text-caption font-figtree text-muted">
                Wallet balance: {formatNaira(MOCK_WALLET_BALANCE)}
              </Text>
            </View>

            {/* Escrow info banner */}
            <View className="bg-primary-light rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
              <View className="mt-0.5">
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text className="flex-1 text-body-xs font-figtree text-ink leading-5">
                {formatNaira(amount)} will be held securely until your errand
                is completed.
              </Text>
            </View>

            {/* Insufficient balance warning */}
            {!sufficient ? (
              <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5">
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.danger}
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-body-xs font-figtree text-status-error">
                  Your wallet balance is too low. Top up or choose another
                  payment method.
                </Text>
              </View>
            ) : null}

            {/* Transaction PIN */}
            <View>
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
                TRANSACTION PIN
              </Text>
              <View
                className={`
                  flex-row items-center h-14 rounded-field px-4 border bg-surface
                  ${error ? 'border-status-error' : 'border-border'}
                `}
              >
                <TextInput
                  className="flex-1 text-body font-figtree text-ink tracking-[8px]"
                  value={pin}
                  onChangeText={(v) => {
                    setPin(v.replace(/\D/g, '').slice(0, 4));
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  placeholderTextColor={colors.subtle}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  editable={!loading && sufficient}
                />
              </View>
              {error ? (
                <Text className="text-caption font-figtree text-status-error mt-1.5">
                  {error}
                </Text>
              ) : null}
            </View>

            {/* Forgot PIN */}
            <TouchableOpacity
              className="self-end"
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text className="text-body-sm font-figtree-bold text-primary">
                Forgot PIN?
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* CTA */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!sufficient || pin.length !== 4}
            onPress={handleConfirm}
          >
            Confirm wallet payment
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}