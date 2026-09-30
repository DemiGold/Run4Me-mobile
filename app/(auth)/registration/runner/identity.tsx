import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

// Import auth store
import { useAuthStore } from '@/stores/authStore';

export default function IdentityVerification() {
  const [nin, setNin] = useState('12345678901');
  const [idType, setIdType] = useState('NIN Slip / Plastic Card');

  // Get setUser from auth store
  const setUser = useAuthStore((state) => state.setUser);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleContinue = () => {
    // Set user in auth store (would come from API in real app)
    setUser({
      id: `runner-${Date.now()}`,
      role: 'runner',
      email: 'tobi.adebayo@gmail.com',
      name: 'Tobi Adebayo',
    });

    // Route through location permission before entering the dashboard
    router.replace({
      pathname: '/(auth)/location-permission',
      params: { role: 'runner' },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[16px] font-gabarito text-text-dark text-center">Runner Application</Text>

        <View className="flex-row items-center justify-end w-8">
          <Text className="text-[14px] font-figtree-bold text-primary">2</Text>
          <Text className="text-[14px] font-figtree text-text-light">/4</Text>
        </View>
      </View>

      {/* Progress Bar - 50% (2/4) */}
      <View className="h-1 bg-background-dark mx-6 rounded-full mb-12">
        <View className="h-full bg-primary rounded-full w-1/2" />
      </View>

      {/* Form */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-heading-sm font-gabarito text-text-dark mb-1.5">
          Identity Verification
        </Text>
        <Text className="text-body-sm font-figtree text-text-gray leading-5 mb-7">
          Step 2 of 4. Verify your citizenship for a secure community.
        </Text>

        {/* NIN */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          National Identification Number (NIN)
        </Text>
        <TextInput
          className="border border-border rounded-xl px-4 py-3.5 text-[15px] font-figtree text-text-dark bg-background-light mb-5"
          placeholder="12345678901"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={11}
          value={nin}
          onChangeText={setNin}
        />

        {/* Government ID Type */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Government ID Type
        </Text>
        <TouchableOpacity className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3.5 bg-background-light mb-6">
          <Text className="text-[15px] font-figtree text-text-dark">{idType}</Text>
          <Feather name="chevron-down" size={20} color="#0F172A" />
        </TouchableOpacity>

        {/* Upload Row */}
        <View className="flex-row gap-4 mb-6">
          {/* Front */}
          <TouchableOpacity className="flex-1 border-2 border-dashed border-border-light rounded-xl py-5 items-center justify-center bg-background-subtle">
            <View className="w-9 h-9 rounded-full bg-white items-center justify-center border border-border mb-2">
              <Feather name="camera" size={18} color="#006B75" />
            </View>
            <Text className="text-[13px] font-figtree-bold text-text-muted">ID Card Front</Text>
            <Text className="text-[11px] font-figtree text-text-light mt-0.5">Tap to upload</Text>
          </TouchableOpacity>

          {/* Back */}
          <TouchableOpacity className="flex-1 border-2 border-dashed border-border-light rounded-xl py-5 items-center justify-center bg-background-subtle">
            <View className="w-9 h-9 rounded-full bg-white items-center justify-center border border-border mb-2">
              <Feather name="camera" size={18} color="#006B75" />
            </View>
            <Text className="text-[13px] font-figtree-bold text-text-muted">ID Card Back</Text>
            <Text className="text-[11px] font-figtree text-text-light mt-0.5">Tap to upload</Text>
          </TouchableOpacity>
        </View>

        {/* Selfie Box */}
        <TouchableOpacity className="border-2 border-primary-surface rounded-xl p-4 flex-row items-center justify-between bg-primary-light mb-8">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-primary-surface items-center justify-center">
              <Feather name="user" size={18} color="#006B75" />
            </View>
            <View>
              <Text className="text-[14px] font-figtree-bold text-text-dark">Take Liveness Selfie</Text>
              <Text className="text-[12px] font-figtree text-primary mt-0.5">Perfect lighting, face forward</Text>
            </View>
          </View>
          <Feather name="check-circle" size={22} color="#006B75" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleContinue}
        >
          <Text className="text-white text-body font-gabarito">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}