import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Bank Transfer
//
// Shows the bank details the customer must transfer to.
// The virtual account expires in 30 minutes — after that the
// transfer will bounce and the user has to restart.
//
// Figma: Bank transfer
//   393 × 697 content, two info cards + countdown + CTA.
//
// MOCK: bank details come from a MOCK_ACCOUNT constant below.
// Replace with GET /payments/:id/bank-details when backend ships.
// ─────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  '₦' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ─── MOCK: replace with real virtual account from backend ───
const MOCK_ACCOUNT = {
  bank: 'Wema Bank',
  accountNumber: '8047291630',
  accountName: 'Run4Me Payments',
};

// Virtual account expiry — 30 minutes from load
const EXPIRY_SECONDS = 30 * 60;

export default function BankTransfer() {
  const params = useLocalSearchParams<{
    amount?: string;
    errandId?: string;
  }>();

  const amount = params.amount ? parseInt(params.amount, 10) : 17500;
  const errandId = params.errandId ?? '';

  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── Countdown ───
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const expired = secondsLeft === 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // ─── Copy account number to clipboard ───
  const handleCopy = async () => {
    await Clipboard.setStringAsync(MOCK_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleConfirm = () => {
    setLoading(true);
    // ─── MOCK: route forward to status polling screen ───
    router.replace({
      pathname: '/(customer)/errand/payment/bank-payment-confirmation',
      params: { amount: String(amount), errandId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">Bank transfer</Text>

        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-4">

          {/* ─── Total to pay card ─── */}
          <View className="border border-border rounded-2xl p-4 gap-1.5">
            <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
              TOTAL TO PAY
            </Text>
            <Text className="text-heading-sm font-gabarito text-primary">
              {formatNaira(amount)}
            </Text>
            <Text className="text-caption font-figtree text-muted">
              Transfer the exact amount below
            </Text>
          </View>

          {/* ─── Bank details card ─── */}
          <View className="border border-border rounded-2xl p-4 gap-4">

            {/* Bank */}
            <View className="gap-1">
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                BANK
              </Text>
              <Text className="text-body-sm font-figtree-bold text-ink">
                {MOCK_ACCOUNT.bank}
              </Text>
            </View>

            {/* Account number — tappable to copy */}
            <TouchableOpacity
              onPress={handleCopy}
              activeOpacity={0.7}
              className="gap-1"
            >
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                ACCOUNT NUMBER
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-body-sm font-figtree-bold text-ink tracking-wider">
                  {MOCK_ACCOUNT.accountNumber}
                </Text>
                <Feather
                  name={copied ? 'check' : 'copy'}
                  size={14}
                  color={copied ? colors.success : colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* Account name */}
            <View className="gap-1">
              <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider">
                ACCOUNT NAME
              </Text>
              <Text className="text-body-sm font-figtree-bold text-ink">
                {MOCK_ACCOUNT.accountName}
              </Text>
            </View>

          </View>

          {/* ─── Expiry banner ─── */}
          <View
            className={`
              rounded-2xl px-4 py-3.5
              ${expired ? 'bg-status-errorLight' : 'bg-accent-light'}
            `}
          >
            <Text
              className={`
                text-caption font-figtree
                ${expired ? 'text-status-error' : 'text-muted'}
              `}
            >
              {expired
                ? 'This account has expired. Please go back and start again.'
                : `This account expires in ${mm}:${ss}`}
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* ─── CTA ─── */}
      <View className="px-6 pb-6 pt-3 bg-surface">
        <Button
          variant="primary"
          fullWidth
          loading={loading}
          disabled={expired}
          onPress={handleConfirm}
        >
          I've made the transfer
        </Button>
      </View>

    </SafeAreaView>
  );
}