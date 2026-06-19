import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants/images";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { colors } from "@/theme";

export default function Index() {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 34,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center px-6">
          <Image
            source={images.onboarding}
            className="h-[230px] w-full max-w-[320px]"
            contentFit="contain"
          />
          <Image
            source={images.logo}
            className="mt-10 h-[64px] w-[192px]"
            contentFit="contain"
          />
          <Text className="mt-5 text-center font-headly-semibold text-[27px] leading-[35px] text-headly-text-primary">
            Understand your headaches.
          </Text>
          <Text className="mt-3 max-w-[300px] text-center font-headly text-[15px] leading-[24px] text-headly-text-secondary">
            Track episodes, spot patterns, be in control.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
