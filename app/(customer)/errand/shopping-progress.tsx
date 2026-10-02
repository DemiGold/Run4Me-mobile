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

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type ItemStatus = 'done' | 'unavailable' | 'pending';

type ChecklistItem = {
  id: string;
  name: string;
  price: string;
  status: ItemStatus;
};

const CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'Golden Penny Pasta x2', price: '₦1,200', status: 'done' },
  { id: '2', name: 'Eva Table Water Case', price: '₦2,500', status: 'done' },
  { id: '3', name: 'Peak Milk Powder 400g', price: 'Unavailable', status: 'unavailable' },
  { id: '4', name: 'Kellogg Cornflakes Large', price: 'Pending', status: 'pending' },
];

const PRODUCT_IMAGE = require('../../assets/map.png'); // swap for product img later

export default function ShoppingProgress() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleApprove = () => {
    router.replace({
      pathname: '/(errand)/receipt',
      params,
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
            <Text className="text-[18px] font-gabarito text-text-dark">
              Lekki Spar Checklist
            </Text>
            <Text className="text-[13px] font-figtree-bold text-primary">
              3 of 5 Items
            </Text>
          </View>

          {/* Checklist card */}
          <View className="border border-border rounded-2xl p-4 bg-white mb-5">
            {CHECKLIST.map((item, index) => {
              const isLast = index === CHECKLIST.length - 1;

              return (
                <View
                  key={item.id}
                  className={`flex-row items-center gap-3 py-3 ${
                    !isLast ? 'border-b border-border' : ''
                  }`}
                >
                  {/* Status circle */}
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      item.status === 'done'
                        ? 'bg-green-100'
                        : item.status === 'unavailable'
                        ? 'bg-status-errorLight'
                        : 'bg-background-dark'
                    }`}
                  >
                    {item.status === 'done' ? (
                      <Feather name="check" size={13} color="#22C55E" />
                    ) : item.status === 'unavailable' ? (
                      <Feather name="x" size={13} color="#EF4444" />
                    ) : (
                      <View className="w-2 h-2 rounded-full bg-text-light" />
                    )}
                  </View>

                  {/* Item name */}
                  <Text className="flex-1 text-[14px] font-figtree text-text-dark">
                    {item.name}
                  </Text>

                  {/* Price / status */}
                  <Text
                    className={`text-[13px] font-figtree ${
                      item.status === 'done'
                        ? 'text-text-dark'
                        : item.status === 'unavailable'
                        ? 'text-status-error'
                        : 'text-text-light'
                    }`}
                  >
                    {item.price}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Substitution card — orange border */}
          <View className="border-2 border-secondary rounded-2xl p-4 bg-white">
            {/* Title row */}
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="alert-circle" size={16} color="#FF9F1C" />
              <Text className="text-[14px] font-gabarito text-text-dark">
                Your item is unavailable.
              </Text>
            </View>

            {/* Description */}
            <Text className="text-[12px] font-figtree text-text-gray leading-[18px] mb-4">
              Peak Milk Powder 400g is out of stock. David suggests this
              alternative:
            </Text>

            {/* Suggested product row */}
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden">
                <Image
                  source={PRODUCT_IMAGE}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[13px] font-gabarito text-text-dark mb-0.5">
                  Lano Milk Powder 400g
                </Text>
                <Text className="text-[12px] font-figtree-bold" style={{ color: '#22C55E' }}>
                  ₦2,100 (Saves ₦300)
                </Text>
              </View>
            </View>

            {/* Approve Alternative CTA */}
            <TouchableOpacity
              onPress={handleApprove}
              className="bg-primary rounded-xl py-3.5 items-center mb-3"
              activeOpacity={0.85}
            >
              <Text className="text-white text-[14px] font-figtree-bold">
                Approve Alternative
              </Text>
            </TouchableOpacity>

            {/* Row: Choose Another + Skip Item */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border border-border rounded-xl py-3.5 items-center"
                activeOpacity={0.75}
              >
                <Text className="text-[13px] font-figtree-bold text-text-dark">
                  Choose Another
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-xl py-3.5 items-center"
                style={{ backgroundColor: '#FEE2E2' }}
                activeOpacity={0.75}
              >
                <Text className="text-[13px] font-figtree-bold text-status-error">
                  Skip Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}