import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// EmptyState — centered icon + title + optional body + CTA
//
// Used when a list has zero items after a successful fetch.
// Also used by error states — pass a different icon/title/CTA.
//
// Usage:
//   <EmptyState
//     icon="inbox"
//     title="No notifications yet"
//     body="You'll see updates about your errands here."
//   />
//
//   <EmptyState
//     icon="shopping-bag"
//     title="No errands"
//     actionLabel="Create errand"
//     onAction={() => router.push('/(customer)/errand/select-type')}
//   />
//
// Layout notes:
//   - Wraps in a centered column with generous padding so it
//     reads as "this space is intentionally empty".
//   - Icon sits in a muted circle badge — matches other icon
//     treatments across the app.
//   - CTA is optional; only renders when both actionLabel and
//     onAction are provided.
// ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Feather icon name shown in the circular badge. */
  icon: React.ComponentProps<typeof Feather>['name'];

  /** Primary message — bold, in ink color. */
  title: string;

  /** Optional secondary text — muted, explains what to do. */
  body?: string;

  /** Optional CTA button label. Requires `onAction` too. */
  actionLabel?: string;

  /** Called when the CTA is tapped. */
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  // Only show the button when we have BOTH a label and a handler.
  const showAction = Boolean(actionLabel && onAction);

  return (
    <View className="items-center justify-center px-8 py-16">
      {/* Icon badge */}
      <View className="w-16 h-16 rounded-full bg-background-dark items-center justify-center mb-4">
        <Feather name={icon} size={28} color={colors.subtle} />
      </View>

      {/* Title */}
      <Text className="text-body font-gabarito-bold text-ink text-center mb-1.5">
        {title}
      </Text>

      {/* Optional body */}
      {body ? (
        <Text className="text-body-xs font-figtree text-muted text-center">
          {body}
        </Text>
      ) : null}

      {/* Optional CTA */}
      {showAction ? (
        <View className="mt-6 w-full max-w-[220px]">
          <Button variant="primary" fullWidth onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}