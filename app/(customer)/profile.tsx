import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { colors } from '@/constants/colors';
import {
  isValidName,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
  isValidEmail,
} from '@/constants/validators';

const MIN_OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MOCK_OTP = '123456';

type ChangeField = 'name' | 'email' | 'phone' | 'dob' | null;

const formatDobLong = (d: Date): string => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Not set';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function CustomerProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [activeField, setActiveField] = useState<ChangeField>(null);

  const applyUserUpdate = (updated: Partial<typeof user>) => {
    if (user) setUser({ ...user, ...updated });
  };

  // ─── Avatar picker ───
  const pickFromLibrary = async () => {
    setAvatarPickerOpen(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
      try {
        await api.user.uploadAvatar(result.assets[0].uri);
      } catch {}
    }
  };

  const takePhoto = async () => {
    setAvatarPickerOpen(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
      try {
        await api.user.uploadAvatar(result.assets[0].uri);
      } catch {}
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
          {/* ─── Avatar ─── */}
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
              onPress={() => setAvatarPickerOpen(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text className="text-body-xs font-figtree-bold text-primary">
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Fields ─── */}
          <View className="px-6 gap-4">
            <ReadOnlyField
              label="FULL NAME"
              value={user?.name || 'Not set'}
              onChangePress={() => setActiveField('name')}
            />

            <ReadOnlyField
              label="EMAIL ADDRESS"
              value={user?.email || 'Not set'}
              onChangePress={() => setActiveField('email')}
            />

            <ReadOnlyField
              label="PHONE NUMBER"
              value={user?.phone || 'Not set'}
              onChangePress={() => setActiveField('phone')}
            />

            <ReadOnlyField
              label="DATE OF BIRTH"
              value={user?.dob ? formatDobLong(new Date(user.dob)) : 'Not set'}
              onChangePress={() => setActiveField('dob')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══ Photo picker sheet ═══ */}
      <Modal
        visible={avatarPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAvatarPickerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/25 justify-end"
          onPress={() => setAvatarPickerOpen(false)}
        >
          <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
            <View className="px-6 pt-3 pb-6">
              <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
              <Text className="text-body font-gabarito text-ink text-center mb-5">
                Profile Photo
              </Text>

              <SheetOption icon="camera" label="Take Photo" onPress={takePhoto} />
              <SheetOption
                icon="image"
                label="Choose from Library"
                onPress={pickFromLibrary}
              />
              {avatarUri ? (
                <SheetOption
                  icon="trash-2"
                  label="Remove Photo"
                  destructive
                  onPress={async () => {
                    setAvatarUri(null);
                    setAvatarPickerOpen(false);
                    try {
                      await api.user.deleteAvatar();
                    } catch {}
                  }}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setAvatarPickerOpen(false)}
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

      {/* ═══ Change modals ═══ */}
      <NameChangeModal
        visible={activeField === 'name'}
        currentName={user?.name ?? ''}
        onClose={() => setActiveField(null)}
        onSaved={(updatedName) => applyUserUpdate({ name: updatedName })}
      />

      <EmailChangeModal
        visible={activeField === 'email'}
        currentEmail={user?.email ?? ''}
        onClose={() => setActiveField(null)}
        onSaved={(updatedEmail) => applyUserUpdate({ email: updatedEmail })}
      />

      <PhoneChangeModal
        visible={activeField === 'phone'}
        currentPhone={user?.phone ?? ''}
        onClose={() => setActiveField(null)}
        onSaved={(updatedPhone) => applyUserUpdate({ phone: updatedPhone })}
      />

      <DobChangeModal
        visible={activeField === 'dob'}
        currentDob={user?.dob ? new Date(user.dob) : null}
        onClose={() => setActiveField(null)}
        onSaved={(d) => applyUserUpdate({ dob: d.toISOString().slice(0, 10) })}
      />
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// ReadOnlyField
// ═══════════════════════════════════════════════════════════════

function ReadOnlyField({
  label,
  value,
  onChangePress,
}: {
  label: string;
  value: string;
  onChangePress: () => void;
}) {
  return (
    <View>
      <Text className="text-micro font-figtree-bold text-muted uppercase tracking-wider mb-2">
        {label}
      </Text>
      <View className="flex-row items-center h-14 rounded-field px-4 border border-border bg-surface">
        <Text className="flex-1 text-body font-figtree text-ink" numberOfLines={1}>
          {value}
        </Text>
        <TouchableOpacity onPress={onChangePress} hitSlop={8}>
          <Text className="text-body-xs font-figtree-bold text-primary">
            Change
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// NameChangeModal
// ═══════════════════════════════════════════════════════════════

function NameChangeModal({
  visible,
  currentName,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(currentName);
      setError(null);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    const value = name.trim();
    if (!value) {
      setError('Enter your full name.');
      return;
    }
    if (!isValidName(value)) {
      setError('Letters only, and include first + last name.');
      return;
    }
    if (value === currentName.trim()) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.user.updateMe({ name: value });
      onSaved(value);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/25 justify-end" onPress={onClose}>
        <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
          <View className="px-6 pt-3 pb-8">
            <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
            <Text className="text-body font-gabarito text-ink text-center mb-6">
              Change Name
            </Text>

            <Input
              label="FULL NAME"
              uppercaseLabel
              value={name}
              onChangeText={(v) => {
                setName(sanitizeName(v));
                if (error) setError(null);
              }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={error ?? undefined}
              editable={!saving}
            />

            <View className="mt-5">
              <Button variant="primary" fullWidth loading={saving} onPress={handleSave}>
                Save Name
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// DobChangeModal — same sheet chrome, date picker inside
// ═══════════════════════════════════════════════════════════════

function DobChangeModal({
  visible,
  currentDob,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentDob: Date | null;
  onClose: () => void;
  onSaved: (dob: Date) => void;
}) {
  const [dob, setDob] = useState<Date | null>(currentDob);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { minDob, maxDob } = useMemo(() => {
    const today = new Date();
    const eighteen = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const oneTwenty = new Date(today.getFullYear() - 120, 0, 1);
    return { minDob: oneTwenty, maxDob: eighteen };
  }, []);

  React.useEffect(() => {
    if (visible) {
      setDob(currentDob);
      setError(null);
    }
  }, [visible, currentDob]);

  const handleSave = async () => {
    if (!dob) {
      setError('Select your date of birth.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.user.updateMe({ dob: dob.toISOString().slice(0, 10) });
      onSaved(dob);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/25 justify-end" onPress={onClose}>
        <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
          <View className="px-6 pt-3 pb-8">
            <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
            <Text className="text-body font-gabarito text-ink text-center mb-6">
              Date of Birth
            </Text>

            <DatePickerField
              label="DATE OF BIRTH"
              value={dob}
              onChange={setDob}
              placeholder="Select your date of birth"
              minimumDate={minDob}
              maximumDate={maxDob}
              editable={!saving}
              formatDisplay={formatDobLong}
            />

            {error ? (
              <Text className="text-caption font-figtree text-status-error mt-2">
                {error}
              </Text>
            ) : null}

            <View className="mt-5">
              <Button
                variant="primary"
                fullWidth
                loading={saving}
                disabled={!dob}
                onPress={handleSave}
              >
                Save Date of Birth
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// EmailChangeModal
// ═══════════════════════════════════════════════════════════════

function EmailChangeModal({
  visible,
  currentEmail,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentEmail: string;
  onClose: () => void;
  onSaved: (email: string) => void;
}) {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  React.useEffect(() => {
    if (visible) {
      setStep('input');
      setEmail('');
      setOtp('');
      setError(null);
      setResendIn(0);
    }
  }, [visible]);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleSend = async () => {
    const value = email.trim();
    if (!value) {
      setError('Enter your new email.');
      return;
    }
    if (!isValidEmail(value)) {
      setError('Enter a valid email address.');
      return;
    }
    if (value.toLowerCase() === currentEmail.toLowerCase()) {
      setError('That is already your current email.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await api.auth.forgotPasswordSend(value);
      setStep('verify');
      setResendIn(RESEND_SECONDS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== MIN_OTP_LENGTH) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (otp !== MOCK_OTP) {
      setError('Incorrect code. Try again.');
      setOtp('');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      await api.user.updateMe({ email: email.trim() });
      onSaved(email.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update email.');
    } finally {
      setVerifying(false);
    }
  };

  const mm = String(Math.floor(resendIn / 60)).padStart(2, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/25 justify-end" onPress={onClose}>
        <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
          <View className="px-6 pt-3 pb-8">
            <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
            <Text className="text-body font-gabarito text-ink text-center mb-6">
              Change Email
            </Text>

            {step === 'input' ? (
              <View className="gap-5">
                <Input
                  label="NEW EMAIL ADDRESS"
                  uppercaseLabel
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v.trim());
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={error ?? undefined}
                  editable={!sending}
                />
                <Button
                  variant="primary"
                  fullWidth
                  loading={sending}
                  disabled={!email.trim()}
                  onPress={handleSend}
                >
                  Send Verification Code
                </Button>
              </View>
            ) : (
              <View className="gap-5">
                <Text className="text-body-xs font-figtree text-muted text-center">
                  We sent a 6-digit code to{' '}
                  <Text className="font-figtree-bold text-ink">{email}</Text>
                </Text>

                <Input
                  label="VERIFICATION CODE"
                  uppercaseLabel
                  value={otp}
                  onChangeText={(v) => {
                    setOtp(v.replace(/\D/g, '').slice(0, 6));
                    if (error) setError(null);
                  }}
                  placeholder="123456"
                  keyboardType="number-pad"
                  error={error ?? undefined}
                  editable={!verifying}
                />

                <Button
                  variant="primary"
                  fullWidth
                  loading={verifying}
                  disabled={otp.length !== MIN_OTP_LENGTH}
                  onPress={handleVerify}
                >
                  Verify &amp; Save
                </Button>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={resendIn > 0}
                  className="items-center"
                  hitSlop={8}
                >
                  <Text
                    className={`text-body-xs font-figtree-bold ${
                      resendIn > 0 ? 'text-text-light' : 'text-primary'
                    }`}
                  >
                    {resendIn > 0 ? `Resend code in ${mm}:${ss}` : 'Resend code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// PhoneChangeModal
// ═══════════════════════════════════════════════════════════════

function PhoneChangeModal({
  visible,
  currentPhone,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentPhone: string;
  onClose: () => void;
  onSaved: (phone: string) => void;
}) {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  React.useEffect(() => {
    if (visible) {
      setStep('input');
      setPhone('');
      setOtp('');
      setError(null);
      setResendIn(0);
    }
  }, [visible]);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleSend = async () => {
    const value = phone.trim();
    if (!value) {
      setError('Enter your new phone number.');
      return;
    }
    if (!isValidPhone(value)) {
      setError('Enter a valid Nigerian number.');
      return;
    }
    if (value === currentPhone) {
      setError('That is already your current number.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await api.auth.forgotPasswordSend(value);
      setStep('verify');
      setResendIn(RESEND_SECONDS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== MIN_OTP_LENGTH) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (otp !== MOCK_OTP) {
      setError('Incorrect code. Try again.');
      setOtp('');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      await api.user.updateMe({ phone: phone.trim() });
      onSaved(phone.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update number.');
    } finally {
      setVerifying(false);
    }
  };

  const mm = String(Math.floor(resendIn / 60)).padStart(2, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/25 justify-end" onPress={onClose}>
        <Pressable onPress={() => {}} className="bg-surface rounded-t-4xl">
          <View className="px-6 pt-3 pb-8">
            <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
            <Text className="text-body font-gabarito text-ink text-center mb-6">
              Change Phone Number
            </Text>

            {step === 'input' ? (
              <View className="gap-5">
                <Input
                  label="NEW PHONE NUMBER"
                  uppercaseLabel
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(sanitizePhone(v));
                    if (error) setError(null);
                  }}
                  placeholder="08034567890"
                  keyboardType="phone-pad"
                  leftIcon={<Feather name="phone" size={18} color={colors.subtle} />}
                  error={error ?? undefined}
                  editable={!sending}
                />
                <Button
                  variant="primary"
                  fullWidth
                  loading={sending}
                  disabled={!phone.trim()}
                  onPress={handleSend}
                >
                  Send Verification Code
                </Button>
              </View>
            ) : (
              <View className="gap-5">
                <Text className="text-body-xs font-figtree text-muted text-center">
                  We sent a 6-digit code to{' '}
                  <Text className="font-figtree-bold text-ink">{phone}</Text>
                </Text>

                <Input
                  label="VERIFICATION CODE"
                  uppercaseLabel
                  value={otp}
                  onChangeText={(v) => {
                    setOtp(v.replace(/\D/g, '').slice(0, 6));
                    if (error) setError(null);
                  }}
                  placeholder="123456"
                  keyboardType="number-pad"
                  error={error ?? undefined}
                  editable={!verifying}
                />

                <Button
                  variant="primary"
                  fullWidth
                  loading={verifying}
                  disabled={otp.length !== MIN_OTP_LENGTH}
                  onPress={handleVerify}
                >
                  Verify &amp; Save
                </Button>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={resendIn > 0}
                  className="items-center"
                  hitSlop={8}
                >
                  <Text
                    className={`text-body-xs font-figtree-bold ${
                      resendIn > 0 ? 'text-text-light' : 'text-primary'
                    }`}
                  >
                    {resendIn > 0 ? `Resend code in ${mm}:${ss}` : 'Resend code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// SheetOption
// ═══════════════════════════════════════════════════════════════

function SheetOption({
  icon,
  label,
  onPress,
  destructive,
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