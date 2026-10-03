import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { SavedAddress } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// New Address — wired to the locations API
//
// Saves a new address via api.locations.createLocation. On
// success, navigates back to the previous screen.
//
// Data flow:
//   1. Customer picks a label (Home / Work / Mom's House /
//      Other + custom text).
//   2. Enters the full address text.
//   3. Optionally sets it as default.
//   4. Save → api.locations.createLocation({ label, address,
//      icon, isDefault, coordinate? })
//   5. On success → router.back()
//   6. On failure → inline error banner (was Alert)
//
// Label → icon mapping:
//   Figma's saved-addresses screen renders a Feather icon per
//   card. The backend stores the icon id. We derive it from the
//   label here so the customer doesn't have to pick one:
//     Home / Work / Mom's House → home | briefcase | map-pin
//     Other (custom label)      → map-pin (generic)
//
// Coordinate:
//   The map picker isn't built yet, so no lat/lng is captured.
//   `coordinate` is optional in the type — the address still
//   saves without it. When the map picker ships, grab the coords
//   from there and pass them in.
//
// ⚠️ Refresh note for the previous screen
//   `router.back()` doesn't remount `saved-addresses.tsx`, so
//   that screen won't see the new item until it re-fetches.
//   Fix: switch `saved-addresses.tsx` to use `useFocusEffect`
//   instead of `useEffect`. Flagged for a follow-up pass.
// ─────────────────────────────────────────────────────────────

type LabelOption = 'Home' | 'Work' | "Mom's House" | 'Other';

const LABELS: LabelOption[] = ['Home', 'Work', "Mom's House", 'Other'];

/**
 * Map a label to the Feather icon the saved-addresses card will
 * render. Matches the icon type from SavedAddress.
 */
const labelToIcon = (label: string): SavedAddress['icon'] => {
  switch (label) {
    case 'Home':        return 'home';
    case 'Work':        return 'briefcase';
    case "Mom's House": return 'map-pin';
    default:            return 'map-pin';
  }
};

export default function NewAddress() {
  // ─── Form state ───
  const [label, setLabel] = useState<LabelOption>('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // ─── Submission state ───
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Derived values ───
  const finalLabel = label === 'Other' ? customLabel.trim() : label;

  // Client-side gate on the Save button.
  //   - Label non-empty
  //   - Address at least 10 chars — filters out "lagos" or "1" or
  //     other junk before we bother the API
  const canSave = useMemo(
    () => finalLabel.length > 0 && address.trim().length >= 10,
    [finalLabel, address]
  );

  // ─── Save ───
  const handleSave = async () => {
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);

    try {
      await api.locations.createLocation({
        label: finalLabel,
        address: address.trim(),
        icon: labelToIcon(label),
        isDefault,
        // coordinate: undefined — no map picker yet
      });

      // Navigate back. The previous screen will need a focus
      // effect to see the new item — see header comment.
      router.back();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save address. Please try again.'
      );
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
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
            New Address
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Submit error banner ─── */}
          {error ? (
            <View className="bg-status-errorLight rounded-2xl px-4 py-3.5 flex-row items-start gap-2.5 mb-5">
              <Feather
                name="alert-triangle"
                size={16}
                color={colors.danger}
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 text-body-xs font-figtree text-status-error">
                {error}
              </Text>
            </View>
          ) : null}

          {/* ─── Label picker ─── */}
          <Text className="text-body-sm font-figtree text-muted mb-3">
            Label
          </Text>
          <View className="flex-row gap-2 flex-wrap mb-5">
            {LABELS.map((opt) => {
              const isSelected = label === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    setLabel(opt);
                    if (error) setError(null);
                  }}
                  activeOpacity={0.75}
                  disabled={saving}
                  className={`
                    rounded-full px-4 py-2.5 border
                    ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                    }
                  `}
                >
                  <Text
                    className={`
                      text-body-xs font-figtree-bold
                      ${isSelected ? 'text-white' : 'text-ink'}
                    `}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── Custom label — only when "Other" is selected ─── */}
          {label === 'Other' ? (
            <View className="mb-5">
              <Input
                label="Custom Label"
                value={customLabel}
                onChangeText={(v) => {
                  setCustomLabel(v);
                  if (error) setError(null);
                }}
                placeholder="e.g. Gym, Church"
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
          ) : null}

          {/* ─── Address — extracted TextArea primitive ─── */}
          <TextArea
            label="Full Address"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (error) setError(null);
            }}
            placeholder="House number, street, area, city"
            height={100}
            editable={!saving}
            className="mb-5"
          />

          {/* ─── Map preview placeholder ─── */}
          <TouchableOpacity
            activeOpacity={0.75}
            className="w-full h-32 rounded-2xl bg-background-dark border border-border items-center justify-center mb-5"
          >
            <Feather name="map-pin" size={22} color={colors.primary} />
            <Text className="text-caption font-figtree text-muted mt-2">
              Pin on map (coming soon)
            </Text>
          </TouchableOpacity>

          {/* ─── Set as default ─── */}
          <View className="flex-row items-center justify-between py-4 border-t border-border">
            <Text className="text-body-sm font-figtree text-ink">
              Set as default address
            </Text>
            <Toggle
              value={isDefault}
              onChange={(v) => {
                setIsDefault(v);
                if (error) setError(null);
              }}
              disabled={saving}
            />
          </View>
        </ScrollView>

        {/* CTA */}
        <View className="px-6 pb-6 pt-3">
          <Button
            variant="primary"
            fullWidth
            loading={saving}
            disabled={!canSave}
            onPress={handleSave}
          >
            Save Address
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}