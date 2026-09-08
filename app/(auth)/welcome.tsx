import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium } from '@expo-google-fonts/figtree';

// Import the image
const welcomeIllustration = require('../../assets/welcome-icon.png');

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Top: Image & Text (Centered) */}
      <View className="flex-1 items-center justify-center px-6">
        
        {/* Illustration - NOW LARGER */}
        <Image 
          source={welcomeIllustration} 
          className="w-[300px] h-[300px] mb-10 rounded-3xl"
          resizeMode="contain"
        />

        <Text className="text-heading font-gabarito text-center mb-4 text-text-dark">
          Welcome to Run4Me
        </Text>

        <Text className="text-body font-figtree text-center leading-6 text-text-gray max-w-[340px]">
          Get verified local runners to handle your deliveries, grocery shopping, market trips, and urgent errands instantly.
        </Text>
      </View>

      {/* Bottom: Text & Buttons */}
      <View className="px-6 pb-10 gap-4">
        <TouchableOpacity 
          className="bg-primary py-4 rounded-xl items-center"
          onPress={() => router.push('/choose-account')}
        >
          <Text className="text-white font-gabarito text-[18px]">GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => router.push('/sign-in')}>
          <Text className="font-figtree text-text-gray">
            Already have an account? <Text className="font-figtree-bold text-primary">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}