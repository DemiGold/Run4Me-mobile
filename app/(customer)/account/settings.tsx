import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useAuthStore } from '@/stores/authStore';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Settings
//
// Figma: settings-screen
//   Grouped sections (Account, Notifications, Location, Payment,
//   Security, Support, Preferences) with inline Row and ToggleRow.
//
// MOCK: all values are placeholder text. Real implementation
// pulls from authStore.user + GET /me/preferences.
// ─────────────────────────────────────────────────────────────

export default function Settings() {
  const logout = useAuthStore((state) => state.logout);

  // ─── Notification prefs (local state for now) ───
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [promo, setPromo] = useState(true);

  // ─── Security prefs ───
  const [biometric, setBiometric] = useState(true);

  // ─── Preferences ───
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    logout();
    router.replace('/(auth)/splash');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This cannot be undone. All errands and wallet funds will be forfeited.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // ─── MOCK: replace with real DELETE /me when backend ships ───
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-heading-sm font-gabarito text-ink">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">

          {/* ═══ ACCOUNT ═══ */}
          <Section label="ACCOUNT" />
          <Row
            label="Profile Details"
            value="Adaaez Nwosu"
            onPress={() => router.push('/(customer)/profile')}
          />
          <Row label="Email Address" value="adaaez...@gmail.com" />
          <Row label="Phone Number" value="+234 812 *** 6789" />
          <Row label="Date of Birth" value="12/04/1995" last />

          {/* ═══ NOTIFICATIONS ═══ */}
          <Section label="NOTIFICATIONS" />
          <ToggleRow label="Push Notifications"  value={push}   onChange={setPush} />
          <ToggleRow label="Email Notifications" value={email}  onChange={setEmail} />
          <ToggleRow label="SMS Alerts"          value={sms}    onChange={setSms} />
          <ToggleRow label="Promotional Offers"  value={promo}  onChange={setPromo} last />

          {/* ═══ LOCATION ═══ */}
          <Section label="LOCATION" />
          <Row label="Location Access" value="While Using App" />
          <Row
            label="Saved Locations"
            value="3 Addresses"
            onPress={() => router.push('/(customer)/account/saved-addresses')}
            last
          />

          {/* ═══ PAYMENT & WALLET ═══ */}
          <Section label="PAYMENT & WALLET" />
          <Row
            label="Payment Methods"
            value="2 cards"
            onPress={() => router.push('/(customer)/account/payment-methods')}
          />
          <Row
            label="Wallet Details"
            value="₦25,400"
            onPress={() => router.push('/(customer)/wallet')}
          />
          <Row
            label="Transaction History"
            value=""
            onPress={() => router.push('/(customer)/wallet')}
            last
          />

          {/* ═══ SECURITY ═══ */}
          <Section label="SECURITY" />
          <Row
            label="Two-Factor Authentication"
            value="Enabled"
            onPress={() => router.push('/(customer)/account/two-factor')}
          />
          <ToggleRow label="Biometric Login" value={biometric} onChange={setBiometric} />
          <Row
            label="Login Devices"
            value="3 Active"
            onPress={() => router.push('/(customer)/account/login-devices')}
          />
          <Row
            label="Safety Center"
            value=""
            onPress={() => router.push('/(customer)/account/safety')}
          />
          <Row
            label="Delete Account"
            value=""
            danger
            last
            onPress={handleDeleteAccount}
          />

          {/* ═══ SUPPORT ═══ */}
          <Section label="SUPPORT" />
          <Row label="Help Center"       value="" onPress={() => router.push('/(customer)/account/help')} />
          <Row label="Frequently Asked"  value="" onPress={() => router.push('/(customer)/account/faq')} />
          <Row label="Get in Touch"      value="" onPress={() => router.push('/(customer)/account/contact')} />
          <Row label="Notifications"     value="" onPress={() => router.push('/(customer)/notifications')} />
          <Row label="Legal & Policies"  value="" onPress={() => router.push('/(customer)/account/legal')} last />

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
            <Feather name="log-out" size={16} color={colors.danger} />
            <Text className="text-body-sm font-figtree-bold text-status-error">
              Sign Out
            </Text>
          </TouchableOpacity>

          {/* Version */}
          <Text className="text-micro font-figtree text-text-light text-center mt-6 mb-4">
            Run4Me v1.0.0 · January 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Section — uppercase micro section header
// ─────────────────────────────────────────────────────────────
function Section({ label }: { label: string }) {
  return (
    <Text className="text-micro font-figtree-bold text-text-light tracking-wider mt-6 mb-2 uppercase">
      {label}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────
// Row — a list row with label, optional value, optional chevron
//   With onPress: tappable, chevron shown (unless danger)
//   Without: static
//   danger: red text, no chevron
// ─────────────────────────────────────────────────────────────
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
      className={`
        flex-row items-center justify-between py-3.5
        ${!last ? 'border-b border-border' : ''}
      `}
    >
      <Text
        className={`
          text-body-xs font-figtree
          ${danger ? 'text-status-error' : 'text-ink'}
        `}
      >
        {label}
      </Text>

      <View className="flex-row items-center gap-2">
        {value ? (
          <Text className="text-caption font-figtree text-text-light">
            {value}
          </Text>
        ) : null}

        {!danger ? (
          <Feather name="chevron-right" size={16} color={colors.subtle} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// ToggleRow — row with a Toggle on the right
// ─────────────────────────────────────────────────────────────
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
      className={`
        flex-row items-center justify-between py-3.5
        ${!last ? 'border-b border-border' : ''}
      `}
    >
      <Text className="text-body-xs font-figtree text-ink">{label}</Text>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}