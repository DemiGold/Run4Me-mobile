import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Button — Run4Me design system primitive
//
// Figma: Components / Buttons
//   Height   52px (md) · 40px (sm)
//   Radius   16px (md) · 14px (sm)
//   Padding  16px horizontal
//   Label    Figtree 700 Bold, 16px, LH 100%
//
// Variants:
//   primary      — teal filled (main CTA)
//   secondary    — white bg + #DCE5EF border, ink text
//                  ('outline' kept as legacy alias)
//   destructive  — #FEE2E2 bg + #EF4444 text
//   accent       — orange filled (runner CTAs)
//   ghost        — transparent, primary text
// ─────────────────────────────────────────────────────────────

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'      // legacy alias → 'secondary'
  | 'destructive'
  | 'accent'
  | 'ghost';

type ButtonSize = 'md' | 'sm';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<
  Exclude<ButtonVariant, 'outline'>,
  { container: string; text: string; spinner: string }
> = {
  primary: {
    container: 'bg-primary border border-primary',
    text: 'text-white',
    spinner: colors.white,
  },
  secondary: {
    container: 'bg-surface border border-border',
    text: 'text-ink',
    spinner: colors.ink,
  },
  destructive: {
    container: 'bg-status-errorLight border border-status-errorLight',
    text: 'text-status-error',
    spinner: colors.danger,
  },
  accent: {
    container: 'bg-accent border border-accent',
    text: 'text-white',
    spinner: colors.white,
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary',
    spinner: colors.primary,
  },
};

// Size → fixed height + radius + horizontal padding.
// Height is explicit (not py-*) so the 16px label centers cleanly.
const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-[52px] px-4 rounded-2xl',
  sm: 'h-10 px-3 rounded-xl',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
  style,
}: ButtonProps) {
  const resolved = variant === 'outline' ? 'secondary' : variant;
  const v = variantStyles[resolved];
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      onPress={isInteractive ? onPress : undefined}
      activeOpacity={isInteractive ? 0.85 : 1}
      disabled={!isInteractive}
      style={style}
      className={`
        flex-row items-center justify-center
        ${sizeStyles[size]}
        ${v.container}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {leftIcon && !loading ? (
        <View className="mr-2">{leftIcon}</View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <Text
          className={`
            text-body font-figtree-bold text-center
            ${v.text}
            ${textClassName}
          `}
        >
          {children}
        </Text>
      )}

      {rightIcon && !loading ? (
        <View className="ml-2">{rightIcon}</View>
      ) : null}
    </TouchableOpacity>
  );
}