import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    // Only run in the browser to avoid SSR issues
    if (typeof window !== "undefined") {
      // Tell react-native-css-interop that we use class-based dark mode
      StyleSheet.setFlag?.("darkMode", "class");
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}