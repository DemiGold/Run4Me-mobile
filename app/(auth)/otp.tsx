import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useAuthStore } from '@/stores/authStore';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['4', '8', '2', '7', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(3);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Get user from auth store
  const user = useAuthStore((state) => state.user);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // In a real app, you'd validate the OTP here
    // For now, we'll assume it's correct and navigate
    
    const userRole = user?.role || 'customer';
    
    if (userRole === 'customer') {
      router.replace('/(customer)');
    } else {
      router.replace('/(runner)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Header - stays pinned to top like a nav bar */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[16px] font-gabarito text-text-dark text-center">Security</Text>
        <View className="w-8" />
      </View>

      {/* Everything below moves together as ONE centered block */}
      <View className="flex-1 justify-center px-6">

        <Text className="text-heading-sm font-gabarito text-text-dark mb-2">
          Verify your account
        </Text>
        <Text className="text-body-sm font-figtree text-text-gray leading-5 mb-8">
          We've sent a 6-digit verification code to{' '}
          <Text className="font-figtree-bold text-text-dark">chinedu.okafor@gmail.com</Text>
        </Text>

        {/* OTP Input Row */}
        <View className="flex-row justify-between mb-5 gap-1.5">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`
                flex-1 h-14 border rounded-xl text-center text-[20px] font-gabarito text-text-dark bg-background-light
                ${focusedIndex === index ? 'border-primary bg-white' : 'border-border'}
              `}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {/* Error Banner */}
        <View className="bg-status-errorLight border border-status-error/30 rounded-xl px-4 py-3.5 flex-row items-start mb-8">
          <View className="mt-0.5 mr-2.5">
            <Feather name="alert-triangle" size={16} color="#EF4444" />
          </View>
          <Text className="flex-1 text-status-error text-[13px] font-figtree leading-[18px]">
            The code you entered is incorrect. Please check and try again.
          </Text>
        </View>

        {/* Verify Button - NOW NAVIGATES TO DASHBOARD */}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-7"
          onPress={handleVerify}
        >
          <Text className="text-white text-body font-gabarito">Verify & Continue</Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-figtree text-text-gray">Resend code in 00:42</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-[13px] font-figtree-bold text-primary">Change Contact Details</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}