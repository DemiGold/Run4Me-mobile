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
// Figma spec:
//   Height      52px (py-3.5 + body LH 24)
//   Radius      16px (rounded-2xl)
//   Border      1px #E2E8F0
//   Background  #F8FAFC (background-light)
//   Label       body-sm Figtree 400 muted, mb-2
//
// Supports optional leading icon (e.g. phone, calendar), an
// error message, helper text, and an onBlur callback so parent
// screens can validate per-field when the user leaves the field.
// ─────────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'tel' | 'name' | 'off';
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
  error,
  helperText,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  className = '',
  inputClassName = '',
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-status-error'
    : focused
    ? 'border-primary'
    : 'border-border';

  return (
    <View className={className}>
      {/* Label */}
      <Text className="text-body-sm font-figtree text-muted mb-2">
        {label}
      </Text>

      {/* Field */}
      <View
        className={`
          flex-row items-center
          border rounded-2xl px-4
          bg-background-light
          ${borderClass}
        `}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}
        <TextInput
          className={`
            flex-1 py-3.5 text-body font-figtree text-ink
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