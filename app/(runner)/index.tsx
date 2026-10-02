// app/(runner)/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

// Fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type Errand = {
  id: string;
  tag: string;
  price: string;
  pickup: string;
  dropoff: string;
  distance: string;
  eta: string;
};

// TODO: replace with data from GET /runner/errands-nearby once that endpoint exists
const NEARBY_ERRANDS: Errand[] = [
  {
    id: '1',
    tag: 'SHOP FOR ME',
    price: '₦2,500',
    pickup: 'Shoprite, Lekki Phase 1',
    dropoff: '12 Admiralty Way, Lekki',
    distance: '4.2 km',
    eta: '35 mins est.',
  },
  {
    id: '2',
    tag: 'PHARMACY',
    price: '₦1,800',
    pickup: 'Medplus, Admiralty Way',
    dropoff: 'Block 3, Lekki Phase 1',
    distance: '2.1 km',
    eta: '15 mins est.',
  },
];

export default function RunnerHome() {
  const [isOnline, setIsOnline] = useState(true);
  const [showAllErrands, setShowAllErrands] = useState(false);
  const user = useAuthStore((state) => state.user);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const displayedErrands = showAllErrands ? NEARBY_ERRANDS : NEARBY_ERRANDS.slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
              <Feather name="user" size={20} color="#94A3B8" />
            </View>
            <View>
              <Text className="text-body-sm font-figtree text-text-gray">Welcome back,</Text>
              <Text className="text-[16px] font-gabarito text-text-dark">
                {user?.name ?? 'David Adeyemi'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-body-sm font-figtree-bold text-primary">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#E2E8F0', true: '#006B75' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-8">
          <View className="w-[48%] border border-border rounded-2xl p-4 bg-white">
            <Text className="text-caption font-figtree text-text-gray mb-2">Today's Earnings</Text>
            <Text className="text-[18px] font-gabarito text-primary font-bold">₦12,500</Text>
          </View>
          <View className="w-[48%] border border-border rounded-2xl p-4 bg-white">
            <Text className="text-caption font-figtree text-text-gray mb-2">Today's Errands</Text>
            <Text className="text-[18px] font-gabarito text-text-dark">5 Errands</Text>
          </View>
          <View className="w-[48%] border border-border rounded-2xl p-4 bg-white">
            <Text className="text-caption font-figtree text-text-gray mb-2">Current Rating</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[18px] font-gabarito text-text-dark">4.9</Text>
              <Feather name="star" size={16} color="#FF9F1C" />
            </View>
          </View>
          <View className="w-[48%] border border-border rounded-2xl p-4 bg-white">
            <Text className="text-caption font-figtree text-text-gray mb-2">Current Rank</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[18px] font-gabarito text-secondary">Gold</Text>
              <Feather name="award" size={16} color="#FF9F1C" />
            </View>
          </View>
        </View>

        {/* Available Errands Nearby */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[18px] font-gabarito text-text-dark">
            Available Errands Nearby ({NEARBY_ERRANDS.length})
          </Text>
          {NEARBY_ERRANDS.length > 2 && (
            <TouchableOpacity onPress={() => setShowAllErrands(!showAllErrands)}>
              <Text className="text-body-sm font-figtree-bold text-primary">
                {showAllErrands ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="gap-3">
          {displayedErrands.map((errand) => (
            <ErrandCard key={errand.id} {...errand} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ErrandCard({ id, tag, price, pickup, dropoff, distance, eta }: Errand) {
  return (
    <TouchableOpacity className="border border-border rounded-2xl p-4 bg-white" activeOpacity={0.8}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-primary-light px-2.5 py-1 rounded">
          <Text className="text-[10px] font-figtree-bold text-primary tracking-wider">{tag}</Text>
        </View>
        <Text className="text-[16px] font-gabarito text-secondary font-bold">{price}</Text>
      </View>

      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-2 h-2 rounded-full bg-primary" />
        <Text className="text-body-sm font-figtree text-text-dark flex-1">{pickup}</Text>
      </View>

      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-2 h-2 rounded-full bg-secondary" />
        <Text className="text-body-sm font-figtree text-text-dark flex-1">{dropoff}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-caption font-figtree text-text-gray">
          {distance} • {eta}
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-xl px-5 py-2.5"
          onPress={() =>
            router.push({
              pathname: '/(runner)/modals/errand-detail',   // 👈 changed
              params: { id },
            })
          }
        >
          <Text className="text-white text-body-sm font-figtree-bold">View Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}