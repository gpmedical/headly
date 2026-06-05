import "../../global.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { colors, fontAssets, fontFamilies } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [fontFamilies.regular]: fontAssets.regular,
    [fontFamilies.medium]: fontAssets.medium,
    [fontFamilies.semiBold]: fontAssets.semiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.neutral.background },
        headerShown: false,
      }}
    />
  );
}
