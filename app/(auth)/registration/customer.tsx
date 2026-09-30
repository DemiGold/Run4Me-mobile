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

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { colors } from '@/constants/colors';
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
} from '@/constants/validators';

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  agree?: string;
}

export default function CustomerRegistration() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  const { minDob, maxDob } = useMemo(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    const oneHundredTwentyYearsAgo = new Date(today.getFullYear() - 120, 0, 1);
    return { minDob: oneHundredTwentyYearsAgo, maxDob: eighteenYearsAgo };
  }, []);

  // ─── Per-field validators (used on blur + on submit) ───
  const validateName = (v: string): string | undefined => {
    if (!v.trim()) return 'Enter your full name.';
    if (!isValidName(v)) return 'Letters only, and include first + last name.';
    return undefined;
  };

  const validateEmail = (v: string): string | undefined => {
    if (!v.trim()) return 'Enter your email address.';
    if (!isValidEmail(v)) return 'Enter a valid email address.';
    return undefined;
  };

  const validatePhone = (v: string): string | undefined => {
    if (!v.trim()) return 'Enter your phone number.';
    if (!isValidPhone(v)) return 'Enter a valid Nigerian number (e.g. 08034567890).';
    return undefined;
  };

  const validateDob = (v: Date | null): string | undefined => {
    if (!v) return 'Select your date of birth.';
    if (v > maxDob) return 'You must be at least 18 years old.';
    return undefined;
  };

  const validateTerms = (v: boolean): string | undefined =>
    v ? undefined : 'You must accept the terms to continue.';

  // ─── Full-form validation for submit ───
  const validate = (): boolean => {
    const next: FieldErrors = {
      fullName: validateName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
      dob: validateDob(dob),
      agree: validateTerms(agree),
    };
    // Strip undefined keys so the error object only has real errors
    (Object.keys(next) as (keyof FieldErrors)[]).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));

      setUser({
        id: `customer-${Date.now()}`,
        role: 'customer',
        email: email.trim(),
        name: fullName.trim(),
      });

      router.push({
        pathname: '/(auth)/otp',
        params: { identifier: phone.trim() },
      });
    } catch {
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* top-section */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 w-8"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="arrow-left" size={24} color={colors.ink} />
            </TouchableOpacity>

            <Text className="text-body font-gabarito text-ink text-center">
              Register Profile
            </Text>

            <View className="flex-row items-center justify-end w-8">
              <Text className="text-body-sm font-figtree-bold text-primary">1</Text>
              <Text className="text-body-sm font-figtree text-text-light">/3</Text>
            </View>
          </View>

          <View className="h-1.5 bg-border rounded-full mx-6 overflow-hidden">
            <View className="h-full bg-primary rounded-full w-1/3" />
          </View>
        </View>

        {/* registration-form */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6 gap-5">
            <View>
              <Text className="text-heading-sm font-gabarito text-ink mb-1.5">
                Create Customer Account
              </Text>
              <Text className="text-body-sm font-figtree text-muted">
                Let's get to know you. Please provide correct details.
              </Text>
            </View>

            {/* Full Name */}
            <Input
              label="Full Name (First and Last name)"
              value={fullName}
              onChangeText={(v) => {
                setFullName(sanitizeName(v));
                if (errors.fullName)
                  setErrors({ ...errors, fullName: undefined });
              }}
              onBlur={() => {
                if (fullName)
                  setErrors({ ...errors, fullName: validateName(fullName) });
              }}
              placeholder="Enter full name"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.fullName}
              editable={!loading}
            />

            {/* Email */}
            <Input
              label="Email Address"
              value={email}
              onChangeText={(v) => {
                setEmail(v.trimStart());
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              onBlur={() => {
                if (email)
                  setErrors({ ...errors, email: validateEmail(email) });
              }}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              editable={!loading}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(v) => {
                setPhone(sanitizePhone(v));
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              onBlur={() => {
                if (phone)
                  setErrors({ ...errors, phone: validatePhone(phone) });
              }}
              placeholder="08034567890"
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon={<Feather name="phone" size={18} color={colors.subtle} />}
              error={errors.phone}
              editable={!loading}
            />

            {/* Date of Birth */}
            <DatePickerField
              label="Date of Birth"
              value={dob}
              onChange={(d) => {
                if (!(d instanceof Date) || isNaN(d.getTime())) return;
                setDob(d);
                if (errors.dob) setErrors({ ...errors, dob: undefined });
              }}
              placeholder="DD / MM / YYYY"
              error={errors.dob}
              minimumDate={minDob}
              maximumDate={maxDob}
              editable={!loading}
            />

            {/* checkbox-terms */}
            <View>
              <TouchableOpacity
                className="flex-row items-start"
                onPress={() => {
                  setAgree(!agree);
                  if (errors.agree) setErrors({ ...errors, agree: undefined });
                }}
                activeOpacity={0.8}
                disabled={loading}
              >
                <View
                  className={`
                    w-5 h-5 rounded-md border-2 mr-3 mt-0.5 items-center justify-center
                    ${agree ? 'bg-primary border-primary' : 'border-border-light bg-transparent'}
                  `}
                >
                  {agree && <Feather name="check" size={12} color={colors.white} />}
                </View>
                <Text className="flex-1 text-body-xs font-figtree text-muted">
                  I agree to Run4Me's{' '}
                  <Text className="text-body-xs font-figtree-bold text-primary">
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text className="text-body-xs font-figtree-bold text-primary">
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {errors.agree ? (
                <Text className="text-body-xs font-figtree text-status-error mt-1.5 ml-8">
                  {errors.agree}
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* bottom-section */}
        <View className="px-6 pb-6 pt-3 bg-surface">
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleContinue}
          >
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}