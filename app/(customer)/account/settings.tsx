import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Settings — wired to the API layer
//
// Fourth reference implementation. New patterns:
//
//   1. READ from authStore — user name/email/phone/dob come from
//      the logged-in session, not hardcoded strings.
//
//   2. PARALLEL background fetches — three API calls (wallet
//      balance, address count, device count) run on mount and
//      populate inline VALUES (right side of each Row). If any
//      fails, we fall back to a "—" placeholder instead of
//      blocking the whole screen.
//
//   3. LOGOUT via API — the sign-out button now calls
//      api.auth.logout() so the backend can invalidate the
//      session server-side. Falls through to local clear on
//      failure.
//
// What stays local for now (no endpoints yet):
//   - Notification preferences (push / email / SMS / promo)
//   - Biometric / dark mode toggles
//   These will move to a /me/preferences endpoint later.
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Shorten an email for display: "adaaez.nwosu@gmail.com" →
 * "adaaez...@gmail.com". Keeps first 6 chars of the local part.
 */
const shortenEmail = (email: string): string => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 6);
  return `${visible}...@${domain}`;
};

/**
 * Mask a phone number: "+2348123456789" → "+234 812 *** 6789"
 * Assumes Nigerian format but works for anything with 4+ digits.
 */
const maskPhone = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  // Show first 3 and last 4 digits, mask the middle
  const first = digits.slice(0, 3);
  const last = digits.slice(-4);
  return `+${first} *** ${last}`;
};

/**
 * Format DOB from ISO ("1995-04-12") to "12/04/1995".
 */
const formatDob = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/**
 * Format kobo → "₦25,400".
 */
const formatNaira = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-US');

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // ─── Local-only prefs (no endpoint yet) ───
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [promo, setPromo] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ─── Live values fetched from the API ───
  // null = still loading → show "…" placeholder in the Row
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [addressCount, setAddressCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);

  // ─── Pull-to-refresh + sign-out state ───
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // ─── Background fetch (runs on mount + refresh) ───
  // Promise.allSettled means: run all three, don't let one
  // failure kill the others. Each resolves independently.
  const fetchLiveValues = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    const [walletRes, locationsRes, devicesRes] = await Promise.allSettled([
      api.wallet.getBalance(),
      api.locations.listLocations(),
      // Device count has no API yet — fall back to a placeholder
      Promise.resolve({ count: 3 }),
    ]);

    if (walletRes.status === 'fulfilled') {
      setWalletBalance(walletRes.value.balance);
    }
    if (locationsRes.status === 'fulfilled') {
      setAddressCount(locationsRes.value.length);
    }
    if (devicesRes.status === 'fulfilled') {
      setDeviceCount((devicesRes.value as { count: number }).count);
    }

    if (isRefresh) setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLiveValues();
  }, [fetchLiveValues]);

  // ─── Sign out via API ───
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // Fire the API call so the backend can invalidate the token.
      // Even if it fails (offline, backend down), we still clear
      // local state so the user isn't stuck.
      await api.auth.logout();
    } catch {
      // swallow — local clear below is what actually matters
    } finally {
      logout();
      router.replace('/(auth)/splash');
    }
  };

  // ─── Delete account ───
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
            // ─── MOCK: replace with DELETE /me when backend ships ───
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  // ─── Derived display values ───
  // Loading states render "…" so the row isn't visually broken.
  const emailValue = user?.email ? shortenEmail(user.email) : '—';
  const phoneValue = user?.phone ? maskPhone(user.phone) : '—';
  const dobValue = formatDob(user?.dob);
  const nameValue = user?.name ?? '—';

  const walletValue =
    walletBalance === null ? '…' : formatNaira(walletBalance);

  const addressesValue =
    addressCount === null
      ? '…'
      : `${addressCount} ${addressCount === 1 ? 'Address' : 'Addresses'}`;

  const devicesValue =
    deviceCount === null
      ? '…'
      : `${deviceCount} ${deviceCount === 1 ? 'Active' : 'Active'}`;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* ─── Header ─── */}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLiveValues(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View className="px-6">

          {/* ═══ ACCOUNT ═══ */}
          {/* All values come from authStore.user — no more hardcoding */}
          <Section label="ACCOUNT" />
          <Row
            label="Profile Details"
            value={nameValue}
            onPress={() => router.push('/(customer)/profile')}
          />
          <Row label="Email Address" value={emailValue} />
          <Row label="Phone Number" value={phoneValue} />
          <Row label="Date of Birth" value={dobValue} last />

          {/* ═══ NOTIFICATIONS ═══ */}
          {/* Still local-only — no /me/preferences endpoint yet */}
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
            value={addressesValue}
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
            value={walletValue}
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
            value={devicesValue}
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
            disabled={signingOut}
            activeOpacity={0.85}
            className={`
              border border-status-error rounded-2xl py-4
              items-center mt-8 flex-row justify-center gap-2
              ${signingOut ? 'opacity-60' : 'opacity-100'}
            `}
          >
            <Feather name="log-out" size={16} color={colors.danger} />
            <Text className="text-body-sm font-figtree-bold text-status-error">
              {signingOut ? 'Signing out…' : 'Sign Out'}
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