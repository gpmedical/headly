import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="headly-screen items-center justify-center px-6">
      <Text className="headly-text-h1 text-headly-teal">Headly</Text>
      <Text className="headly-text-body-large mt-3 text-center">
        Understand your headaches.{"\n"}Take control.
      </Text>
      <Link href="/onboarding" asChild>
        <Pressable
          accessibilityRole="button"
          className="mt-8 h-12 items-center justify-center rounded-[14px] bg-headly-teal px-8"
        >
          <Text className="font-headly-medium text-base text-white">
            Open onboarding
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

