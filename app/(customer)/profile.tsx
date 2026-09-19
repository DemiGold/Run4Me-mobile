import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function CustomerProfile() {
  const [fullName, setFullName] = useState('Adaaez Nwosu');
  const [email, setEmail] = useState('adaaez.nwosu@gmail.com');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [dob, setDob] = useState('April 12, 1995');

  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header: back + title + settings */}
      <View className="flex-row items-center justify-between px-6 pt-5 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-[20px] font-gabarito text-text-dark">My Profile</Text>

        <TouchableOpacity
          onPress={() => router.push('/(customer)/settings')}
          className="w-9 h-9 items-center justify-center"
        >
          <Feather name="settings" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Avatar */}
          <View className="items-center mb-8 mt-2">
            <View
              className="w-24 h-24 rounded-full bg-slate-200 items-center justify-center mb-4"
              style={{ borderWidth: 3, borderColor: '#E6F3F5' }}
            >
              <Feather name="user" size={40} color="#94A3B8" />
            </View>

            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[13px] font-figtree-bold text-primary">
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <Field label="FULL NAME" value={fullName} onChange={setFullName} />
          <Field label="EMAIL ADDRESS" value={email} onChange={setEmail} keyboardType="email-address" />
          <Field label="PHONE NUMBER" value={phone} onChange={setPhone} keyboardType="phone-pad" />
          <Field label="DATE OF BIRTH" value={dob} onChange={setDob} />

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mt-3"
            activeOpacity={0.85}
          >
            <Text className="text-white text-[15px] font-gabarito">
              Save Profile Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View className="mb-4">
      <Text className="text-[10px] font-figtree-bold text-text-gray uppercase tracking-wider mb-2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        className="border border-border rounded-xl px-4 py-3.5 text-[14px] font-figtree text-text-dark bg-white"
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}