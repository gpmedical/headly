import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { hasCompletedOnboarding } from "@/lib/onboarding";

import { BottomTabBar } from "./bottom-tab-bar";

type MainScreenProps = {
  children: ReactNode;
  backgroundColor?: string;
};

export function MainScreen({
  children,
  backgroundColor = "#F7F6FF",
}: MainScreenProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (!isUserLoaded || !user) {
    return null;
  }

  if (!hasCompletedOnboarding(user.unsafeMetadata)) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor }}>
      <StatusBar style="dark" />
      {children}
      <BottomTabBar />
    </SafeAreaView>
  );
}
