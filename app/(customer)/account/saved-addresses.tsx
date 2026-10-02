import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const ADDRESSES = [
  { id: 'home', label: 'Home', icon: 'home', address: 'Block 12, Flat 4, Admiralty Way, Lekki Phase 1, Lagos, Nigeria', isDefault: true },
  { id: 'work', label: 'Work', icon: 'briefcase', address: 'Heritage Place, 21 Maroko Road, Ikoyi, Lagos, Nigeria', isDefault: false },
  { id: 'mom', label: "Mom's House", icon: 'map-pin', address: '45, Toyin Street, Ikeja, Lagos, Nigeria', isDefault: false },
];

export default function SavedAddresses() {
  const [defaultId, setDefaultId] = useState('home');
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full border border-border items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Saved Addresses</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 gap-3">
          {ADDRESSES.map((addr) => {
            const isDefault = defaultId === addr.id;
            return (
              <View key={addr.id} className={`rounded-2xl p-4 bg-white border ${isDefault ? 'border-primary' : 'border-border'}`}>
                {/* Header row */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name={addr.icon as any} size={14} color={isDefault ? '#006B75' : '#475569'} />
                  <Text className="text-[14px] font-gabarito text-text-dark">{addr.label}</Text>
                  {isDefault && (
                    <View className="bg-primary-light px-2 py-0.5 rounded">
                      <Text className="text-[8px] font-figtree-bold text-primary tracking-wider">DEFAULT</Text>
                    </View>
                  )}
                </View>

                {/* Address */}
                <Text className="text-[12px] font-figtree text-text-gray leading-5 mb-3">{addr.address}</Text>

                {/* Default toggle (only for non-default) */}
                {!isDefault && (
                  <>
                    <View className="h-[1px] bg-border mb-3" />
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[12px] font-figtree text-text-gray">Set as default address</Text>
                      <Switch
                        value={false}
                        onValueChange={() => setDefaultId(addr.id)}
                        trackColor={{ false: '#E2E8F0', true: '#006B75' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {/* Add new */}
          <TouchableOpacity className="border border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-2" activeOpacity={0.75}>
            <Feather name="plus" size={16} color="#006B75" />
            <Text className="text-[14px] font-figtree-bold text-primary">Add New Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}