// ─────────────────────────────────────────────────────────────
// AccountLayout
//
// Stack for the "account settings" screens reached from Profile:
// settings, saved addresses, help, FAQ, contact, safety, legal.
// ─────────────────────────────────────────────────────────────
import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}