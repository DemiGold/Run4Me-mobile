import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type Timeline = 'now' | 'later';

export default function DeliveryPreference() {
  const {
    type,
    promo,
    pickup,
    dropoff,
    budget,
    instructions,
  } = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
    instructions?: string;
  }>();

  const [selected, setSelected] = useState<Timeline>('later');
  const [date] = useState('Oct 26, 2026');
  const [time] = useState('2:00 PM');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/checkout',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: pickup ?? '',
        dropoff: dropoff ?? '',
        budget: budget ?? '',
        instructions: instructions ?? '',
        timeline: selected,
        scheduledDate: selected === 'later' ? date : '',
        scheduledTime: selected === 'later' ? time : '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[15px] font-gabarito text-text-dark">
          Delivery Preference
        </Text>

        <Text className="text-[13px] font-figtree-bold text-primary">
          7<Text className="text-text-light font-figtree font-normal">/8</Text>
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Title */}
        <Text className="text-[20px] font-gabarito text-text-dark mb-2 mt-2">
          Choose your timeline
        </Text>

        <Text className="text-[13px] font-figtree text-text-gray leading-5 mb-6">
          When do you want your Errand Runner to execute this task?
        </Text>

        {/* Option 1: Deliver Now */}
        <TouchableOpacity
          onPress={() => setSelected('now')}
          activeOpacity={0.8}
          className={`rounded-2xl p-4 flex-row items-center gap-3 mb-3 ${
            selected === 'now'
              ? 'border-2 border-primary bg-primary-light'
              : 'border border-border bg-white'
          }`}
        >
          <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center">
            <Feather name="zap" size={18} color="#006B75" />
          </View>

          <View className="flex-1">
            <Text className="text-[14px] font-gabarito text-text-dark">
              Deliver Now
            </Text>
            <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
              Instantly assign to the closest runner
            </Text>
          </View>

          {/* Radio/Check indicator */}
          {selected === 'now' ? (
            <Feather name="check-circle" size={22} color="#006B75" />
          ) : (
            <View className="w-5 h-5 rounded-full border-2 border-border-light" />
          )}
        </TouchableOpacity>

        {/* Option 2: Schedule for Later */}
        <TouchableOpacity
          onPress={() => setSelected('later')}
          activeOpacity={0.8}
          className={`rounded-2xl p-4 mb-3 ${
            selected === 'later'
              ? 'border-2 border-primary bg-primary-light'
              : 'border border-border bg-white'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-secondary-light items-center justify-center">
              <Feather name="calendar" size={18} color="#FF9F1C" />
            </View>

            <View className="flex-1">
              <Text className="text-[14px] font-gabarito text-text-dark">
                Schedule for Later
              </Text>
              <Text className="text-[11px] font-figtree text-text-gray mt-0.5">
                Choose a convenient time window
              </Text>
            </View>

            {selected === 'later' ? (
              <Feather name="check-circle" size={22} color="#006B75" />
            ) : (
              <View className="w-5 h-5 rounded-full border-2 border-border-light" />
            )}
          </View>

          {/* Date + Time pills (only shown when Schedule is selected) */}
          {selected === 'later' && (
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                <Feather name="calendar" size={14} color="#475569" />
                <Text className="text-[12px] font-figtree text-text-dark">
                  {date}
                </Text>
              </View>
              <View className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                <Feather name="clock" size={14} color="#475569" />
                <Text className="text-[12px] font-figtree text-text-dark">
                  {time}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-[14px] font-gabarito tracking-wider">
            CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}