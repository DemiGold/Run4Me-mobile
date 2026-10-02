import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function ErrandInstructions() {
  const { type, promo, pickup, dropoff, budget } = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    budget?: string;
  }>();

  const [instructions, setInstructions] = useState(
    'Please ask the security guard at the gate for Block 12 once you arrive. If the milk is out of stock, call me.'
  );

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/timeline',
      params: {
        type: type ?? '',
        promo: promo ?? '',
        pickup: pickup ?? '',
        dropoff: dropoff ?? '',
        budget: budget ?? '',
        instructions,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
          >
            <Feather name="arrow-left" size={18} color="#0F172A" />
          </TouchableOpacity>

          <Text className="text-[15px] font-gabarito text-text-dark">
            Instructions
          </Text>

          <Text className="text-[13px] font-figtree-bold text-primary">
            6<Text className="text-text-light font-figtree font-normal">/8</Text>
          </Text>
        </View>

        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="text-[20px] font-gabarito text-text-dark mb-2 mt-2">
            Any special instructions?
          </Text>

          <Text className="text-[13px] font-figtree text-text-gray leading-5 mb-5">
            Provide specific directions for finding shops, preferred
            substitutes, or delivery details.
          </Text>

          {/* Text Area */}
          <View className="border border-border rounded-2xl p-4 bg-white mb-4" style={{ height: 160 }}>
            <TextInput
              className="flex-1 text-[14px] font-figtree text-text-dark"
              placeholder="Type your instructions here..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Attach buttons row */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-border rounded-2xl py-3.5 flex-row items-center justify-center gap-2 bg-white"
              activeOpacity={0.75}
            >
              <Feather name="paperclip" size={16} color="#0F172A" />
              <Text className="text-[13px] font-figtree-bold text-text-dark">
                Attach Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 border border-border rounded-2xl py-3.5 flex-row items-center justify-center gap-2 bg-white"
              activeOpacity={0.75}
            >
              <Feather name="mic" size={16} color="#0F172A" />
              <Text className="text-[13px] font-figtree-bold text-text-dark">
                Voice Note
              </Text>
            </TouchableOpacity>
          </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}