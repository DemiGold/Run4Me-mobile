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

import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Two-Factor Authentication
//
// Enable/disable 2FA and pick the method (SMS or Authenticator).
// MOCK: toggling just updates local state. Real implementation
// needs a TOTP setup flow (QR + verify code).
// ─────────────────────────────────────────────────────────────

type Method = 'sms' | 'authenticator';

export default function TwoFactor() {
  const [enabled, setEnabled] = useState(true);
  const [method, setMethod] = useState<Method>('sms');
  const [phone] = useState('+234 812 *** 6789');

  const handleToggle = (next: boolean) => {
    if (!next) {
      Alert.alert(
        'Turn off 2FA?',
        'Your account will be less secure without it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Turn off',
            style: 'destructive',
            onPress: () => setEnabled(false),
          },
        ]
      );
    } else {
      setEnabled(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-heading-sm font-gabarito text-ink">
          Two-Factor Auth
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View
          className={`
            rounded-2xl p-4 mb-5 flex-row items-center gap-3 border
            ${enabled
              ? 'bg-status-successLight border-status-success'
              : 'bg-background-dark border-border'
            }
          `}
        >
          <View
            className={`
              w-11 h-11 rounded-xl items-center justify-center
              ${enabled ? 'bg-status-success' : 'bg-border'}
            `}
          >
            <Feather
              name={enabled ? 'shield' : 'shield-off'}
              size={20}
              color={colors.white}
            />
          </View>
          <View className="flex-1">
            <Text className="text-body-sm font-gabarito-bold text-ink">
              {enabled ? '2FA is on' : '2FA is off'}
            </Text>
            <Text className="text-caption-sm font-figtree text-muted mt-0.5">
              {enabled
                ? 'Your account has an extra layer of security.'
                : 'Turn on to protect your account.'}
            </Text>
          </View>
          <Toggle value={enabled} onChange={handleToggle} />
        </View>

        {/* Method picker — only when enabled */}
        {enabled ? (
          <>
            <Text className="text-body-sm font-gabarito-bold text-ink mb-3">
              Method
            </Text>

            <View className="gap-3 mb-5">
              <MethodRow
                icon="message-square"
                label="SMS code"
                subtitle={phone}
                selected={method === 'sms'}
                onPress={() => setMethod('sms')}
              />
              <MethodRow
                icon="key"
                label="Authenticator app"
                subtitle="Use Google Authenticator or Authy"
                selected={method === 'authenticator'}
                onPress={() => setMethod('authenticator')}
              />
            </View>

            {method === 'authenticator' ? (
              <View className="bg-primary-light rounded-2xl p-4 mb-5 flex-row items-start gap-3">
                <Feather
                  name="info"
                  size={16}
                  color={colors.primary}
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-caption font-figtree text-muted leading-5">
                  Scan the QR code in your authenticator app, then enter the
                  6-digit code to verify. Setup flow coming soon.
                </Text>
              </View>
            ) : null}

            <Button variant="secondary" fullWidth onPress={() => {}}>
              Save preferences
            </Button>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MethodRow({
  icon,
  label,
  subtitle,
  selected,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`
        rounded-2xl p-4 flex-row items-center gap-3 border bg-surface
        ${selected ? 'border-primary' : 'border-border'}
      `}
    >
      <View
        className={`
          w-11 h-11 rounded-xl items-center justify-center
          ${selected ? 'bg-primary-light' : 'bg-background-dark'}
        `}
      >
        <Feather
          name={icon}
          size={20}
          color={selected ? colors.primary : colors.muted}
        />
      </View>
      <View className="flex-1">
        <Text className="text-body-sm font-gabarito-bold text-ink">
          {label}
        </Text>
        <Text className="text-caption-sm font-figtree text-muted mt-0.5">
          {subtitle}
        </Text>
      </View>
      <View
        className={`
          w-5 h-5 rounded-full border-2 items-center justify-center
          ${selected ? 'border-primary' : 'border-border-light'}
        `}
      >
        {selected ? (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}