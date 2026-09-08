import { Redirect } from 'expo-router';

export default function AppEntry() {
  // Always show splash first (for everyone)
  return <Redirect href="/(auth)/splash" />;
}