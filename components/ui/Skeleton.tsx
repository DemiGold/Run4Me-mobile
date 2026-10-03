import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle, type StyleProp } from 'react-native';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Skeleton — shimmer placeholder for loading states
//
// Usage:
//   <Skeleton width="100%" height={16} />
//   <Skeleton width={120} height={20} radius={12} className="mb-2" />
//
// Uses a subtle opacity pulse (no gradient) so it works
// consistently across platforms without extra dependencies.
//
// Implementation notes:
//   - Animated.Value drives the opacity between 0.5 and 1.
//   - useNativeDriver: true — opacity animates on the UI thread,
//     so it stays smooth even when JS is busy loading data.
//   - The loop runs for the component's lifetime; cleanup stops
//     it on unmount to avoid leaking animations.
// ─────────────────────────────────────────────────────────────

interface SkeletonProps {
  /** Width — accepts a number (px) or percentage string like "70%". */
  width?: number | `${number}%`;

  /** Height in pixels. Defaults to 14 (a text-line height). */
  height?: number;

  /** Border radius in pixels. Defaults to 8. */
  radius?: number;

  /** Optional Tailwind class for margins etc. */
  className?: string;

  /** Escape hatch for arbitrary styles. */
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  className = '',
  style,
}: SkeletonProps) {
  // 0.5 = mid-pulse, 1 = full opacity. Start mid so the very
  // first frame isn't jarringly bright.
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          // Slightly gray background — matches the border token so
          // skeletons sit visually with surrounding UI.
          backgroundColor: colors.borderDefault,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}