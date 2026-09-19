import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type Tab = 'active' | 'completed' | 'cancelled';
type Status = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

type Activity = {
  id: string;
  time: string;
  title: string;
  runner: string;
  price: string;
  status: Status;
};

const ACTIVITIES: Activity[] = [
  { id: '1', time: 'Today, 11:30 AM', title: 'Grocery Pickup from Spar', runner: 'David', price: '₦3,400', status: 'ACTIVE' },
  { id: '2', time: 'Yesterday, 3:15 PM', title: 'Pharmacy Run (Medplus)', runner: 'Emmanuel', price: '₦2,100', status: 'COMPLETED' },
  { id: '3', time: '15 Nov, 10:00 AM', title: 'Document Delivery', runner: 'Tunde', price: '₦1,800', status: 'COMPLETED' },
  { id: '4', time: '12 Nov, 1:44 PM', title: 'Food Pickup (Cold Stone)', runner: 'Olu', price: '₦0', status: 'CANCELLED' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function CustomerActivity() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  const filtered = ACTIVITIES.filter((a) =>
    activeTab === 'active' ? a.status === 'ACTIVE'
    : activeTab === 'completed' ? a.status === 'COMPLETED'
    : a.status === 'CANCELLED'
  );

  const statusStyle = (status: Status) => {
    if (status === 'ACTIVE') return { bg: 'bg-secondary-light', text: 'text-secondary' };
    if (status === 'COMPLETED') return { bg: 'bg-primary-light', text: 'text-primary' };
    return { bg: 'bg-status-errorLight', text: 'text-status-error' };
  };

  const handleCardPress = (item: Activity) => {
    if (item.status === 'ACTIVE') {
      router.push({
        pathname: '/(errand)/live-tracking',
        params: { id: item.id },
      });
    }
    // Completed / Cancelled cards are non-tappable for now
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-5">
        <Text className="text-[26px] font-gabarito text-text-dark mb-5">
          Errand Activity
        </Text>

        {/* Tabs */}
        <View className="flex-row gap-2">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
              className={`px-4 py-2.5 rounded-full ${
                activeTab === tab.id ? 'bg-primary' : 'bg-background-dark'
              }`}
            >
              <Text
                className={`text-[13px] font-figtree-bold ${
                  activeTab === tab.id ? 'text-white' : 'text-text-dark'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
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
              <Feather name="inbox" size={40} color="#94A3B8" />
              <Text className="text-[13px] font-figtree text-text-light mt-3">
                No {activeTab} errands
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const style = statusStyle(item.status);
              const isActive = item.status === 'ACTIVE';

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleCardPress(item)}
                  activeOpacity={isActive ? 0.75 : 1}
                  disabled={!isActive}
                  className="border border-border rounded-2xl p-4 bg-white"
                >
                  {/* ═══ Row 1: time + status badge ═══ */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[11px] font-figtree text-text-light">
                      {item.time}
                    </Text>

                    <View className={`${style.bg} px-2.5 py-1 rounded`}>
                      <Text
                        className={`text-[9px] font-figtree-bold ${style.text} tracking-wider`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* ═══ Row 2: icon + title + subtitle ═══ */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                      <Feather name="shopping-bag" size={20} color="#006B75" />
                    </View>

                    <View className="flex-1">
                      <Text className="text-[15px] font-figtree-bold text-text-dark mb-0.5">
                        {item.title}
                      </Text>
                      <Text className="text-[11px] font-figtree text-text-gray">
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