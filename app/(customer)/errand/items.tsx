import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Errand Items — step 4 of 8
//
// Figma: items
//   Shopping list with quantity steppers + per-item camera/delete.
//   "Add Item" button + "Record Voice Instructions" link.
//
// IMPORTANT: all wizard params accumulate forward.
//   4/8 sets: items
//   Forwards: type, promo, pickup, dropoff, items
//
// `items` is serialized as a human-readable string so it can be
// reused by the chat paste shortcut ("Ariel ×2, Milk ×1"). Once
// we move to a wizard store, this becomes a typed array again.
// ─────────────────────────────────────────────────────────────

type Item = {
  id: string;
  name: string;
  note: string;
  quantity: number;
};

const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    name: 'Fresh Milk (2 Liters)',
    note: 'Brand: Peak Milk preferably',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Loaf of Sliced Bread',
    note: 'Large loaf, fresh bake',
    quantity: 2,
  },
];

// "Fresh Milk (2 Liters) ×1, Loaf of Sliced Bread ×2"
const serializeItems = (items: Item[]): string =>
  items.map((i) => `${i.name} ×${i.quantity}`).join(', ');

export default function ErrandItems() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
  }>();

  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ─── Add Item (mock: appends a placeholder) ───
  // Real flow: opens a modal with name + note + quantity inputs.
  const handleAddItem = () => {
    const newItem: Item = {
      id: String(Date.now()),
      name: 'New Item',
      note: 'Tap to edit name and note',
      quantity: 1,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // ─── Camera per item (photo picker) ───
  const handleItemPhoto = async (_id: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // ─── MOCK: attach photo to item when backend + upload exist ───
    }
  };

  const handleVoiceInstructions = () => {
    // ─── MOCK: expo-av recording comes later ───
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/budget',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        pickup: params.pickup ?? '',
        dropoff: params.dropoff ?? '',
        items: serializeItems(items),   // ← forward the shopping list
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

        <Text className="text-body font-gabarito text-ink">Errand Items</Text>

        <Text className="text-body-xs font-figtree-bold text-primary">
          4<Text className="text-text-light font-figtree">/8</Text>
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title row: title + Add Item */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-heading-sm font-gabarito text-ink">
              Shopping List
            </Text>

            <TouchableOpacity
              onPress={handleAddItem}
              className="bg-primary rounded-full px-3 py-2 flex-row items-center gap-1.5"
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="plus" size={13} color={colors.white} />
              <Text className="text-white text-caption-sm font-figtree-bold tracking-wider">
                ADD ITEM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Item cards */}
          <View className="gap-3 mb-5">
            {items.map((item) => (
              <View
                key={item.id}
                className="border border-border rounded-2xl p-4 bg-surface"
              >
                {/* Top row: name + quantity controls */}
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-1 pr-3">
                    <Text className="text-body-sm font-figtree-bold text-ink">
                      {item.name}
                    </Text>
                    <Text className="text-caption-sm font-figtree text-text-light mt-1">
                      {item.note}
                    </Text>
                  </View>

                  {/* Quantity pill */}
                  <View className="flex-row items-center bg-primary-light rounded-full px-1 py-1 gap-2">
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                      hitSlop={6}
                    >
                      <Feather name="minus" size={12} color={colors.primary} />
                    </TouchableOpacity>

                    <Text className="text-body-xs font-figtree-bold text-ink min-w-[14px] text-center">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                      hitSlop={6}
                    >
                      <Feather name="plus" size={12} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom row: photo + delete */}
                <View className="flex-row justify-end items-center gap-3 mt-2">
                  <TouchableOpacity
                    onPress={() => handleItemPhoto(item.id)}
                    activeOpacity={0.7}
                    hitSlop={6}
                  >
                    <Feather name="camera" size={16} color={colors.muted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    activeOpacity={0.7}
                    hitSlop={6}
                  >
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Voice instructions link */}
          <TouchableOpacity
            onPress={handleVoiceInstructions}
            className="flex-row items-center gap-2 mb-8 py-2"
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <View className="w-6 h-6 rounded-full bg-accent-light items-center justify-center">
              <Feather name="mic" size={12} color={colors.accent} />
            </View>
            <Text className="text-caption font-figtree-bold text-accent">
              Record Voice Instructions Instead
            </Text>
          </TouchableOpacity>
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