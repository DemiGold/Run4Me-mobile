import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { sanitizeName, sanitizePhone } from '@/constants/validators';

// ─────────────────────────────────────────────────────────────
// Customer Profile
//
// Figma: profile-fields (gap 16px, px-24),
//       action-button-container (px-24)
//
// Real photo picker via expo-image-picker (camera + library).
// Avatar stored locally for now — /me/avatar upload pending.
// ─────────────────────────────────────────────────────────────

export default function CustomerProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.name || 'Adaaez Nwosu');
  const [email, setEmail] = useState(user?.email || 'adaaeze.nwosu@gmail.com');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [dob, setDob] = useState('April 12, 1995');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Image picker ───
  const pickFromLibrary = async () => {
    setPickerOpen(false);

    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photos permission needed',
        'Please allow access to your photos to set a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setPickerOpen(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to take a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // ─── Save ───
  const handleSave = async () => {
    setSaving(true);
    try {
      // ─── MOCK: replace with real API call ───
      await new Promise((r) => setTimeout(r, 700));

      if (user) {
        setUser({
          ...user,
          name: fullName.trim(),
          email: email.trim(),
        });
      }

      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save. Please try again.');
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
        <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </TouchableOpacity>

          <Text className="text-heading-sm font-gabarito text-ink">
            My Profile
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/account/settings')}
            className="w-9 h-9 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="settings" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View className="items-center mt-2 mb-8">
            <View
              className="w-24 h-24 rounded-full bg-background-dark items-center justify-center mb-4 overflow-hidden"
              style={{ borderWidth: 3, borderColor: colors.primaryLight }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Feather name="user" size={40} color={colors.subtle} />
              )}
            </View>

            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text className="text-body-xs font-figtree-bold text-primary">
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View className="px-6 gap-4">
            <Input
              label="FULL NAME"
              uppercaseLabel
              value={fullName}
              onChangeText={(v) => setFullName(sanitizeName(v))}
              autoCapitalize="words"
            />
            <Input
              label="EMAIL ADDRESS"
              uppercaseLabel
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="PHONE NUMBER"
              uppercaseLabel
              value={phone}
              onChangeText={(v) => setPhone(sanitizePhone(v))}
              keyboardType="phone-pad"
            />
            <Input
              label="DATE OF BIRTH"
              uppercaseLabel
              value={dob}
              onChangeText={setDob}
            />
          </View>

          {/* Save */}
          <View className="px-6 pt-6">
            <Button
              variant="primary"
              fullWidth
              loading={saving}
              onPress={handleSave}
            >
              Save Profile Changes
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo picker bottom sheet */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/25 justify-end"
          onPress={() => setPickerOpen(false)}
        >
          <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
            <View className="px-6 pt-3 pb-6">
              <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />

              <Text className="text-body font-gabarito text-ink text-center mb-5">
                Profile Photo
              </Text>

              <Option icon="camera" label="Take Photo" onPress={takePhoto} />
              <Option
                icon="image"
                label="Choose from Library"
                onPress={pickFromLibrary}
              />

              {avatarUri ? (
                <Option
                  icon="trash-2"
                  label="Remove Photo"
                  destructive
                  onPress={() => {
                    setAvatarUri(null);
                    setPickerOpen(false);
                  }}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setPickerOpen(false)}
                className="mt-3 py-4 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-body font-figtree-bold text-muted">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Option — row in the photo picker sheet
// ─────────────────────────────────────────────────────────────
function Option({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-4"
    >
      <View
        className={`
          w-9 h-9 rounded-xl items-center justify-center
          ${destructive ? 'bg-status-errorLight' : 'bg-primary-light'}
        `}
      >
        <Feather
          name={icon}
          size={16}
          color={destructive ? colors.danger : colors.primary}
        />
      </View>
      <Text
        className={`
          text-body font-figtree
          ${destructive ? 'text-status-error' : 'text-ink'}
        `}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}