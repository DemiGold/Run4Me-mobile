import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function CustomerRegistration() {
  const [fullName, setFullName] = useState('Chinedu Okafor');
  const [email, setEmail] = useState('chinedu.okafor@outlook.com');
  const [phone, setPhone] = useState('08034567890');
  const [agree, setAgree] = useState(true);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 w-8">
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[16px] font-gabarito text-text-dark text-center">Register Profile</Text>

        <View className="flex-row items-center justify-end w-8">
          <Text className="text-[14px] font-figtree-bold text-primary">1</Text>
          <Text className="text-[14px] font-figtree text-text-light">/3</Text>
        </View>
      </View>

      {/* Progress Bar - INCREASED BOTTOM MARGIN */}
      <View className="h-1 bg-background-dark mx-6 rounded-full mb-12">
        <View className="h-full bg-primary rounded-full w-1/3" />
      </View>

      {/* Form */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-heading-sm font-gabarito text-text-dark mb-1.5">
          Create Customer Account
        </Text>
        <Text className="text-body-sm font-figtree text-text-gray leading-5 mb-7">
          Let's get to know you. Please provide correct details.
        </Text>

        {/* Full Name */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Full Name (First and Last name)
        </Text>
        <TextInput
          className="border border-border rounded-xl px-4 py-3.5 text-[15px] font-figtree text-text-dark bg-background-light mb-5"
          placeholder="Enter full name"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Email Address
        </Text>
        <TextInput
          className="border border-border rounded-xl px-4 py-3.5 text-[15px] font-figtree text-text-dark bg-background-light mb-5"
          placeholder="name@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Phone */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Phone Number
        </Text>
        <View className="flex-row items-center border border-border rounded-xl px-4 bg-background-light mb-5">
          <Feather name="phone" size={18} color="#94A3B8" className="mr-2.5" />
          <TextInput
            className="flex-1 py-3.5 text-[15px] font-figtree text-text-dark"
            placeholder="08034567890"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Date of Birth */}
        <Text className="text-body-sm font-figtree text-text-muted mb-2">
          Date of Birth
        </Text>
        <TouchableOpacity className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3.5 bg-background-light mb-6">
          <View className="flex-row items-center">
            <Feather name="calendar" size={18} color="#94A3B8" className="mr-2.5" />
            <Text className="text-[15px] font-figtree text-text-dark">14 / 09 / 1994</Text>
          </View>
        </TouchableOpacity>

        {/* Checkbox */}
        <TouchableOpacity
          className="flex-row items-start mt-2 mb-8"
          onPress={() => setAgree(!agree)}
          activeOpacity={0.8}
        >
          <View className={`
            w-5 h-5 rounded-md border-2 mr-3 mt-0.5 items-center justify-center
            ${agree ? 'bg-primary border-primary' : 'border-border-light bg-transparent'}
          `}>
            {agree && <Feather name="check" size={12} color="white" />}
          </View>
          <Text className="flex-1 text-[13px] font-figtree text-text-muted leading-5">
            I agree to Run4Me's{' '}
            <Text className="font-figtree-bold text-primary">Terms of Service</Text> and{' '}
            <Text className="font-figtree-bold text-primary">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-6 pt-3 bg-white">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={() => router.push('/(auth)/otp')}
        >
          <Text className="text-white text-body font-gabarito">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}