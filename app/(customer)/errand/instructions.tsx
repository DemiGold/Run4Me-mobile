import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Instructions — step 6 of 8
//
// Figma: instructions
//   Free-text textarea · Attach Photo / Voice Note row · CTA.
//
// IMPORTANT: all wizard params accumulate forward. `items` is
// forwarded from items.tsx via budget; forgetting it here silently
// drops it before checkout.
//
// Attach Photo opens the native picker (photoCount tracked but not
// uploaded yet). Voice Note is a stub — expo-av wiring comes later.
// ─────────────────────────────────────────────────────────────

export default function ErrandInstructions() {
  const params = useLocalSearchParams<{
    type?: string;
    promo?: string;
    pickup?: string;
    dropoff?: string;
    items?: string;
    budget?: string;
    instructions?: string;
    photoCount?: string;
  }>();

  const [instructions, setInstructions] = useState(params.instructions ?? '');
  const [photoCount, setPhotoCount] = useState(
    params.photoCount ? parseInt(params.photoCount, 10) : 0
  );

  const handleAttachPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoCount((c) => c + result.assets.length);
    }
  };

  const handleVoiceNote = () => {
    // ─── MOCK: expo-av wiring comes in Phase 3 ───
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(customer)/errand/timeline',
      params: {
        type: params.type ?? '',
        promo: params.promo ?? '',
        pickup: params.pickup ?? '',
        dropoff: params.dropoff ?? '',
        items: params.items ?? '',   // ← forward the shopping list
        budget: params.budget ?? '',
        instructions,
        photoCount: String(photoCount),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={18} color={colors.ink} />
          </TouchableOpacity>

          <Text className="text-body font-gabarito text-ink">Instructions</Text>

          <Text className="text-body-xs font-figtree-bold text-primary">
            6<Text className="text-text-light font-figtree">/8</Text>
          </Text>
        </View>

        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="text-heading-sm font-gabarito text-ink mb-2 mt-2">
            Any special instructions?
          </Text>

          <Text className="text-body-xs font-figtree text-muted mb-5">
            Provide specific directions for finding shops, preferred
            substitutes, or delivery details.
          </Text>

          {/* Text Area */}
          <View
            className="border border-border rounded-2xl p-4 bg-surface mb-4"
            style={{ height: 160 }}
          >
            <TextInput
              className="flex-1 text-body-sm font-figtree text-ink"
              placeholder="Type your instructions here..."
              placeholderTextColor={colors.subtle}
              multiline
              textAlignVertical="top"
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Attach buttons row */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAttachPhoto}
              className="flex-1 border border-border rounded-2xl py-3.5 flex-row items-center justify-center gap-2 bg-surface"
              activeOpacity={0.75}
            >
              <Feather name="paperclip" size={16} color={colors.ink} />
              <Text className="text-body-xs font-figtree-bold text-ink">
                {photoCount > 0 ? `Photo (${photoCount})` : 'Attach Photo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleVoiceNote}
              className="flex-1 border border-border rounded-2xl py-3.5 flex-row items-center justify-center gap-2 bg-surface"
              activeOpacity={0.75}
            >
              <Feather name="mic" size={16} color={colors.ink} />
              <Text className="text-body-xs font-figtree-bold text-ink">
                Voice Note
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="px-6 pb-6 pt-3">
          <Button variant="primary" fullWidth onPress={handleContinue}>
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}