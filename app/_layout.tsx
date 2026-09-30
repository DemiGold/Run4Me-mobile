import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import {
  useFonts,
  Gabarito_700Bold,
  Gabarito_800ExtraBold,
} from "@expo-google-fonts/gabarito";
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";

import { colors } from "@/constants/colors";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Gabarito_700Bold,       // ← new
    Gabarito_800ExtraBold,
    Figtree_400Regular,     // ← new
    Figtree_500Medium,
    Figtree_700Bold,
  });

  // Gate the entire app behind font load.
  // Show a plain teal screen (matches splash bg) so there's no flash of white.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.primary }} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}