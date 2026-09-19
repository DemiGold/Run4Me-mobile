import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const services = [
  { id: 'shop-for-me', name: 'Shop for Me', icon: 'shopping-bag', bg: '#E6F3F5', color: '#006B75' },
  { id: 'pick-up-deliver', name: 'Pick Up & Deliver', icon: 'package', bg: '#FFF5E6', color: '#FF9F1C' },
  { id: 'run-errand', name: 'Run an Errand', icon: 'clipboard', bg: '#E6F3F5', color: '#006B75' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'activity', bg: '#FFF5E6', color: '#FF9F1C' },
  { id: 'food-groceries', name: 'Food & Groceries', icon: 'coffee', bg: '#E6F3F5', color: '#006B75' },
  { id: 'multiple-stops', name: 'Multiple Stops', icon: 'map-pin', bg: '#FFF5E6', color: '#FF9F1C' },
];

const favoriteStores = [
  { id: 1, name: 'Spar Lekki', subtitle: 'Supermarket' },
  { id: 2, name: 'Medplus', subtitle: 'Pharmacy' },
];

export default function CustomerHome() {
  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const hour = new Date().getHours();
  let greeting = 'Good afternoon';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header: location chip + bell */}
        <View className="flex-row items-center justify-between px-6 pt-5 pb-5">
          <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
            <Feather name="map-pin" size={14} color="#006B75" />
            <Text className="text-[13px] font-figtree-bold text-text-dark">
              Lekki Phase 1, Lagos
            </Text>
            <Feather name="chevron-down" size={14} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/notifications')}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
            activeOpacity={0.7}
          >
            <Feather name="bell" size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="px-6 pb-5">
          <Text className="text-[22px] font-gabarito text-text-dark">
            {greeting} 👋
          </Text>
          <Text className="text-[13px] font-figtree text-text-gray mt-1">
            What can we help you get done today?
          </Text>
        </View>

        {/* Promo Banner */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(errand)/create-errand/select-type',
              params: { promo: 'FIRST4ME' },
            })
          }
          className="mx-6 bg-primary rounded-2xl p-4 flex-row items-center"
          activeOpacity={0.9}
        >
          <View className="flex-1 pr-3">
            <Text className="text-white text-[15px] font-gabarito">
              Get ₦1,000 Off First Errand
            </Text>
            <Text className="text-white/80 text-[11px] font-figtree mt-1">
              Use code FIRST4ME at summary screen
            </Text>
          </View>

          <View className="w-11 h-11 rounded-xl bg-white/10 items-center justify-center">
            <Feather name="gift" size={22} color="#FF9F1C" />
          </View>
        </TouchableOpacity>

        {/* Services */}
        <View className="px-6 mt-6">
          <Text className="text-[16px] font-gabarito text-text-dark mb-4">
            Our Errand Services
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                className="w-[31%] bg-white border border-border rounded-2xl py-4 items-center mb-3"
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/(errand)/create-errand/select-type',
                    params: { type: service.id },
                  })
                }
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: service.bg }}
                >
                  <Feather
                    name={service.icon as any}
                    size={20}
                    color={service.color}
                  />
                </View>
                <Text className="text-[11px] font-figtree-bold text-text-dark text-center px-1">
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorite Stores */}
        <View className="px-6 mt-4">
          <Text className="text-[16px] font-gabarito text-text-dark mb-3">
            Your Favorite Stores
          </Text>

          <View className="flex-row gap-3">
            {favoriteStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                className="flex-1 flex-row items-center gap-2 border border-border rounded-2xl p-3 bg-white"
                activeOpacity={0.8}
              >
                <View className="w-9 h-9 rounded-full bg-primary-light items-center justify-center">
                  <Feather name="shopping-bag" size={16} color="#006B75" />
                </View>

                <View className="flex-1">
                  <Text className="text-[12px] font-figtree-bold text-text-dark">
                    {store.name}
                  </Text>
                  <Text className="text-[10px] font-figtree text-text-light">
                    {store.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Errands */}
        <View className="px-6 mt-6 pb-8">
          <Text className="text-[16px] font-gabarito text-text-dark mb-3">
            Recent Errands
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/activity')}
            className="flex-row items-center gap-3 border border-border rounded-2xl p-4 bg-white"
            activeOpacity={0.8}
          >
            <View className="w-2 h-2 rounded-full bg-secondary mt-1" />

            <View className="flex-1">
              <Text className="text-[13px] font-figtree-bold text-text-dark">
                Grocery Pickup from Spar
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                Delivered by Runner Tunde • ₦3,400
              </Text>
            </View>

            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}