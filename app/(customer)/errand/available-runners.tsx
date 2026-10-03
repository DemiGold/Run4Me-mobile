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

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Available Runners
//
// Shown after finding-runner. Customer picks a runner from the
// list, then routes to runner-secured with the choice.
//
// Figma: available-runners
//   Map strip (30% height) · runner cards with price + ETA +
//   Decline / Accept buttons.
//
// MOCK: AVAILABLE_RUNNERS below. Replace with
// GET /errands/:id/runners.
// ─────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.30;
const MAP_IMAGE = require('@/assets/map.png');

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
    items?: string;
    budget?: string;
    instructions?: string;
    timeline?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  const [runners, setRunners] = useState<Runner[]>(AVAILABLE_RUNNERS);

  const handleDecline = (id: string) => {
    setRunners((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAccept = (runner: Runner) => {
    router.replace({
      pathname: '/(customer)/errand/runner-secured',
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
    <SafeAreaView className="flex-1 bg-background-subtle" edges={['top', 'left', 'right']}>
      {/* ─── Map strip ─── */}
      <View className="w-full" style={{ height: MAP_HEIGHT }}>
        <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

        {/* Route line */}
        <View
          className="absolute rounded-full"
          style={{
            top: '45%',
            left: '32%',
            width: '38%',
            height: 3,
            backgroundColor: colors.success,
            transform: [{ rotate: '18deg' }],
          }}
        />

        {/* Pickup pin */}
        <View className="absolute top-[48%] left-[30%]">
          <View className="w-7 h-7 rounded-full bg-primary border-2 border-white items-center justify-center">
            <Feather name="shopping-bag" size={12} color={colors.white} />
          </View>
        </View>

        {/* Dropoff pin */}
        <View className="absolute top-[32%] left-[62%]">
          <View className="w-7 h-7 rounded-full bg-accent border-2 border-white items-center justify-center">
            <Feather name="home" size={12} color={colors.white} />
          </View>
        </View>
      </View>

      {/* ─── Bottom sheet ─── */}
      <View className="flex-1 bg-surface -mt-6 rounded-t-3xl pt-4">
        {/* Drag handle */}
        <View className="w-10 h-1 bg-border-light rounded-full self-center mb-5" />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <Text className="text-title font-gabarito text-ink mb-1">
              Available runners
            </Text>

            <Text className="text-caption font-figtree text-muted mb-5">
              Choose a verified runner for your errand.
            </Text>

            <View className="gap-3">
              {runners.length === 0 ? (
                <View className="items-center py-16">
                  <Feather name="users" size={40} color={colors.subtle} />
                  <Text className="text-body-xs font-figtree text-text-light mt-3">
                    No runners available right now
                  </Text>
                </View>
              ) : (
                runners.map((runner) => (
                  <View
                    key={runner.id}
                    className="border border-border rounded-2xl p-4 bg-surface"
                  >
                    {/* Top row: avatar + name + verified badge */}
                    <View className="flex-row items-start gap-3 mb-4">
                      <View className="w-12 h-12 rounded-full bg-background-dark items-center justify-center overflow-hidden">
                        <Feather name="user" size={22} color={colors.subtle} />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 mb-1">
                          <Text className="text-body-sm font-gabarito-bold text-ink">
                            {runner.name}
                          </Text>
                          <View className="w-4 h-4 rounded-full bg-status-success items-center justify-center">
                            <Feather name="check" size={10} color={colors.white} />
                          </View>
                        </View>

                        <Text className="text-caption-sm font-figtree text-muted">
                          ⭐ {runner.rating} · Verified runner
                        </Text>
                      </View>
                    </View>

                    {/* Price + ETA */}
                    <View className="mb-4">
                      <Text className="text-body font-gabarito-bold text-primary mb-1">
                        {runner.price}
                      </Text>
                      <Text className="text-caption-sm font-figtree text-muted">
                        Pickup in {runner.pickupMins} min · Shopping location in{' '}
                        {runner.shoppingMins} min
                      </Text>
                    </View>

                    {/* Actions */}
                    <View className="gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onPress={() => handleDecline(runner.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onPress={() => handleAccept(runner)}
                      >
                        Accept
                      </Button>
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