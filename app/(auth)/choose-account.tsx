import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

type RoleType = 'customer' | 'runner';

export default function ChooseAccountType() {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>('customer');

  const handleProceed = (role: RoleType) => {
    if (role === 'customer') {
      router.push('/registration/customer');
    } else {
      router.push('/registration/runner/personal');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface px-6">
      <View className="flex-1 justify-center">

        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-7 h-7 rounded-lg bg-primary items-center justify-center">
              <Feather name="x" size={16} color={colors.white} />
            </View>
            <Text className="text-title font-gabarito text-primary">
              Run<Text className="text-accent">4</Text>Me
            </Text>
          </View>

          <Text className="text-heading font-gabarito text-ink">
            How would you like to use Run4Me?
          </Text>
        </View>

        {/* Cards */}
        <View className="gap-4">

          {/* --- CUSTOMER CARD --- */}
          <TouchableOpacity
            className={`
              border-2 rounded-3xl p-5
              ${selectedRole === 'customer'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-surface'
              }
            `}
            onPress={() => setSelectedRole('customer')}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-center mb-2.5">
              <View className="bg-primary-light px-3 py-1.5 rounded-lg">
                <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                  CUSTOMER / BOSS
                </Text>
              </View>
              <Feather
                name={selectedRole === 'customer' ? 'check-circle' : 'circle'}
                size={22}
                color={selectedRole === 'customer' ? colors.primary : colors.borderLight}
              />
            </View>

            <Text className="text-title font-gabarito-bold text-ink mb-1.5">
              I want to delegate tasks
            </Text>
            <Text className="text-body-sm font-figtree text-muted mb-4">
              Need someone to run an errand for you? Request shopping, pick-ups, document delivery & more.
            </Text>

            <TouchableOpacity
              onPress={() => handleProceed('customer')}
              activeOpacity={0.8}
              className={`
                py-4 rounded-2xl items-center justify-center w-full
                ${selectedRole === 'customer'
                  ? 'bg-primary'
                  : 'bg-transparent border border-border'
                }
              `}
            >
              <Text
                className={`
                  text-body-sm font-figtree-bold text-center
                  ${selectedRole === 'customer' ? 'text-white' : 'text-muted'}
                `}
              >
                Continue as Customer
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* --- RUNNER CARD --- */}
          <TouchableOpacity
            className={`
              border-2 rounded-3xl p-5
              ${selectedRole === 'runner'
                ? 'border-accent bg-accent-light'
                : 'border-border bg-surface'
              }
            `}
            onPress={() => setSelectedRole('runner')}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-center mb-2.5">
              <View className="bg-accent-light px-3 py-1.5 rounded-lg">
                <Text className="text-micro font-figtree-bold text-accent tracking-wider">
                  RUNNER / AGENT
                </Text>
              </View>
              <Feather
                name={selectedRole === 'runner' ? 'check-circle' : 'circle'}
                size={22}
                color={selectedRole === 'runner' ? colors.accent : colors.borderLight}
              />
            </View>

            <Text className="text-title font-gabarito-bold text-ink mb-1.5">
              I want to earn money
            </Text>
            <Text className="text-body-sm font-figtree text-muted mb-4">
              Earn money by helping people in your city complete errands. Be your own boss.
            </Text>

            <TouchableOpacity
              onPress={() => handleProceed('runner')}
              activeOpacity={0.8}
              className={`
                py-4 rounded-2xl items-center justify-center w-full
                ${selectedRole === 'runner'
                  ? 'bg-accent'
                  : 'bg-transparent border border-border'
                }
              `}
            >
              <Text
                className={`
                  text-body-sm font-figtree-bold text-center
                  ${selectedRole === 'runner' ? 'text-white' : 'text-muted'}
                `}
              >
                Continue as Runner
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}