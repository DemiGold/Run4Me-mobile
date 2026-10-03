import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Payment Methods
//
// List of saved cards + bank accounts. Add / remove / set default.
// MOCK: cards come from MOCK_CARDS constant.
// ─────────────────────────────────────────────────────────────

type Card = {
  id: string;
  brand: string;      // "Visa" | "Mastercard"
  last4: string;
  expiry: string;
  isDefault: boolean;
};

const INITIAL_CARDS: Card[] = [
  { id: 'c1', brand: 'GTBank Mastercard', last4: '4910', expiry: '08/28', isDefault: true },
  { id: 'c2', brand: 'Zenith Visa',       last4: '2277', expiry: '03/27', isDefault: false },
];

export default function PaymentMethods() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);

  const handleSetDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleRemove = (card: Card) => {
    Alert.alert(
      'Remove card?',
      `Remove ${card.brand} ending ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setCards((prev) => prev.filter((c) => c.id !== card.id)),
        },
      ]
    );
  };

  const handleAddCard = () => {
    Alert.alert('Add card', 'Card entry flow coming soon.');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-heading-sm font-gabarito text-ink">
          Payment Methods
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {cards.length === 0 ? (
          <View className="items-center py-16">
            <Feather name="credit-card" size={40} color={colors.subtle} />
            <Text className="text-body-xs font-figtree text-text-light mt-3">
              No saved cards
            </Text>
          </View>
        ) : (
          <View className="gap-3 mb-5">
            {cards.map((card) => (
              <View
                key={card.id}
                className={`
                  rounded-2xl p-4 border bg-surface
                  ${card.isDefault ? 'border-primary' : 'border-border'}
                `}
              >
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                    <Feather name="credit-card" size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-0.5">
                      <Text className="text-body-sm font-gabarito-bold text-ink">
                        {card.brand}
                      </Text>
                      {card.isDefault ? (
                        <View className="bg-primary-light px-2 py-0.5 rounded">
                          <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                            DEFAULT
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-caption-sm font-figtree text-muted">
                      •••• {card.last4} · Exp {card.expiry}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t border-border pt-3">
                  {!card.isDefault ? (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(card.id)}
                      hitSlop={6}
                    >
                      <Text className="text-body-xs font-figtree-bold text-primary">
                        Set as default
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-body-xs font-figtree text-text-light">
                      Default card
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => handleRemove(card)} hitSlop={6}>
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add card */}
        <TouchableOpacity
          onPress={handleAddCard}
          activeOpacity={0.75}
          className="border border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2"
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text className="text-body-sm font-figtree-bold text-primary">
            Add New Card
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}