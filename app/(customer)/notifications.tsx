import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  color: 'teal' | 'orange' | 'green';
  needsAction?: boolean;
  actionAmount?: string;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Substitution Needed',
    desc: "Your Runner says 'Ariel Detergent 1kg' is out of stock. Would you prefer 'So Klin 1kg' instead?",
    time: 'Just now',
    icon: 'refresh-cw',
    color: 'teal',
    needsAction: true,
    actionAmount: '₦1,800',
  },
  {
    id: '2',
    title: 'Runner Accepted Errand',
    desc: 'Runner Tunde has accepted your Grocery Pickup request. He is on his way to Spar Lekki.',
    time: '5 mins ago',
    icon: 'user-check',
    color: 'teal',
  },
  {
    id: '3',
    title: 'Runner has arrived at store',
    desc: 'Tunde has checked in at Spar Lekki and is now shopping.',
    time: '12 mins ago',
    icon: 'map-pin',
    color: 'orange',
  },
  {
    id: '4',
    title: 'Receipt Uploaded — Review',
    desc: 'Runner uploaded invoice of ₦14,200. Check to confirm final pricing.',
    time: '25 mins ago',
    icon: 'file-text',
    color: 'teal',
  },
  {
    id: '5',
    title: 'Your errand is on the way!',
    desc: 'Errand dispatched. Watch real-time delivery map of Lekki Phase 1.',
    time: '40 mins ago',
    icon: 'navigation',
    color: 'orange',
  },
  {
    id: '6',
    title: 'Errand completed!',
    desc: 'Tunde delivered your items safely. Please verify and rate your experience.',
    time: '1 hour ago',
    icon: 'check-circle',
    color: 'teal',
  },
  {
    id: '7',
    title: 'New Errand Nearby (Runner)',
    desc: 'A user requested a pharmacy run within 1.5 km (₦2,500 payout).',
    time: '2 hours ago',
    icon: 'bell',
    color: 'orange',
  },
];

export default function Notifications() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  const bgFor = (color: string) =>
    color === 'orange' ? '#FFF5E6' : color === 'green' ? '#DCFCE7' : '#E6F3F5';

  const fgFor = (color: string) =>
    color === 'orange' ? '#FF9F1C' : color === 'green' ? '#16A34A' : '#006B75';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-5 pb-5">
        <Text className="text-[24px] font-gabarito text-text-dark">
          Notifications
        </Text>

        <TouchableOpacity
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          activeOpacity={0.7}
        >
          <Feather name="check-square" size={16} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-3">
          {NOTIFICATIONS.map((n) => (
            <View
              key={n.id}
              className={`rounded-2xl p-4 bg-white ${
                n.needsAction ? 'border-2 border-primary' : 'border border-border'
              }`}
            >
              {/* Top row: icon + title/time */}
              <View className="flex-row items-start gap-3">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: bgFor(n.color) }}
                >
                  <Feather name={n.icon as any} size={15} color={fgFor(n.color)} />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="flex-1 text-[13px] font-gabarito text-text-dark pr-3">
                      {n.title}
                    </Text>
                    <Text className="text-[10px] font-figtree text-text-light">
                      {n.time}
                    </Text>
                  </View>

                  <Text className="text-[12px] font-figtree text-text-gray leading-[18px]">
                    {n.desc}
                  </Text>
                </View>
              </View>

              {/* Action buttons (Substitution only) */}
              {n.needsAction && (
                <View className="flex-row gap-2 mt-4">
                  <TouchableOpacity
                    className="flex-1 border border-border rounded-xl py-3 items-center"
                    activeOpacity={0.75}
                  >
                    <Text className="text-[12px] font-figtree-bold text-text-dark">
                      Cancel Order
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-primary rounded-xl py-3 items-center"
                    activeOpacity={0.85}
                  >
                    <Text className="text-[12px] font-figtree-bold text-white">
                      Approve ({n.actionAmount})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}