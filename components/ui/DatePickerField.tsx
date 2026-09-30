import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// DatePickerField — Run4Me design system primitive
//
// Android → native dialog · iOS → custom slide-up modal
// Figma format: DD / MM / YYYY
//
// SDK 57 datetimepicker API:
//   onValueChange(event, date) — fires on CONFIRM (OK). On Android
//     you MUST close the picker here — `onDismiss` does not fire on OK.
//   onDismiss() — fires only on CANCEL / outside-tap.
//
// The picker is presented as a dialog on Android, so we mount it
// conditionally and unmount in BOTH onValueChange and onDismiss.
// ─────────────────────────────────────────────────────────────

const Picker = DateTimePicker as React.ComponentType<any>;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDDMMYYYY = (d: Date) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
};

const safeDate = (d: unknown): Date => {
  if (d instanceof Date && !isNaN(d.getTime())) {
    return new Date(d.getTime());
  }
  return new Date(2000, 0, 1);
};

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  editable?: boolean;
  className?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  minimumDate,
  maximumDate,
  editable = true,
  className = '',
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const open = () => {
    if (!editable) return;
    setTempDate(value ?? new Date(2000, 0, 1));
    setShow(true);
  };

  // ─── Android: onValueChange fires on OK ───
  // Signature is (event, date). We close the dialog here — `onDismiss`
  // will NOT fire when the user taps OK, only when they cancel.
  const handleAndroidValueChange = (event: any, date?: Date) => {
    // Defensive: some versions pass (date) only; scan both args.
    const selected =
      date instanceof Date
        ? date
        : event instanceof Date
        ? event
        : null;

    if (selected) onChange(selected);
    setShow(false); // ← REQUIRED to close the Android dialog on OK
  };

  // ─── Android: onDismiss fires on Cancel / outside-tap only ───
  const handleAndroidDismiss = () => {
    setShow(false);
  };

  // ─── iOS: onValueChange updates the temp spinner value ───
  // Commit happens on our custom Done button. The native spinner
  // doesn't dismiss itself, so no setShow(false) here.
  const handleIOSValueChange = (event: any, date?: Date) => {
    const selected =
      date instanceof Date
        ? date
        : event instanceof Date
        ? event
        : null;

    if (selected) setTempDate(selected);
  };

  const confirmIOS = () => {
    if (tempDate) onChange(tempDate);
    setShow(false);
  };

  const cancelIOS = () => setShow(false);

  const borderClass = error ? 'border-status-error' : 'border-border';
  const hasValidValue = value instanceof Date && !isNaN(value.getTime());

  return (
    <View className={className}>
      <Text className="text-body-sm font-figtree text-muted mb-2">{label}</Text>

      <TouchableOpacity
        onPress={open}
        activeOpacity={0.7}
        disabled={!editable}
        className={`
          flex-row items-center justify-between
          border rounded-2xl px-4 py-3.5 bg-background-light
          ${borderClass}
        `}
      >
        <View className="flex-row items-center">
          <Feather name="calendar" size={18} color={colors.subtle} />
          <Text
            className={`text-body font-figtree ml-2.5 ${
              hasValidValue ? 'text-ink' : 'text-text-light'
            }`}
          >
            {hasValidValue && value ? formatDDMMYYYY(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      {error ? (
        <Text className="text-caption font-figtree text-status-error mt-1.5">
          {error}
        </Text>
      ) : null}

      {/* ─── Android: native dialog ─── */}
      {Platform.OS === 'android' && show ? (
        <Picker
          value={safeDate(tempDate)}
          mode="date"
          display="default"
          presentation="dialog"
          onValueChange={handleAndroidValueChange}
          onDismiss={handleAndroidDismiss}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {/* ─── iOS: custom slide-up modal ─── */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={cancelIOS}
        >
          <Pressable
            className="flex-1 bg-black/25 justify-end"
            onPress={cancelIOS}
          >
            <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
                <TouchableOpacity onPress={cancelIOS} hitSlop={12}>
                  <Text className="text-body font-figtree text-muted">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="text-body font-gabarito text-ink">{label}</Text>
                <TouchableOpacity onPress={confirmIOS} hitSlop={12}>
                  <Text className="text-body font-figtree-bold text-primary">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <Picker
                value={safeDate(tempDate)}
                mode="date"
                display="spinner"
                onValueChange={handleIOSValueChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}