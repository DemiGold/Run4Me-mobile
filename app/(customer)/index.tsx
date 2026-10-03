import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Customer Home
//
// Figma: customer-home
//   Location pill · bell · greeting · promo banner ·
//   services grid (2 rows of 3) · favorite stores · recent errand.
//
// Real-time greeting ticks every minute so it stays correct across
// the noon / 5pm boundary while the app is open.
// ─────────────────────────────────────────────────────────────

type Service = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tint: string;
  color: string;
};

// Figma splits the grid into two rows (grid-row-1, grid-row-2).
// Tint alternates teal / orange per the design.
const SERVICE_ROWS: Service[][] = [
  [
    { id: 'shop-for-me',     name: 'Shop for Me',       icon: 'shopping-bag', tint: colors.primaryLight, color: colors.primary },
    { id: 'pick-up-deliver', name: 'Pick Up & Deliver', icon: 'package',      tint: colors.accentLight,  color: colors.accent  },
    { id: 'run-errand',      name: 'Run an Errand',     icon: 'clipboard',    tint: colors.primaryLight, color: colors.primary },
  ],
  [
    { id: 'pharmacy',        name: 'Pharmacy',          icon: 'activity',     tint: colors.accentLight,  color: colors.accent  },
    { id: 'food-groceries',  name: 'Food & Groceries',  icon: 'coffee',       tint: colors.primaryLight, color: colors.primary },
    { id: 'multiple-stops',  name: 'Multiple Stops',    icon: 'map-pin',      tint: colors.accentLight,  color: colors.accent  },
  ],
];

// ─── MOCK data — replace with real data when backend ships ───
const FAVORITE_STORES = [
  { id: 1, name: 'Spar Lekki', subtitle: 'Supermarket', icon: 'shopping-bag' as const },
  { id: 2, name: 'Medplus',    subtitle: 'Pharmacy',    icon: 'activity'     as const },
];

const RECENT_ERRAND = {
  id: 'e-1',
  title: 'Grocery Pickup from Spar',
  meta: 'Delivered by Runner Tunde • ₦3,400',
};

// ─── Real-time greeting ───
const getGreeting = (d: Date): string => {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Figma: drop shadow x=0 y=4 blur=12 spread=0 #000000 @ 3.14%
const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.0314,
  shadowRadius: 12,
  elevation: 2,
};

export default function CustomerHome() {
  // Live clock — updates every minute so the greeting stays correct
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const greeting = getGreeting(now);

  const goToService = (serviceId: string) =>
    router.push({
      pathname: '/(customer)/errand/select-type',
      params: { type: serviceId },
    });

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ─── Top Row: location pill + bell ─── */}
        <View className="flex-row items-center justify-between px-6 pt-5 pb-5">
          <TouchableOpacity
            className="flex-row items-center gap-1.5"
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/account/saved-addresses')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text className="text-body-xs font-figtree-bold text-ink">
              Lekki Phase 1, Lagos
            </Text>
            <Feather name="chevron-down" size={14} color={colors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/notifications')}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="bell" size={16} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ─── Greeting ─── */}
        <View className="px-6 pb-5">
          <Text className="text-heading font-gabarito text-ink">
            {greeting} 👋
          </Text>
          <Text className="text-body-xs font-figtree text-muted mt-1">
            What can we help you get done today?
          </Text>
        </View>

        {/* ─── Promo Banner ─── */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(customer)/errand/select-type',
              params: { promo: 'FIRST4ME' },
            })
          }
          className="mx-6 bg-primary rounded-2xl p-4 flex-row items-center gap-3"
          activeOpacity={0.9}
        >
          <View className="flex-1 gap-1.5">
            <Text className="text-white text-body-sm font-gabarito">
              Get ₦1,000 Off First Errand
            </Text>
            <Text className="text-white/80 text-caption font-figtree">
              Use code FIRST4ME at summary screen
            </Text>
          </View>

          <View className="w-11 h-11 rounded-xl bg-white/10 items-center justify-center">
            <Feather name="gift" size={22} color={colors.accent} />
          </View>
        </TouchableOpacity>

        {/* ─── Errand Services ─── */}
        <View className="px-6 mt-6">
          <Text className="text-body font-gabarito text-ink mb-4">
            Our Errand Services
          </Text>

          <View className="gap-3">
            {SERVICE_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} className="flex-row gap-3">
                {row.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => goToService(service.id)}
                    activeOpacity={0.85}
                    className="flex-1 bg-surface rounded-2xl p-3 items-center gap-2.5"
                    style={cardShadow}
                  >
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: service.tint }}
                    >
                      <Feather
                        name={service.icon}
                        size={20}
                        color={service.color}
                      />
                    </View>
                    <Text className="text-micro font-figtree-bold text-ink text-center">
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* ─── Favorite Stores ─── */}
        <View className="px-6 mt-6">
          <Text className="text-body font-gabarito text-ink mb-3">
            Your Favorite Stores
          </Text>

          <View className="flex-row gap-3">
            {FAVORITE_STORES.map((store) => (
              <TouchableOpacity
                key={store.id}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/errand/select-type',
                    params: { type: 'shop-for-me', store: store.name },
                  })
                }
                className="flex-1 flex-row items-center gap-2 border border-border rounded-2xl p-3 bg-surface"
                activeOpacity={0.85}
              >
                <View className="w-9 h-9 rounded-full bg-primary-light items-center justify-center">
                  <Feather name={store.icon} size={16} color={colors.primary} />
                </View>

                <View className="flex-1">
                  <Text className="text-caption font-figtree-bold text-ink">
                    {store.name}
                  </Text>
                  <Text className="text-micro font-figtree text-text-light mt-0.5">
                    {store.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Recent Errands ─── */}
        <View className="px-6 mt-6">
          <Text className="text-body font-gabarito text-ink mb-3">
            Recent Errands
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/activity')}
            className="flex-row items-center gap-3 border border-border rounded-2xl p-4 bg-surface"
            activeOpacity={0.85}
          >
            <View className="w-2 h-2 rounded-full bg-accent" />

            <View className="flex-1">
              <Text className="text-body-xs font-figtree-bold text-ink">
                {RECENT_ERRAND.title}
              </Text>
              <Text className="text-micro font-figtree text-muted mt-0.5">
                {RECENT_ERRAND.meta}
              </Text>
            </View>

            <Feather name="chevron-right" size={18} color={colors.subtle} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}