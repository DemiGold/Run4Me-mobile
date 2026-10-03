import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Get in Touch
//
// Figma: contact-screen
//   Intro text · channel cards (chat / email / socials).
//
// Channel actions are stubs. Wire to:
//   - chat      → in-app support chat (future)
//   - email     → Linking.openURL('mailto:support@run4me.ng')
//   - twitter   → Linking.openURL('https://x.com/Run4Me_NG')
//   - instagram → Linking.openURL('https://instagram.com/run4me.ng')
// ─────────────────────────────────────────────────────────────

type Channel = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tone: 'teal' | 'orange';
};

const CHANNELS: Channel[] = [
  { id: 'chat',      title: 'Live Chat',    subtitle: 'Instant conversation with support team 24/7.',   icon: 'message-circle', tone: 'teal' },
  { id: 'email',     title: 'Email Us',     subtitle: 'Get a thorough response in under 2 hours.',     icon: 'mail',           tone: 'orange' },
  { id: 'twitter',   title: 'X / Twitter',  subtitle: 'Follow and DM us @Run4Me_NG.',                  icon: 'twitter',        tone: 'teal' },
  { id: 'instagram', title: 'Instagram',    subtitle: 'Our community handle is @run4me.ng.',           icon: 'instagram',      tone: 'orange' },
];

const TONE_STYLES: Record<Channel['tone'], { bg: string; fg: string }> = {
  teal:   { bg: colors.primaryLight, fg: colors.primary },
  orange: { bg: colors.accentLight,  fg: colors.accent },
};

export default function GetInTouch() {
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
          Get in Touch
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Text className="text-body font-gabarito-bold text-ink mb-1.5">
            We are here to help!
          </Text>
          <Text className="text-caption font-figtree text-muted mb-6">
            Reach out to our customer satisfaction team. We usually respond
            within minutes.
          </Text>

          <View className="gap-3">
            {CHANNELS.map((ch) => {
              const tone = TONE_STYLES[ch.tone];
              return (
                <TouchableOpacity
                  key={ch.id}
                  activeOpacity={0.75}
                  className="border border-border rounded-2xl p-4 flex-row items-center gap-3 bg-surface"
                >
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: tone.bg }}
                  >
                    <Feather name={ch.icon} size={20} color={tone.fg} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-sm font-gabarito-bold text-ink mb-0.5">
                      {ch.title}
                    </Text>
                    <Text className="text-caption-sm font-figtree text-muted">
                      {ch.subtitle}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.subtle} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}