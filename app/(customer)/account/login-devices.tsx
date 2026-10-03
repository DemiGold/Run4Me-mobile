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
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Login Devices
//
// Shows active sessions. Revoke individual sessions or all others.
// MOCK: sessions come from MOCK_DEVICES.
// ─────────────────────────────────────────────────────────────

type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const INITIAL_SESSIONS: Session[] = [
  { id: 's1', device: 'iPhone 15 Pro',   location: 'Lagos, Nigeria', lastActive: 'Active now',     isCurrent: true,  icon: 'smartphone' },
  { id: 's2', device: 'Samsung Galaxy',  location: 'Abuja, Nigeria', lastActive: '2 hours ago',    isCurrent: false, icon: 'smartphone' },
  { id: 's3', device: 'Chrome on MacOS', location: 'Lagos, Nigeria', lastActive: 'Yesterday',      isCurrent: false, icon: 'monitor' },
];

export default function LoginDevices() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);

  const handleRevoke = (session: Session) => {
    Alert.alert(
      'Revoke session?',
      `${session.device} in ${session.location} will be signed out.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => setSessions((prev) => prev.filter((s) => s.id !== session.id)),
        },
      ]
    );
  };

  const handleSignOutAll = () => {
    Alert.alert(
      'Sign out all other devices?',
      "You'll stay signed in on this device.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out others',
          style: 'destructive',
          onPress: () => setSessions((prev) => prev.filter((s) => s.isCurrent)),
        },
      ]
    );
  };

  const otherCount = sessions.filter((s) => !s.isCurrent).length;

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
          Login Devices
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-body-sm font-figtree text-muted mb-5">
          {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
        </Text>

        <View className="gap-3 mb-5">
          {sessions.map((s) => (
            <View
              key={s.id}
              className={`
                rounded-2xl p-4 border bg-surface flex-row items-center gap-3
                ${s.isCurrent ? 'border-primary' : 'border-border'}
              `}
            >
              <View className="w-11 h-11 rounded-xl bg-primary-light items-center justify-center">
                <Feather name={s.icon} size={20} color={colors.primary} />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text className="text-body-sm font-gabarito-bold text-ink">
                    {s.device}
                  </Text>
                  {s.isCurrent ? (
                    <View className="bg-primary-light px-2 py-0.5 rounded">
                      <Text className="text-micro font-figtree-bold text-primary tracking-wider">
                        THIS DEVICE
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-caption-sm font-figtree text-muted">
                  {s.location} · {s.lastActive}
                </Text>
              </View>

              {!s.isCurrent ? (
                <TouchableOpacity onPress={() => handleRevoke(s)} hitSlop={8}>
                  <Feather name="x-circle" size={20} color={colors.danger} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>

        {otherCount > 0 ? (
          <Button variant="destructive" fullWidth onPress={handleSignOutAll}>
            Sign out all other devices
          </Button>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}