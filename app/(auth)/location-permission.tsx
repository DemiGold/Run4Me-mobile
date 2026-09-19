import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

// Import auth store
import { useAuthStore } from '@/stores/authStore';

const mapImage = require('../../assets/Rectangle.png');
const { width } = Dimensions.get('window');

export default function LocationPermission() {
  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  // Get user from auth store
  const user = useAuthStore((state) => state.user);

  if (!fontsLoaded) {
    return null;
  }

  const handleAllowLocation = () => {
    // In a real app, you'd request location permissions here
    // For now, we'll navigate based on user role
    
    const userRole = user?.role || 'customer';
    
    if (userRole === 'customer') {
      router.replace('/(customer)');
    } else {
      router.replace('/(runner)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Everything — map, badge, text, buttons — moves together as ONE centered block */}
      <View className="flex-1 justify-center px-6">

        {/* Top content: map, badge, text - fixed internal gap-8 (32px), matches Figma's "Hug" block */}
        <View className="gap-8">

          {/* --- 1. MAP CARD --- */}
          <View
            className="w-full rounded-3xl overflow-hidden relative border border-border items-center justify-center"
            style={{ height: width * 0.8 }}
          >
            <Image
              source={mapImage}
              className="absolute inset-0 w-full h-full"
              resizeMode="contain"
            />

            {/* Pin Overlay */}
            <View className="absolute items-center justify-center">
              <View className="absolute w-20 h-20 rounded-full bg-primary opacity-[0.15]" />
              <Ionicons name="location" size={48} color="#006B75" />
            </View>
          </View>

          {/* --- 2. SECURE & ACCURATE BADGE --- */}
          <View className="items-center justify-center">
            <View className="flex-row items-center gap-1.5 border border-border rounded-full px-3 py-1.5 bg-background-light">
              <Feather name="shield" size={12} color="#006B75" />
              <Text className="text-[11px] font-figtree-bold text-primary tracking-[0.6px]">
                SECURE & ACCURATE
              </Text>
            </View>
          </View>

          {/* --- 3. TEXT GROUP --- */}
          <View className="items-center w-full">
            <Text className="text-[26px] font-gabarito text-text-dark text-center mb-3">
              Enable your location
            </Text>
            <Text className="text-body-sm font-figtree text-text-gray text-center leading-[22px]">
              Run4Me uses your location to find nearby Errand Runners, secure active tasks, and provide real-time accurate delivery estimates.
            </Text>
          </View>

        </View>

        {/* --- 4. BUTTONS --- */}
        <View className="w-full mt-10 gap-2">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center justify-center w-full"
            onPress={handleAllowLocation}
            activeOpacity={0.85}
          >
            <Text className="text-white text-body font-gabarito">Allow Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center justify-center py-3.5 w-full"
            onPress={() => router.back()}
            activeOpacity={0.6}
          >
            <Text className="text-[15px] font-figtree-bold text-text-dark">Not Now</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}