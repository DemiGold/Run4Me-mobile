import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Runner Identity Verification — step 2 of 4
//
// Figma: runner-registration-identity
//   NIN input · Government ID type · ID Card front/back uploads ·
//   Liveness selfie row · Continue CTA.
//
// NIN validation: 11 digits (Nigerian format).
// Photo pickers use expo-image-picker — images are NOT uploaded
// yet (mock submit). Replace with real KYC upload later.
// ─────────────────────────────────────────────────────────────

type IdType = 'NIN Slip / Plastic Card' | "Driver's License" | 'Voter Card' | 'Passport';

const ID_TYPES: IdType[] = [
  'NIN Slip / Plastic Card',
  "Driver's License",
  'Voter Card',
  'Passport',
];

export default function IdentityVerification() {
  const setUser = useAuthStore((state) => state.setUser);

  const [nin, setNin] = useState('');
  const [idType, setIdType] = useState<IdType>('NIN Slip / Plastic Card');
  const [idTypeOpen, setIdTypeOpen] = useState(false);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieConfirmed, setSelfieConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const ninValid = /^\d{11}$/.test(nin);
  const canContinue = ninValid && !!frontUri && !!backUri;

  // ─── Photo picker ───
  const pickImage = async (set: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photos permission needed',
        'Please allow access to your photos to upload your ID.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      set(result.assets[0].uri);
    }
  };

  const captureImage = async (set: (uri: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to photograph your ID.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      set(result.assets[0].uri);
    }
  };

  const handleIdUpload = (side: 'front' | 'back') => {
    const setter = side === 'front' ? setFrontUri : setBackUri;
    const currentUri = side === 'front' ? frontUri : backUri;

    if (currentUri) {
      // If already uploaded, offer to retake/remove
      Alert.alert(
        `ID Card ${side === 'front' ? 'Front' : 'Back'}`,
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retake',
            onPress: () => captureImage(setter),
          },
          {
            text: 'Choose from library',
            onPress: () => pickImage(setter),
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => setter(''),
          },
        ]
      );
    } else {
      Alert.alert(
        `ID Card ${side === 'front' ? 'Front' : 'Back'}`,
        'How would you like to add the photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Take Photo',
            onPress: () => captureImage(setter),
          },
          {
            text: 'Choose from Library',
            onPress: () => pickImage(setter),
          },
        ]
      );
    }
  };

  const handleSelfie = () => {
    // ─── MOCK: real liveness check comes in Phase 3 ───
    Alert.alert(
      'Liveness Selfie',
      'Liveness detection will be available soon. For now, tap OK to mark this step as complete.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => setSelfieConfirmed(true),
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    try {
      // ─── MOCK: replace with real KYC submission ───
      await new Promise((r) => setTimeout(r, 900));

      setUser({
        id: `runner-${Date.now()}`,
        role: 'runner',
        email: 'tobi.adebayo@gmail.com',
        name: 'Tobi Adebayo',
      });

      router.replace({
        pathname: '/(auth)/location-permission',
        params: { role: 'runner' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1 w-8"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text className="text-body font-gabarito text-ink text-center">
          Runner Application
        </Text>

        <View className="flex-row items-center justify-end w-8">
          <Text className="text-body-sm font-figtree-bold text-primary">2</Text>
          <Text className="text-body-sm font-figtree text-text-light">/4</Text>
        </View>
      </View>

      {/* Progress bar — 50% (2/4) */}
      <View className="h-1.5 bg-border rounded-full mx-6 mb-12 overflow-hidden">
        <View className="h-full bg-primary rounded-full w-1/2" />
      </View>

      {/* Form */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-heading-sm font-gabarito text-ink mb-1.5">
          Identity Verification
        </Text>
        <Text className="text-body-sm font-figtree text-muted mb-7">
          Step 2 of 4. Verify your citizenship for a secure community.
        </Text>

        {/* NIN */}
        <View className="mb-5">
          <Input
            label="National Identification Number (NIN)"
            value={nin}
            onChangeText={(v) => setNin(v.replace(/\D/g, '').slice(0, 11))}
            placeholder="12345678901"
            keyboardType="number-pad"
            helperText="11 digits"
            error={
              nin.length > 0 && !ninValid
                ? 'NIN must be exactly 11 digits.'
                : undefined
            }
            editable={!loading}
          />
        </View>

        {/* Government ID type — simple dropdown */}
        <View className="mb-6">
          <Text className="text-body-sm font-figtree text-muted mb-2">
            Government ID Type
          </Text>
          <TouchableOpacity
            onPress={() => setIdTypeOpen((v) => !v)}
            activeOpacity={0.75}
            className="flex-row items-center justify-between h-14 rounded-field px-4 border border-border bg-surface"
          >
            <Text className="text-body font-figtree text-ink">{idType}</Text>
            <Feather
              name={idTypeOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.ink}
            />
          </TouchableOpacity>

          {idTypeOpen ? (
            <View className="mt-2 border border-border rounded-field bg-surface overflow-hidden">
              {ID_TYPES.map((type, i) => {
                const isSelected = type === idType;
                const isLast = i === ID_TYPES.length - 1;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setIdType(type);
                      setIdTypeOpen(false);
                    }}
                    className={`
                      flex-row items-center justify-between px-4 py-3.5
                      ${!isLast ? 'border-b border-border' : ''}
                      ${isSelected ? 'bg-primary-light' : 'bg-surface'}
                    `}
                  >
                    <Text
                      className={`
                        text-body-sm font-figtree
                        ${isSelected ? 'text-primary font-figtree-bold' : 'text-ink'}
                      `}
                    >
                      {type}
                    </Text>
                    {isSelected ? (
                      <Feather name="check" size={16} color={colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* Upload row: front + back */}
        <View className="flex-row gap-4 mb-6">
          {/* Front */}
          <TouchableOpacity
            onPress={() => handleIdUpload('front')}
            activeOpacity={0.75}
            className={`
              flex-1 rounded-2xl py-5 items-center justify-center overflow-hidden
              ${frontUri
                ? 'border-2 border-primary bg-surface'
                : 'border-2 border-dashed border-border-light bg-background-subtle'
              }
            `}
          >
            {frontUri ? (
              <>
                <Image
                  source={{ uri: frontUri }}
                  style={{ width: '100%', height: 70, borderRadius: 10 }}
                  resizeMode="cover"
                />
                <Text className="text-caption-sm font-figtree-bold text-primary mt-2">
                  Front uploaded ✓
                </Text>
              </>
            ) : (
              <>
                <View className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border mb-2">
                  <Feather name="camera" size={18} color={colors.primary} />
                </View>
                <Text className="text-body-xs font-figtree-bold text-muted">
                  ID Card Front
                </Text>
                <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                  Tap to upload
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back */}
          <TouchableOpacity
            onPress={() => handleIdUpload('back')}
            activeOpacity={0.75}
            className={`
              flex-1 rounded-2xl py-5 items-center justify-center overflow-hidden
              ${backUri
                ? 'border-2 border-primary bg-surface'
                : 'border-2 border-dashed border-border-light bg-background-subtle'
              }
            `}
          >
            {backUri ? (
              <>
                <Image
                  source={{ uri: backUri }}
                  style={{ width: '100%', height: 70, borderRadius: 10 }}
                  resizeMode="cover"
                />
                <Text className="text-caption-sm font-figtree-bold text-primary mt-2">
                  Back uploaded ✓
                </Text>
              </>
            ) : (
              <>
                <View className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border mb-2">
                  <Feather name="camera" size={18} color={colors.primary} />
                </View>
                <Text className="text-body-xs font-figtree-bold text-muted">
                  ID Card Back
                </Text>
                <Text className="text-caption-sm font-figtree text-text-light mt-0.5">
                  Tap to upload
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Liveness selfie */}
        <TouchableOpacity
          onPress={handleSelfie}
          activeOpacity={0.75}
          className={`
            rounded-2xl p-4 flex-row items-center justify-between mb-8
            ${selfieConfirmed
              ? 'bg-status-successLight border border-status-success'
              : 'bg-primary-light border-2 border-primary-surface'
            }
          `}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`
                w-9 h-9 rounded-full items-center justify-center
                ${selfieConfirmed ? 'bg-status-success' : 'bg-primary-surface'}
              `}
            >
              <Feather
                name="user"
                size={18}
                color={selfieConfirmed ? colors.white : colors.primary}
              />
            </View>
            <View>
              <Text className="text-body-sm font-figtree-bold text-ink">
                {selfieConfirmed ? 'Liveness Selfie Confirmed' : 'Take Liveness Selfie'}
              </Text>
              <Text
                className={`
                  text-caption font-figtree mt-0.5
                  ${selfieConfirmed ? 'text-status-successDark' : 'text-primary'}
                `}
              >
                {selfieConfirmed
                  ? 'Identity verified'
                  : 'Perfect lighting, face forward'}
              </Text>
            </View>
          </View>
          <Feather
            name="check-circle"
            size={22}
            color={selfieConfirmed ? colors.success : colors.primary}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Button
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!canContinue}
          onPress={handleContinue}
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}