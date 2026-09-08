import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Import fonts
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

type RoleType = 'customer' | 'runner';

export default function ChooseAccountType() {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>('customer');

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleProceed = (role: RoleType) => {
    if (role === 'customer') {
      router.push('/registration/customer');
    } else {
      router.push('/registration/runner/personal');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">

      {/* Single centered block: logo, heading, and both cards move together */}
      <View className="flex-1 justify-center">

        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-7 h-7 rounded-lg bg-primary items-center justify-center">
              <Feather name="x" size={16} color="white" />
            </View>
            <Text className="text-[18px] font-gabarito text-primary">
              Run<Text className="text-secondary">4</Text>Me
            </Text>
          </View>

          <Text className="text-[24px] font-gabarito text-text-dark leading-8 w-full">
            How would you like to use Run4Me?
          </Text>
        </View>

        {/* Cards - gap only between them, no extra centering of their own */}
        <View className="gap-4">

        {/* --- CUSTOMER CARD --- */}
        <TouchableOpacity
          className={`
            border-2 rounded-2xl p-5
            ${selectedRole === 'customer'
              ? 'border-primary bg-teal-50'
              : 'border-border bg-white'
            }
          `}
          onPress={() => setSelectedRole('customer')}
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="bg-primary-light px-2.5 py-1 rounded">
              <Text className="text-[10px] font-figtree-bold text-primary tracking-wider">
                CUSTOMER / BOSS
              </Text>
            </View>
            <Feather
              name={selectedRole === 'customer' ? 'check-circle' : 'circle'}
              size={22}
              color={selectedRole === 'customer' ? '#006B75' : '#CBD5E1'}
            />
          </View>

          <Text className="text-[18px] font-gabarito text-text-dark mb-1.5">
            I want to delegate tasks
          </Text>
          <Text className="text-[13px] font-figtree text-text-gray leading-5 mb-4">
            Need someone to run an errand for you? Request shopping, pick-ups, document delivery & more.
          </Text>

          <TouchableOpacity
            onPress={() => handleProceed('customer')}
            activeOpacity={0.8}
            className={`
              py-3 rounded-xl items-center justify-center w-full
              ${selectedRole === 'customer'
                ? 'bg-primary'
                : 'bg-transparent border border-border'
              }
            `}
          >
            <Text className={`
              text-[14px] font-figtree-bold text-center
              ${selectedRole === 'customer' ? 'text-white' : 'text-text-muted'}
            `}>
              Continue as Customer
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* --- RUNNER CARD --- */}
        <TouchableOpacity
          className={`
            border-2 rounded-2xl p-5
            ${selectedRole === 'runner'
              ? 'border-secondary bg-orange-50'
              : 'border-border bg-white'
            }
          `}
          onPress={() => setSelectedRole('runner')}
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="bg-secondary-light px-2.5 py-1 rounded">
              <Text className="text-[10px] font-figtree-bold text-secondary tracking-wider">
                RUNNER / AGENT
              </Text>
            </View>
            <Feather
              name={selectedRole === 'runner' ? 'check-circle' : 'circle'}
              size={22}
              color={selectedRole === 'runner' ? '#FF9F1C' : '#CBD5E1'}
            />
          </View>

          <Text className="text-[18px] font-gabarito text-text-dark mb-1.5">
            I want to earn money
          </Text>
          <Text className="text-[13px] font-figtree text-text-gray leading-5 mb-4">
            Earn money by helping people in your city complete errands. Be your own boss.
          </Text>

          <TouchableOpacity
            onPress={() => handleProceed('runner')}
            activeOpacity={0.8}
            className={`
              py-3 rounded-xl items-center justify-center w-full
              ${selectedRole === 'runner'
                ? 'bg-secondary'
                : 'bg-transparent border border-border'
              }
            `}
          >
            <Text className={`
              text-[14px] font-figtree-bold text-center
              ${selectedRole === 'runner' ? 'text-white' : 'text-text-muted'}
            `}>
              Continue as Runner
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}