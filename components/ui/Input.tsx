import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  type KeyboardTypeOptions,
} from 'react-native';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Input — Run4Me design system primitive
//
// Figma: Components / Text fields
//   Height   56px (fixed)
//   Radius   12px
//   Border   1px #DCE5EF (default) · primary (focused) · danger (error)
//   Padding  16px horizontal
//   Background #FFFFFF
//
// Labels come in two flavors across the app:
//   - sentence case (auth screens): "Full Name"
//   - UPPERCASE micro (profile / payment): "CARD NUMBER"
// Controlled via the `uppercaseLabel` prop.
//
// Supports optional leading AND trailing icons, error message,
// helper text, and an onBlur callback for per-field validation.
// Trailing icon is used for password visibility toggles.
// ─────────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'tel' | 'name' | 'off' | 'cc-number' | 'password';
  uppercaseLabel?: boolean;
  className?: string;
  inputClassName?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  leftIcon,
  rightIcon,
  error,
  helperText,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  uppercaseLabel = false,
  className = '',
  inputClassName = '',
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-status-error'
    : focused
    ? 'border-primary'
    : 'border-border';

  // Two label styles — sentence-case (auth) vs uppercase micro (profile/payment)
  const labelClass = uppercaseLabel
    ? 'text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2'
    : 'text-body-sm font-figtree text-muted mb-2';

  return (
    <View className={className}>
      {/* Label */}
      <Text className={labelClass}>{label}</Text>

      {/* Field — fixed 56px height per Figma, so no py-* on the TextInput */}
      <View
        className={`
          flex-row items-center
          h-14 rounded-field px-4 border
          bg-surface
          ${borderClass}
        `}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          className={`
            flex-1 text-body font-figtree text-ink
            ${inputClassName}
          `}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.subtle}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
        />

        {/* Right icon — typically a password visibility toggle */}
        {rightIcon ? <View className="ml-2.5">{rightIcon}</View> : null}
      </View>

      {/* Error / helper text */}
      {error ? (
        <Text className="text-caption font-figtree text-status-error mt-1.5">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-caption font-figtree text-text-light mt-1.5">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}