import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const { width } = Dimensions.get('window');
const MAP_IMAGE = require('@/assets/map.png');

// Mock errand data — will come from API once endpoint lands
const ACTIVE_ERRAND = {
  id: '1',
  customer: {
    name: 'Chioma Nwachukwu',
    location: 'Lekki Phase 1',
    phone: '+2348123456789',
  },
  pickup: 'Shoprite Lekki',
  dropoff: '12 Admiralty Way, Lekki',
  shoppingList: [
    '2 Loaves of Fresh Sliced Wheat Bread',
    '1 Carton of Full Cream Milk (1L)',
    '1 Pack of Premium Spaghetti (500g)',
  ],
  specialInstructions:
    'Please check dates carefully. Call if brand is out of stock.',
};

// 4 steps — matching Figma exactly
const STEPS = [
  'Navigate to Pickup',
  "I've Arrived at Store",
  'Start Errand',
  'Shopping / Purchase in Progress',
];

export default function ActiveErrand() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [currentStep, setCurrentStep] = useState(2); // step 3 = "Start Errand"

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(runner)');
    }
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      ACTIVE_ERRAND.pickup
    )}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${ACTIVE_ERRAND.customer.phone}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1 w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[16px] font-gabarito text-text-dark">Active Errand</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Full-width map — bleeds edge to edge */}
        <TouchableOpacity
          onPress={handleNavigate}
          className="w-full mb-6"
          activeOpacity={0.9}
          style={{ height: width * 0.45 }}
        >
          <Image source={MAP_IMAGE} className="w-full h-full" resizeMode="cover" />

          {/* Pickup pin (teal) */}
          <View className="absolute top-[40%] left-[42%]">
            <View className="w-7 h-7 rounded-full bg-primary border-2 border-white items-center justify-center">
              <Feather name="shopping-bag" size={13} color="#FFFFFF" />
            </View>
          </View>

          {/* Dropoff pin (orange) */}
          <View className="absolute top-[65%] left-[65%]">
            <View className="w-7 h-7 rounded-full bg-secondary border-2 border-white items-center justify-center">
              <Feather name="flag" size={13} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <View className="px-6 pb-6">
          {/* Progress Checklist */}
          <Text className="text-[11px] font-figtree-bold text-text-light uppercase tracking-wider mb-3">
            Progress Checklist
          </Text>

          <View className="mb-6">
            {STEPS.map((label, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <View key={index} className="flex-row items-start">
                  {/* Circle + connector */}
                  <View className="items-center mr-3">
                    <View
                      className={`w-5 h-5 rounded-full items-center justify-center ${
                        isDone
                          ? 'bg-primary'
                          : isCurrent
                          ? 'bg-white border-2 border-primary'
                          : 'bg-white border-2 border-border-light'
                      }`}
                    >
                      {isDone ? (
                        <Feather name="check" size={11} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <View className="w-2 h-2 rounded-full bg-primary" />
                      ) : null}
                    </View>
                    {index < STEPS.length - 1 && (
                      <View
                        className={`w-0.5 h-5 ${
                          isDone ? 'bg-primary' : 'bg-border-light'
                        }`}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <View className="flex-1 pt-0.5 pb-4 flex-row items-center justify-between">
                    <Text
                      className={`text-[13px] ${
                        isDone
                          ? 'font-figtree text-text-gray'
                          : isCurrent
                          ? 'font-figtree-bold text-text-dark'
                          : 'font-figtree text-text-light'
                      }`}
                    >
                      {index + 1}. {label}
                    </Text>
                    {isCurrent && (
                      <Text className="text-[11px] font-figtree text-primary">
                        (Current Step)
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Customer & Errand Details */}
          <Text className="text-[13px] font-gabarito text-text-dark mb-3">
            Customer & Errand Details
          </Text>

          <View className="border border-border rounded-2xl p-4 bg-white mb-5">
            {/* Customer row */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
                <Text className="text-[15px] font-gabarito text-primary">
                  {ACTIVE_ERRAND.customer.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-gabarito text-text-dark">
                  {ACTIVE_ERRAND.customer.name}
                </Text>
                <Text className="text-[12px] font-figtree text-text-gray">
                  Customer • {ACTIVE_ERRAND.customer.location}
                </Text>
              </View>
            </View>

            {/* Shopping List */}
            <Text className="text-[11px] font-figtree-bold text-text-light uppercase tracking-wider mb-2">
              Shopping List
            </Text>
            <View className="mb-4">
              {ACTIVE_ERRAND.shoppingList.map((item, idx) => (
                <View key={idx} className="flex-row items-start gap-2 mb-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <Text className="flex-1 text-[13px] font-figtree text-text-dark">
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Special Instructions */}
            <Text className="text-[11px] font-figtree-bold text-text-light uppercase tracking-wider mb-1">
              Special Instructions
            </Text>
            <Text className="text-[12px] font-figtree text-text-gray leading-5">
              {ACTIVE_ERRAND.specialInstructions}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-6 pt-3 bg-white border-t border-border gap-3">
        {/* Chat + Call row */}
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 border border-border rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Feather name="message-circle" size={16} color="#0F172A" />
            <Text className="text-[13px] font-figtree-bold text-text-dark">
              Chat with Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCall}
            className="flex-1 border border-border rounded-xl py-3 flex-row items-center justify-center gap-2"
          >
            <Feather name="phone" size={16} color="#0F172A" />
            <Text className="text-[13px] font-figtree-bold text-text-dark">
              Call Customer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleNextStep}
          activeOpacity={0.85}
        >
          <Text className="text-white text-[16px] font-gabarito">
            {currentStep === STEPS.length - 1 ? 'Complete Errand' : 'Start Errand'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}