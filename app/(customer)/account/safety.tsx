import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const ITEMS = [
  { id: 'share', title: 'Share Live Errand', desc: 'Send real-time map link to trusted friends.', icon: 'share-2' },
  { id: 'contact', title: 'Emergency Contact', desc: 'Add trusted details for single-tap alerts.', icon: 'phone' },
  { id: 'report', title: 'Report a User', desc: 'Submit safety or quality concerns instantly.', icon: 'alert-triangle' },
  { id: 'block', title: 'Block User', desc: 'Restrict runners or users from viewing your activity.', icon: 'slash' },
  { id: 'guidelines', title: 'Safety Guidelines', desc: 'Read rules for safe transactions and handovers.', icon: 'file-text' },
  { id: 'unsafe', title: 'Report Unsafe Location', desc: 'Alert our teams about hazardous areas.', icon: 'alert-octagon' },
];

export default function SafetyCenter() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full border border-border items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Safety Center</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Banner */}
          <View className="bg-primary rounded-2xl p-4 mb-5">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Feather name="shield" size={14} color="#FFFFFF" />
              <Text className="text-[15px] font-gabarito text-white">Your safety is our priority</Text>
            </View>
            <Text className="text-[12px] font-figtree text-white/85 leading-[18px]">
              Verified runners, instant transit insurance, secure escrow accounts, and live-tracking maps keep you safe.
            </Text>
          </View>

          {/* Emergency Assistance (red) */}
          <TouchableOpacity className="rounded-2xl p-4 mb-3 flex-row items-center gap-3" style={{ backgroundColor: '#FEE2E2' }} activeOpacity={0.75}>
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#EF4444' }}>
              <Feather name="alert-circle" size={18} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-gabarito" style={{ color: '#B91C1C' }}>Emergency Assistance</Text>
              <Text className="text-[11px] font-figtree" style={{ color: '#DC2626' }}>Instantly trigger crisis response services.</Text>
            </View>
          </TouchableOpacity>

          {/* Other items */}
          <View className="gap-3">
            {ITEMS.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.75}
                className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-white">
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center">
                  <Feather name={item.icon as any} size={18} color="#006B75" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-gabarito text-text-dark">{item.title}</Text>
                  <Text className="text-[11px] font-figtree text-text-gray leading-4 mt-0.5">{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}