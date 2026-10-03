import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// New Address
//
// Add a saved address. Label is a quick-pick (Home/Work/etc)
// with a custom option. Address is a single field for now —
// real implementation will use a map picker.
//
// MOCK: save just routes back. Replace with POST /locations.
// ─────────────────────────────────────────────────────────────

type LabelOption = 'Home' | 'Work' | "Mom's House" | 'Other';

const LABELS: LabelOption[] = ['Home', 'Work', "Mom's House", 'Other'];

export default function NewAddress() {
  const [label, setLabel] = useState<LabelOption>('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const finalLabel = label === 'Other' ? customLabel.trim() : label;
  const canSave = finalLabel.length > 0 && address.trim().length >= 10;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // ─── MOCK: replace with POST /locations ───
      await new Promise((r) => setTimeout(r, 700));
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save address. Please try again.');
    } finally {
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
          {/* Label picker */}
          <Text className="text-body-sm font-figtree text-muted mb-3">
            Label
          </Text>
          <View className="flex-row gap-2 flex-wrap mb-5">
            {LABELS.map((opt) => {
              const isSelected = label === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setLabel(opt)}
                  activeOpacity={0.75}
                  className={`
                    rounded-full px-4 py-2.5 border
                    ${isSelected
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

          {label === 'Other' ? (
            <View className="mb-5">
              <Input
                label="Custom Label"
                value={customLabel}
                onChangeText={setCustomLabel}
                placeholder="e.g. Gym, Church"
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
          ) : null}

          {/* Address */}
          <View className="mb-5">
            <Text className="text-body-sm font-figtree text-muted mb-2">
              Full Address
            </Text>
            <View
              className="border border-border rounded-field bg-surface px-4 py-3.5"
              style={{ minHeight: 100 }}
            >
              <TextInput
                className="flex-1 text-body font-figtree text-ink"
                style={{ textAlignVertical: 'top' }}
                value={address}
                onChangeText={setAddress}
                placeholder="House number, street, area, city"
                placeholderTextColor={colors.subtle}
                multiline
                editable={!saving}
              />
            </View>
          </View>

          {/* Map preview placeholder */}
          <TouchableOpacity
            activeOpacity={0.75}
            className="w-full h-32 rounded-2xl bg-background-dark border border-border items-center justify-center mb-5"
          >
            <Feather name="map-pin" size={22} color={colors.primary} />
            <Text className="text-caption font-figtree text-muted mt-2">
              Pin on map (coming soon)
            </Text>
          </TouchableOpacity>

          {/* Set as default */}
          <View className="flex-row items-center justify-between py-4 border-t border-border">
            <Text className="text-body-sm font-figtree text-ink">
              Set as default address
            </Text>
            <Toggle value={isDefault} onChange={setIsDefault} />
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