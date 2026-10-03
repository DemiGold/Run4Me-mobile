import React, { useState } from 'react';
import { View, Text, TextInput, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// TextArea — multi-line input primitive
//
// Mirrors the Input primitive's styling but for multi-line text.
// Used in: instructions, cash-dispute, cash-correction,
//          rate-runner, and anywhere else a longer text is
//          collected.
//
// Figma: same field tokens as Input — 12px radius, 1px #DCE5EF
//        border, 16px padding, primary (focused) / danger (error).
//
// Height is fixed (not auto-grown) so form layouts stay stable.
// Default is 160px, override via `height` prop when needed.
// ─────────────────────────────────────────────────────────────

interface TextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  editable?: boolean;
  height?: number;
  maxLength?: number;
  className?: string;
  /** Escape hatch for arbitrary styles — used for parent-side margins. */
  style?: StyleProp<ViewStyle>;
}

export function TextArea({
  value,
  onChangeText,
  onBlur,
  placeholder,
  label,
  error,
  helperText,
  editable = true,
  height = 160,
  maxLength,
  className = '',
  style,
}: TextAreaProps) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-status-error'
    : focused
    ? 'border-primary'
    : 'border-border';

  return (
    <View className={className} style={style}>
      {/* Optional label — matches Input's default (sentence case)
          styling. */}
      {label ? (
        <Text className="text-body-sm font-figtree text-muted mb-2">
          {label}
        </Text>
      ) : null}

      {/* Field container — fixed height, multiline TextInput inside. */}
      <View
        className={`
          border rounded-2xl p-4 bg-surface
          ${borderClass}
        `}
        style={{ height }}
      >
        <TextInput
          className="flex-1 text-body-sm font-figtree text-ink"
          placeholder={placeholder}
          placeholderTextColor={colors.subtle}
          multiline
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          editable={editable}
          maxLength={maxLength}
        />
      </View>

      {/* Character counter — only shown when maxLength is set. */}
      {maxLength ? (
        <Text
          className={`
            text-caption font-figtree mt-1.5 text-right
            ${value.length > maxLength * 0.9
              ? 'text-status-error'
              : 'text-text-light'}
          `}
        >
          {value.length} / {maxLength}
        </Text>
      ) : null}

      {/* Error / helper text — same pattern as Input. */}
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