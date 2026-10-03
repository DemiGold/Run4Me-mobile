import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Customer Activity
//
// Figma: activity-screen
//   Tabs (Active / Completed / Cancelled) · activity cards with
//   time, status badge, title, runner, and price.
//
// MOCK: ACTIVITIES list below. Replace with paginated
// GET /errands?status=... when backend ships.
//
// ACTIVE cards tap into live-tracking. Completed and Cancelled
// cards are non-interactive for now.
// ─────────────────────────────────────────────────────────────

type Tab = 'active' | 'completed' | 'cancelled';
type Status = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

type Activity = {
  id: string;
  time: string;
  title: string;
  runner: string;
  price: string;
  status: Status;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const ACTIVITIES: Activity[] = [
  { id: '1', time: 'Today, 11:30 AM',      title: 'Grocery Pickup from Spar',   runner: 'David',     price: '₦3,400', status: 'ACTIVE',    icon: 'shopping-bag' },
  { id: '2', time: 'Yesterday, 3:15 PM',   title: 'Pharmacy Run (Medplus)',     runner: 'Emmanuel',  price: '₦2,100', status: 'COMPLETED', icon: 'activity' },
  { id: '3', time: '15 Nov, 10:00 AM',     title: 'Document Delivery',          runner: 'Tunde',     price: '₦1,800', status: 'COMPLETED', icon: 'file-text' },
  { id: '4', time: '12 Nov, 1:44 PM',      title: 'Food Pickup (Cold Stone)',   runner: 'Olu',       price: '₦0',     status: 'CANCELLED', icon: 'coffee' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'active',    label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

// ─── Status → styling ───
// ACTIVE    → orange accent (things happening now)
// COMPLETED → teal primary (success-neutral)
// CANCELLED → red (did not complete)
const STATUS_STYLES: Record<Status, { bg: string; text: string }> = {
  ACTIVE:    { bg: 'bg-accent-light',        text: 'text-accent' },
  COMPLETED: { bg: 'bg-primary-light',       text: 'text-primary' },
  CANCELLED: { bg: 'bg-status-errorLight',   text: 'text-status-error' },
};

export default function CustomerActivity() {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const filtered = ACTIVITIES.filter((a) =>
    activeTab === 'active'
      ? a.status === 'ACTIVE'
      : activeTab === 'completed'
      ? a.status === 'COMPLETED'
      : a.status === 'CANCELLED'
  );

  const handleCardPress = (item: Activity) => {
    if (item.status === 'ACTIVE') {
      router.push({
        pathname: '/(customer)/errand/live-tracking',
        params: { id: item.id },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header + Tabs */}
      <View className="px-6 pt-6 pb-5">
        <Text className="text-heading-sm font-gabarito text-ink mb-5">
          Errand Activity
        </Text>

        {/* Tab pills */}
        <View className="flex-row gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
                className={`
                  px-4 py-2.5 rounded-full
                  ${isActive ? 'bg-primary' : 'bg-background-dark'}
                `}
              >
                <Text
                  className={`
                    text-body-xs font-figtree-bold
                    ${isActive ? 'text-white' : 'text-ink'}
                  `}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-3">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Feather name="inbox" size={40} color={colors.subtle} />
              <Text className="text-body-xs font-figtree text-text-light mt-3">
                No {activeTab} errands
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const style = STATUS_STYLES[item.status];
              const isActive = item.status === 'ACTIVE';

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleCardPress(item)}
                  activeOpacity={isActive ? 0.75 : 1}
                  disabled={!isActive}
                  className="border border-border rounded-2xl p-4 bg-surface"
                >
                  {/* Row 1: time + status badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-caption-sm font-figtree text-text-light">
                      {item.time}
                    </Text>

                    <View className={`${style.bg} px-2.5 py-1 rounded`}>
                      <Text
                        className={`
                          text-micro font-figtree-bold tracking-wider
                          ${style.text}
                        `}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Row 2: icon + title + meta */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                      <Feather
                        name={item.icon}
                        size={20}
                        color={colors.primary}
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-body-sm font-figtree-bold text-ink mb-0.5">
                        {item.title}
                      </Text>
                      <Text className="text-caption-sm font-figtree text-muted">
                        Runner: {item.runner} • {item.price}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}