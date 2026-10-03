import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Notifications
//
// Figma: notification list
//   Tone system (teal/orange/green) · rounded-square icon tiles ·
//   subtle card shadow · timestamp = 11px muted.
//
// MOCK: NOTIFICATIONS array below. Replace with paginated
// GET /notifications when backend ships.
// ─────────────────────────────────────────────────────────────

type Tone = 'teal' | 'orange' | 'green';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tone: Tone;
  needsAction?: boolean;
  actionAmount?: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Substitution Needed',
    desc: "Your Runner says 'Ariel Detergent 1kg' is out of stock. Would you prefer 'So Klin 1kg' instead?",
    time: 'Just now',
    icon: 'refresh-cw',
    tone: 'teal',
    needsAction: true,
    actionAmount: '₦1,800',
  },
  {
    id: '2',
    title: 'Runner Accepted Errand',
    desc: 'Runner Tunde has accepted your Grocery Pickup request. He is on his way to Spar Lekki.',
    time: '5 mins ago',
    icon: 'user-check',
    tone: 'teal',
  },
  {
    id: '3',
    title: 'Runner has arrived at store',
    desc: 'Tunde has checked in at Spar Lekki and is now shopping.',
    time: '12 mins ago',
    icon: 'map-pin',
    tone: 'orange',
  },
  {
    id: '4',
    title: 'Receipt Uploaded — Review',
    desc: 'Runner uploaded invoice of ₦14,200. Check to confirm final pricing.',
    time: '25 mins ago',
    icon: 'file-text',
    tone: 'teal',
  },
  {
    id: '5',
    title: 'Your errand is on the way!',
    desc: 'Errand dispatched. Watch real-time delivery map of Lekki Phase 1.',
    time: '40 mins ago',
    icon: 'navigation',
    tone: 'orange',
  },
  {
    id: '6',
    title: 'Errand completed!',
    desc: 'Tunde delivered your items safely. Please verify and rate your experience.',
    time: '1 hour ago',
    icon: 'check-circle',
    tone: 'green',
  },
  {
    id: '7',
    title: 'New Errand Nearby (Runner)',
    desc: 'A user requested a pharmacy run within 1.5 km (₦2,500 payout).',
    time: '2 hours ago',
    icon: 'bell',
    tone: 'orange',
  },
];

// ─── Tone → color mapping ───
const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  teal:   { bg: colors.primaryLight, fg: colors.primary },
  orange: { bg: colors.accentLight,  fg: colors.accent },
  green:  { bg: colors.successLight, fg: colors.successDark },
};

// Figma: x=0 y=4 blur=12 spread=0 #000000 @ 3.14%
const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.0314,
  shadowRadius: 12,
  elevation: 2,
};

export default function Notifications() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* ─── Header ─── */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink">Notifications</Text>

        <TouchableOpacity
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="check-circle" size={16} color={colors.ink} />
        </TouchableOpacity>
      </View>

      {/* ─── Feed ─── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-3">
          {NOTIFICATIONS.map((n) => {
            const tone = TONE_STYLES[n.tone];

            return (
              <View
                key={n.id}
                className={`
                  rounded-2xl p-4 bg-surface
                  ${n.needsAction
                    ? 'border-2 border-primary'
                    : 'border border-border'
                  }
                `}
                style={n.needsAction ? undefined : cardShadow}
              >
                {/* Row: icon + body */}
                <View className="flex-row items-start gap-3">
                  {/* Icon — rounded square (Figma), not circle */}
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: tone.bg }}
                  >
                    <Feather name={n.icon} size={15} color={tone.fg} />
                  </View>

                  {/* Body: gap 4px between title row and desc */}
                  <View className="flex-1" style={{ gap: 4 }}>
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="flex-1 text-body-xs font-gabarito-bold text-ink pr-3"
                      >
                        {n.title}
                      </Text>
                      <Text className="text-caption-sm font-figtree text-muted">
                        {n.time}
                      </Text>
                    </View>

                    <Text className="text-caption font-figtree text-muted">
                      {n.desc}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                {n.needsAction && (
                  <View className="flex-row gap-2 mt-4">
                    <TouchableOpacity
                      className="flex-1 border border-border rounded-xl py-3 items-center"
                      activeOpacity={0.75}
                    >
                      <Text className="text-caption font-figtree-bold text-ink">
                        Cancel Order
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-primary rounded-xl py-3 items-center"
                      activeOpacity={0.85}
                    >
                      <Text className="text-caption font-figtree-bold text-white">
                        Approve ({n.actionAmount})
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}