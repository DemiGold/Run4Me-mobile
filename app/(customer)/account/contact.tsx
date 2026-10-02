import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const CHANNELS = [
  { id: 'chat', title: 'Live Chat', subtitle: 'Instant conversation with support team 24/7.', icon: 'message-circle', color: 'teal' },
  { id: 'email', title: 'Email Us', subtitle: 'Get a thorough response in under 2 hours.', icon: 'mail', color: 'orange' },
  { id: 'twitter', title: 'X / Twitter', subtitle: 'Follow and DM us @Run4Me_NG.', icon: 'twitter', color: 'teal' },
  { id: 'instagram', title: 'Instagram', subtitle: 'Our community handle is @run4me.ng.', icon: 'instagram', color: 'orange' },
];

export default function GetInTouch() {
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full border border-border items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Get in Touch</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <Text className="text-[16px] font-gabarito text-text-dark mb-1.5">We are here to help!</Text>
          <Text className="text-[12px] font-figtree text-text-gray leading-[18px] mb-6">
            Reach out to our customer satisfaction team. We usually respond within minutes.
          </Text>

          <View className="gap-3">
            {CHANNELS.map((ch) => {
              const isTeal = ch.color === 'teal';
              const bg = isTeal ? '#E6F3F5' : '#FFF5E6';
              const iconColor = isTeal ? '#006B75' : '#FF9F1C';
              return (
                <TouchableOpacity key={ch.id} activeOpacity={0.75}
                  className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-white">
                  <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: bg }}>
                    <Feather name={ch.icon as any} size={20} color={iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-gabarito text-text-dark mb-0.5">{ch.title}</Text>
                    <Text className="text-[11px] font-figtree text-text-gray leading-4">{ch.subtitle}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}