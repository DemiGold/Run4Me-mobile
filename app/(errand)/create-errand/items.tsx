import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

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

export default function ErrandItems() {
  const { type, promo, pickup, dropoff } = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

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

  const handleContinue = () => {
    router.push({
      pathname: '/(errand)/create-errand/budget',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: pickup ?? '',
        dropoff: dropoff ?? '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[15px] font-gabarito text-text-dark">
          Errand Items
        </Text>

        <Text className="text-[13px] font-figtree-bold text-primary">
          4<Text className="text-text-light font-figtree font-normal">/8</Text>
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title row: Shopping List + Add Item */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[20px] font-gabarito text-text-dark">
              Shopping List
            </Text>

            <TouchableOpacity
              className="bg-primary rounded-full px-3 py-2 flex-row items-center gap-1.5"
              activeOpacity={0.8}
            >
              <Feather name="plus" size={13} color="#FFFFFF" />
              <Text className="text-white text-[11px] font-figtree-bold tracking-wider">
                ADD ITEM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Item cards */}
          <View className="gap-3 mb-5">
            {items.map((item) => (
              <View
                key={item.id}
                className="border border-border rounded-2xl p-4 bg-white"
              >
                {/* Top row: name + quantity controls */}
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-1 pr-3">
                    <Text className="text-[14px] font-figtree-bold text-text-dark">
                      {item.name}
                    </Text>
                    <Text className="text-[11px] font-figtree text-text-light mt-1">
                      {item.note}
                    </Text>
                  </View>

                  {/* Quantity pill */}
                  <View className="flex-row items-center bg-primary-light rounded-full px-1 py-1 gap-2">
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Feather name="minus" size={12} color="#006B75" />
                    </TouchableOpacity>

                    <Text className="text-[13px] font-figtree-bold text-text-dark min-w-[14px] text-center">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Feather name="plus" size={12} color="#006B75" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom row: icons */}
                <View className="flex-row justify-end items-center gap-3 mt-2">
                  <TouchableOpacity activeOpacity={0.7}>
                    <Feather name="camera" size={16} color="#475569" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Voice Instructions link */}
          <TouchableOpacity
            className="flex-row items-center gap-2 mb-8 py-2"
            activeOpacity={0.7}
          >
            <View className="w-6 h-6 rounded-full bg-secondary-light items-center justify-center">
              <Feather name="mic" size={12} color="#FF9F1C" />
            </View>
            <Text className="text-[12px] font-figtree-bold text-secondary">
              Record Voice Instructions Instead
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}