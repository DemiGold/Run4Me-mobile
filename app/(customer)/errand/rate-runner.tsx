import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const RATING_CATEGORIES = [
  { id: 'speed', label: 'Delivery Speed' },
  { id: 'communication', label: 'Communication' },
  { id: 'professionalism', label: 'Professionalism' },
];

const TIP_OPTIONS = [
  { id: '500', label: '₦500' },
  { id: '1000', label: '₦1,000' },
  { id: '2000', label: '₦2,000' },
  { id: 'custom', label: 'Custom' },
];

export default function RateRunner() {
  const params = useLocalSearchParams<{
    id?: string;
    pickup?: string;
    dropoff?: string;
  }>();

  const [overallRating, setOverallRating] = useState(5);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    speed: 5,
    communication: 5,
    professionalism: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [selectedTip, setSelectedTip] = useState('1000');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = () => {
    // TODO: POST /errands/:id/rate with { overallRating, categoryRatings, feedback, tip }
    // After submission, return to customer home
    router.replace('/(customer)');
  };

  const updateCategory = (id: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [id]: value }));
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
            Rate Runner
          </Text>

          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Title */}
            <Text className="text-[20px] font-gabarito text-text-dark text-center mt-2 mb-5">
              How was your experience?
            </Text>

            {/* Overall rating — 5 large stars */}
            <View className="flex-row justify-center gap-1.5 mb-7">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setOverallRating(star)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[34px]">
                    {star <= overallRating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category ratings card */}
            <View className="border border-border rounded-2xl p-4 bg-white mb-5">
              {RATING_CATEGORIES.map((cat, index) => {
                const isLast = index === RATING_CATEGORIES.length - 1;
                const rating = categoryRatings[cat.id] ?? 5;

                return (
                  <View
                    key={cat.id}
                    className={`flex-row items-center justify-between py-3 ${
                      !isLast ? 'border-b border-border' : ''
                    }`}
                  >
                    <Text className="text-[14px] font-figtree-bold text-text-dark">
                      {cat.label}
                    </Text>

                    <View className="flex-row gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => updateCategory(cat.id, star)}
                          activeOpacity={0.7}
                        >
                          <Text className="text-[16px]">
                            {star <= rating ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Feedback textarea */}
            <View className="border border-border rounded-2xl bg-white mb-6" style={{ height: 110 }}>
              <TextInput
                className="flex-1 p-4 text-[13px] font-figtree text-text-dark"
                placeholder="Add a comment or feedback (optional)..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={feedback}
                onChangeText={setFeedback}
              />
            </View>

            {/* Tip section */}
            <Text className="text-[14px] font-gabarito text-text-dark mb-3">
              Support David with a Tip
            </Text>

            <View className="flex-row gap-2 flex-wrap mb-4">
              {TIP_OPTIONS.map((tip) => {
                const isSelected = selectedTip === tip.id;
                return (
                  <TouchableOpacity
                    key={tip.id}
                    onPress={() => setSelectedTip(tip.id)}
                    activeOpacity={0.75}
                    className={`rounded-full px-5 py-2.5 ${
                      isSelected
                        ? 'bg-primary'
                        : 'bg-white border border-border'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-figtree-bold ${
                        isSelected ? 'text-white' : 'text-text-dark'
                      }`}
                    >
                      {tip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="px-6 pb-6 pt-3 bg-white">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary rounded-2xl py-4 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-white text-[14px] font-gabarito tracking-wider">
              Submit Rating
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}