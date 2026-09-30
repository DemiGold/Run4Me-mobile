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
// Figma spec:
//   Height  52px (py-4 + body-sm LH 20)
//   Radius  16px (rounded-2xl)
//   Padding 16px horizontal (px-4)
//
// Variants:
//   primary  — teal filled (main CTA)
//   accent   — orange filled (runner CTA)
//   outline  — transparent bg + border (secondary action)
//   ghost    — transparent bg, no border (link-style action)
//
// Variants yet to sample from Figma: 'danger', 'success'
// — add when a screen needs them.
// ─────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
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

// Variant → bg / border / text classes
const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; spinner: string }
> = {
  primary: {
    container: 'bg-primary border border-primary',
    text: 'text-white',
    spinner: colors.white,
  },
  accent: {
    container: 'bg-accent border border-accent',
    text: 'text-white',
    spinner: colors.white,
  },
  outline: {
    container: 'bg-transparent border border-border',
    text: 'text-muted',
    spinner: colors.muted,
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary',
    spinner: colors.primary,
  },
};

// Size → height + horizontal padding
// md = 52px (py-4 + 20px line-height), sm = 40px (py-2.5 + 20px)
const sizeStyles: Record<ButtonSize, string> = {
  md: 'py-4 px-4 rounded-2xl',
  sm: 'py-2.5 px-3 rounded-xl',
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
  const v = variantStyles[variant];
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      onPress={isInteractive ? onPress : undefined}
      activeOpacity={isInteractive ? 0.8 : 1}
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
      {/* Left icon */}
      {leftIcon && !loading ? (
        <View className="mr-2">{leftIcon}</View>
      ) : null}

      {/* Label or spinner */}
      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <Text
          className={`
            text-body-sm font-figtree-bold text-center
            ${v.text}
            ${textClassName}
          `}
        >
          {children}
        </Text>
      )}

      {/* Right icon */}
      {rightIcon && !loading ? (
        <View className="ml-2">{rightIcon}</View>
      ) : null}
    </TouchableOpacity>
  );
}