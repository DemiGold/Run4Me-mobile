import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useAuthStore } from '../../stores/authStore';

const RANKS = ['Bronze', 'Silver', 'Gold', 'Elite'];
const CURRENT_RANK_INDEX = 2; // Gold

const REQUIREMENTS = [
  { label: 'Total Errands Completed', current: 248, target: 500, display: '248 / 500' },
  { label: 'Average Service Rating', current: 4.9, target: 4.8, display: '4.9 / 4.8' },
  { label: 'Errand Completion Rate', current: 98, target: 95, display: '98% / 95%' },
];

export default function RunnerProfile() {
  const logout = useAuthStore((state) => state.logout);

  const [fontsLoaded] = useFonts({
    Gabarito_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/splash');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-3 pb-6">

          {/* ═══ Header row: title + logout ═══ */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[16px] font-gabarito text-text-dark">Profile</Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center gap-1 border border-border rounded-full px-3 py-1.5"
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={13} color="#EF4444" />
              <Text className="text-[11px] font-figtree-bold text-status-error">Log Out</Text>
            </TouchableOpacity>
          </View>

          {/* ═══ Avatar + Name + Badge ═══ */}
          <View className="items-center mb-6">
            {/* Orange ring avatar */}
            <View
              className="w-[88px] h-[88px] rounded-full items-center justify-center mb-3"
              style={{ borderWidth: 3, borderColor: '#FF9F1C' }}
            >
              <View className="w-full h-full rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                <Feather name="user" size={36} color="#94A3B8" />
              </View>
            </View>

            {/* Name + verified badge */}
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[18px] font-gabarito text-text-dark">
                David Adeyemi
              </Text>
              <View className="bg-primary px-1.5 py-[2px] rounded">
                <Text className="text-[8px] font-figtree-bold text-white tracking-wider">
                  VERIFIED
                </Text>
              </View>
            </View>

            <Text className="text-[12px] font-figtree text-text-gray mb-3">
              ⭐ 4.9 Rating • 248 Errands Completed
            </Text>

            {/* Gold Runner pill */}
            <View className="bg-secondary-light px-3 py-1 rounded-full">
              <Text className="text-[10px] font-figtree-bold text-secondary tracking-wider">
                🏆 GOLD RUNNER
              </Text>
            </View>
          </View>

          {/* ═══ RANK PROGRESSION ═══ */}
          <Text className="text-[13px] font-gabarito text-text-dark mb-3">
            Rank Progression
          </Text>

          <View className="bg-slate-50 border border-border rounded-2xl p-4 mb-5">
            {/* Rank circles */}
            <View className="flex-row justify-between items-start mb-4 mt-1">
              {RANKS.map((rank, index) => {
                const isPassed = index < CURRENT_RANK_INDEX;
                const isCurrent = index === CURRENT_RANK_INDEX;
                const isFuture = index > CURRENT_RANK_INDEX;

                return (
                  <View key={rank} className="items-center flex-1 relative">
                    {/* Left connector */}
                    {index > 0 && (
                      <View
                        className={`absolute top-[11px] right-1/2 h-[2px] w-1/2 ${
                          isPassed || isCurrent ? 'bg-primary' : 'bg-border-light'
                        }`}
                      />
                    )}

                    {/* Right connector */}
                    {index < RANKS.length - 1 && (
                      <View
                        className={`absolute top-[11px] left-1/2 h-[2px] w-1/2 ${
                          isPassed ? 'bg-primary' : 'bg-border-light'
                        }`}
                      />
                    )}

                    {/* Circle */}
                    <View
                      className={`w-[22px] h-[22px] rounded-full items-center justify-center z-10 ${
                        isPassed
                          ? 'bg-primary'
                          : isCurrent
                          ? 'bg-secondary'
                          : 'bg-white border-2 border-border-light'
                      }`}
                    >
                      {isPassed && <Feather name="check" size={11} color="#FFFFFF" />}
                      {isCurrent && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>

                    {/* Label */}
                    <Text
                      className={`text-[11px] mt-2 ${
                        isCurrent
                          ? 'font-figtree-bold text-secondary'
                          : isFuture
                          ? 'font-figtree text-text-light'
                          : 'font-figtree text-text-gray'
                      }`}
                    >
                      {rank}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text className="text-[11px] font-figtree text-text-gray leading-[18px]">
              You are currently in the top 5% of Lagos runners. Complete the
              requirements below to rank up to Elite.
            </Text>
          </View>

          {/* ═══ REQUIREMENTS FOR ELITE RUNNER ═══ */}
          <Text className="text-[13px] font-gabarito text-text-dark mb-3">
            Requirements for Elite Runner
          </Text>

          <View className="bg-slate-50 border border-border rounded-2xl p-4 gap-4">
            {REQUIREMENTS.map((req) => {
              const progress =
                req.target > 0 ? Math.min(req.current / req.target, 1) : 0;

              return (
                <View key={req.label}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[12px] font-figtree-bold text-text-dark">
                      {req.label}
                    </Text>
                    <Text className="text-[12px] font-figtree-bold text-status-success">
                      {req.display}
                    </Text>
                  </View>

                  <View className="h-[5px] bg-border-light rounded-full overflow-hidden">
                    <View
                      className="h-full bg-status-success rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}