import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants/images";
import { colors } from "@/theme";

export default function Index() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
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
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            className="headly-auth__primary mt-10"
            onPress={() => router.push("/onboarding" as Href)}
          >
            <Text className="font-headly-semibold text-[15px] leading-5 text-white">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
