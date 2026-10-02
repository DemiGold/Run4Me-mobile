import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Card Payment
//
// Figma: Card payment
//   393 × 697 content, 44px header, 29px pay button
//
// MOCK flow: submits → routes to card-otp passing the amount,
// last 4 digits of the card (for the OTP subtitle), and errandId
// (passed through from the checkout screen).
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatCardNumber = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
};

const formatCVV = (v: string) => v.replace(/\D/g, '').slice(0, 4);

const formatName = (v: string) => v.replace(/[^A-Za-z ]/g, '').toUpperCase();

export default function CardPayment() {
  const params = useLocalSearchParams<{ amount?: string; errandId?: string }>();
  const amount = params.amount ? parseInt(params.amount, 10) : 17500;
  const errandId = params.errandId ?? '';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // ─── MOCK: replace with real payment API call ───
      await new Promise((r) => setTimeout(r, 900));

      // Extract the last 4 digits for the OTP subtitle ("card ending 4910")
      const cardDigits = cardNumber.replace(/\D/g, '');
      const cardLast4 = cardDigits.slice(-4) || '0000';

      router.push({
        pathname: '/(customer)/errand/payment/card-otp',
        params: {
          amount: String(amount),
          cardLast4,
          errandId,
        },
      });
    } finally {
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

          <Text className="text-body font-gabarito text-ink">Card payment</Text>

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
                Pay securely with your debit card
              </Text>
            </View>

            {/* Card number */}
            <Input
              label="CARD NUMBER"
              uppercaseLabel
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              autoComplete="cc-number"
            />

            {/* Expiry + CVV */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="EXP DATE"
                  uppercaseLabel
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM / YY"
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="CVV"
                  uppercaseLabel
                  value={cvv}
                  onChangeText={(v) => setCvv(formatCVV(v))}
                  placeholder="•••"
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>

            {/* Name on card */}
            <Input
              label="NAME ON CARD"
              uppercaseLabel
              value={nameOnCard}
              onChangeText={(v) => setNameOnCard(formatName(v))}
              placeholder="CHIOMA NWACHUKWU"
              autoCapitalize="characters"
            />

            {/* Save card toggle */}
            <View className="flex-row items-center gap-3">
              <Toggle value={saveCard} onChange={setSaveCard} />
              <Text className="text-body-sm font-figtree text-ink">
                Save card for future payments
              </Text>
            </View>

          </View>
        </ScrollView>

        {/* Pay button */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handlePay}
          >
            Pay {formatNaira(amount)}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}