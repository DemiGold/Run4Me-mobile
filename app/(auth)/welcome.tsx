import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const welcomeIllustration = require('@/assets/welcome-icon.png');

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Top: Image & Text (Centered) */}
      <View className="flex-1 items-center justify-center px-6">
        <Image
          source={welcomeIllustration}
          className="w-[300px] h-[300px] mb-10 rounded-3xl"
          resizeMode="contain"
        />

        <Text className="text-heading font-gabarito text-center mb-4 text-ink">
          Welcome to Run4Me
        </Text>

        <Text className="text-body font-figtree text-center text-muted max-w-[340px]">
          Get verified local runners to handle your deliveries, grocery shopping, market trips, and urgent errands instantly.
        </Text>
      </View>

      {/* Bottom: Buttons */}
      <View className="px-6 pb-10 gap-4">
        <TouchableOpacity
          className="bg-primary py-4 rounded-2xl items-center"
          onPress={() => router.push('/choose-account')}
          activeOpacity={0.8}
        >
          <Text className="text-white font-figtree-bold text-body-sm">
            GET STARTED
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center py-2"
          onPress={() => router.push('/sign-in')}
          activeOpacity={0.7}
        >
          <Text className="font-figtree text-muted text-body-sm">
            Already have an account?{' '}
            <Text className="font-figtree-bold text-primary">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}