import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

export default function Settings() {
  const logout = useAuthStore((state) => state.logout);

  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [promo, setPromo] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  const handleSignOut = () => {
    logout();
    router.replace('/(auth)/splash');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* ═══ ACCOUNT ═══ */}
          <Section label="ACCOUNT" />
          <Row label="Profile Details" value="Adaaez Nwosu" onPress={() => router.push('/(customer)/profile')} />
          <Row label="Email Address" value="adaaez...@gmail.com" />
          <Row label="Phone Number" value="+234 812 *** 6789" />
          <Row label="Date of Birth" value="12/04/1995" last />

          {/* ═══ NOTIFICATIONS ═══ */}
          <Section label="NOTIFICATIONS" />
          <ToggleRow label="Push Notifications" value={push} onChange={setPush} />
          <ToggleRow label="Email Notifications" value={email} onChange={setEmail} />
          <ToggleRow label="SMS Alerts" value={sms} onChange={setSms} />
          <ToggleRow label="Promotional Offers" value={promo} onChange={setPromo} last />

          {/* ═══ LOCATION ═══ */}
          <Section label="LOCATION" />
          <Row label="Location Access" value="While Using App" />
          <Row
            label="Saved Locations"
            value="3 Addresses"
            last
            onPress={() => router.push('/(customer)/saved-addresses')}
          />

          {/* ═══ PAYMENT & WALLET ═══ */}
          <Section label="PAYMENT & WALLET" />
          <Row label="Payment Methods" value="Card ending in 4242" />
          <Row label="Wallet Details" value="₦25,400" onPress={() => router.push('/(customer)/wallet')} />
          <Row
            label="Transaction History"
            value=""
            last
            onPress={() => router.push('/(customer)/wallet')}
          />

          {/* ═══ SECURITY ═══ */}
          <Section label="SECURITY" />
          <Row label="Two-Factor Authentication" value="Enabled" />
          <ToggleRow label="Biometric Login" value={biometric} onChange={setBiometric} />
          <Row label="Login Devices" value="2 Active" />
          <Row
            label="Safety Center"
            value=""
            onPress={() => router.push('/(customer)/safety')}
          />
          <Row label="Delete Account" value="" danger last />

          {/* ═══ SUPPORT ═══ */}
          <Section label="SUPPORT" />
          <Row label="Help Center" value="" onPress={() => router.push('/(customer)/help')} />
          <Row label="Frequently Asked" value="" onPress={() => router.push('/(customer)/faq')} />
          <Row label="Get in Touch" value="" onPress={() => router.push('/(customer)/contact')} />
          <Row label="Notifications" value="" onPress={() => router.push('/(customer)/notifications')} />
          <Row label="Legal & Policies" value="" last onPress={() => router.push('/(customer)/legal')} />

          {/* ═══ PREFERENCES ═══ */}
          <Section label="PREFERENCES" />
          <Row label="Language" value="English (NG)" />
          <Row label="Currency" value="Naira (₦)" />
          <ToggleRow label="Dark Mode" value={darkMode} onChange={setDarkMode} last />

          {/* ═══ SIGN OUT ═══ */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.85}
            className="border border-status-error rounded-2xl py-4 items-center mt-8 flex-row justify-center gap-2"
          >
            <Feather name="log-out" size={16} color="#EF4444" />
            <Text className="text-[14px] font-gabarito text-status-error">
              Sign Out
            </Text>
          </TouchableOpacity>

          {/* Version */}
          <Text className="text-[10px] font-figtree text-text-light text-center mt-6">
            Run4Me v1.0.0 · January 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label }: { label: string }) {
  return (
    <Text className="text-[11px] font-figtree-bold text-text-light tracking-wider mt-6 mb-2">
      {label}
    </Text>
  );
}

function Row({
  label,
  value,
  last,
  danger,
  onPress,
}: {
  label: string;
  value: string;
  last?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      className={`flex-row items-center justify-between py-3.5 ${
        !last ? 'border-b border-border' : ''
      }`}
    >
      <Text
        className={`text-[13px] font-figtree ${
          danger ? 'text-status-error' : 'text-text-dark'
        }`}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {value ? (
          <Text className="text-[12px] font-figtree text-text-light">{value}</Text>
        ) : null}
        {!danger && <Feather name="chevron-right" size={16} color="#94A3B8" />}
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${
        !last ? 'border-b border-border' : ''
      }`}
    >
      <Text className="text-[13px] font-figtree text-text-dark">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E2E8F0', true: '#006B75' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}