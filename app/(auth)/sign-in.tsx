import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, AntDesign } from '@expo/vector-icons';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function SignInScreen() {
  const [email, setEmail] = useState('');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">

      {/* Top Row: Back Button + Logo - stays pinned to top like a nav bar */}
      <View className="flex-row items-center justify-between pt-4 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-[7px] bg-primary items-center justify-center">
            <Feather name="x" size={16} color="white" />
          </View>
          <Text className="text-[18px] font-gabarito text-primary">
            Run<Text className="text-secondary">4</Text>Me
          </Text>
        </View>

        {/* Spacer to balance the back button */}
        <View className="w-8" />
      </View>

      {/* Everything below moves together as ONE centered block */}
      <View className="flex-1 justify-center">

        {/* Header Text */}
        <View className="mb-8">
          <Text className="text-heading font-gabarito text-text-dark mb-2">
            Welcome back
          </Text>
          <Text className="text-body-sm font-figtree text-text-gray leading-5">
            Please sign in with your details to access your errands.
          </Text>
        </View>

        {/* Email Input */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Email Address or Phone
        </Text>
        <TextInput
          className="border border-border rounded-xl px-4 py-3.5 text-[15px] font-figtree text-text-dark bg-background-light"
          placeholder="e.g. tobi@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Forgot Password */}
        <TouchableOpacity
          className="self-end mt-2 mb-6"
          onPress={() => router.push('/forgot-password')}
        >
          <Text className="text-body-sm font-figtree-bold text-primary">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-6"
          onPress={() => router.push('/location-permission')}
        >
          <Text className="text-white text-body font-gabarito">Continue</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="mx-4 text-caption font-figtree-bold text-text-light">OR</Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          className="flex-row border border-border rounded-xl py-4 items-center justify-center gap-3 bg-white mb-6"
          onPress={() => {}}
        >
          <AntDesign name="google" size={18} color="#0F172A" />
          <Text className="text-body font-figtree-bold text-text-dark">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          className="items-center py-2"
          onPress={() => router.push('/choose-account')}
        >
          <Text className="text-body-sm font-figtree text-text-gray">
            New to Run4Me? <Text className="font-figtree-bold text-primary">Register Now</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}