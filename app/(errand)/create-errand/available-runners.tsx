import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.30;
const MAP_IMAGE = require('../../../assets/map.png');

type Runner = {
  id: string;
  name: string;
  rating: number;
  price: string;
  pickupMins: number;
  shoppingMins: number;
  completed: number;
  vehicle: string;
};

const AVAILABLE_RUNNERS: Runner[] = [
  {
    id: 'david',
    name: 'David Adeyemi',
    rating: 4.9,
    price: '₦2,500',
    pickupMins: 7,
    shoppingMins: 18,
    completed: 248,
    vehicle: 'Yamaha Scooter',
  },
  {
    id: 'amska',
    name: 'Amska Obi',
    rating: 4.8,
    price: '₦2,350',
    pickupMins: 9,
    shoppingMins: 16,
    completed: 183,
    vehicle: 'Honda Motorcycle',
  },
  {
    id: 'tunde',
    name: 'Tunde Bell',
    rating: 4.9,
    price: '₦2,700',
    pickupMins: 5,
    shoppingMins: 20,
    completed: 412,
    vehicle: 'Bajaj Tricycle',
  },
];

export default function AvailableRunners() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const [runners, setRunners] = useState<Runner[]>(AVAILABLE_RUNNERS);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleDecline = (id: string) => {
    setRunners((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAccept = (runner: Runner) => {
    router.replace({
      pathname: '/(errand)/create-errand/runner-secured',
      params: {
        ...params,
        runnerId: runner.id,
        runnerName: runner.name,
        runnerRating: String(runner.rating),
        runnerPrice: runner.price,
        runnerPickupMins: String(runner.pickupMins),
        runnerCompleted: String(runner.completed),
        runnerVehicle: runner.vehicle,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-subtle" edges={['top']}>
      {/* MAP STRIP */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        <View
          className="absolute rounded-full"
          style={{
            top: '45%',
            left: '32%',
            width: '38%',
            height: 3,
            backgroundColor: '#4CAF50',
            transform: [{ rotate: '18deg' }],
          }}
        />

        <View className="absolute top-[48%] left-[30%]">
          <View className="w-7 h-7 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={12} color="#FFFFFF" />
          </View>
        </View>

        <View className="absolute top-[32%] left-[62%]">
          <View className="w-7 h-7 rounded-full bg-secondary border-2 border-white items-center justify-center">
            <Feather name="home" size={12} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* BOTTOM SHEET */}
      <View className="flex-1 bg-white -mt-6 rounded-t-3xl pt-4">
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <Text className="text-[20px] font-gabarito text-text-dark mb-1">
              Available runners
            </Text>

            <Text className="text-[12px] font-figtree text-text-gray mb-5">
              Choose a verified runner for your errand.
            </Text>

            <View className="gap-3">
              {runners.length === 0 ? (
                <View className="items-center py-16">
                  <Feather name="users" size={40} color="#94A3B8" />
                  <Text className="text-[13px] font-figtree text-text-light mt-3">
                    No runners available right now
                  </Text>
                </View>
              ) : (
                runners.map((runner) => (
                  <View
                    key={runner.id}
                    className="border border-border rounded-2xl p-4 bg-white"
                  >
                    <View className="flex-row items-start gap-3 mb-4">
                      <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                        <Feather name="user" size={22} color="#94A3B8" />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 mb-1">
                          <Text className="text-[14px] font-gabarito text-text-dark">
                            {runner.name}
                          </Text>
                          <View className="w-4 h-4 rounded-full bg-green-500 items-center justify-center">
                            <Feather name="check" size={10} color="#FFFFFF" />
                          </View>
                        </View>

                        <Text className="text-[11px] font-figtree text-text-gray">
                          ⭐ {runner.rating} · Verified runner
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-[16px] font-gabarito text-primary mb-1">
                        {runner.price}
                      </Text>
                      <Text className="text-[11px] font-figtree text-text-gray">
                        Pickup in {runner.pickupMins} min · Shopping location in{' '}
                        {runner.shoppingMins} min
                      </Text>
                    </View>

                    <View className="gap-2">
                      <TouchableOpacity
                        onPress={() => handleDecline(runner.id)}
                        className="border border-border rounded-xl py-3 items-center"
                        activeOpacity={0.75}
                      >
                        <Text className="text-[13px] font-figtree-bold text-text-dark">
                          Decline
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleAccept(runner)}
                        className="bg-primary rounded-xl py-3 items-center"
                        activeOpacity={0.85}
                      >
                        <Text className="text-[13px] font-figtree-bold text-white">
                          Accept
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}