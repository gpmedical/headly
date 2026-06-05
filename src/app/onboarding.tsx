import { Image, type ImageProps } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

type OnboardingPage = {
  id: string;
  image: ImageProps["source"];
  title: string;
  accentTitle?: string;
  description: string;
  imageRatio: number;
  imageWidthRatio: number;
  maxImageWidth: number;
};

const onboardingPages: OnboardingPage[] = [
  {
    id: "intro",
    image: images.onboarding,
    title: "Welcome to ",
    accentTitle: "Headly",
    description: "Understand your headaches.\nTake control of your well-being.",
    imageRatio: 565 / 765,
    imageWidthRatio: 0.74,
    maxImageWidth: 286,
  },
  {
    id: "track",
    image: images.onboardingTrack,
    title: "Track with ease",
    description:
      "Log headache episodes, symptoms,\ntriggers, and medications in just\na few taps.",
    imageRatio: 215 / 190,
    imageWidthRatio: 0.48,
    maxImageWidth: 196,
  },
  {
    id: "insights",
    image: images.onboardingInsights,
    title: "See your patterns",
    description:
      "Explore statistics and trends to\nidentify what might be triggering\nyour headaches.",
    imageRatio: 205 / 190,
    imageWidthRatio: 0.48,
    maxImageWidth: 196,
  },
  {
    id: "reminders",
    image: images.onboardingReminders,
    title: "Stay on track",
    description:
      "Set medication reminders and\nnever miss an important dose\nagain.",
    imageRatio: 205 / 190,
    imageWidthRatio: 0.48,
    maxImageWidth: 196,
  },
  {
    id: "export",
    image: images.onboardingExport,
    title: "Share with your doctor",
    description:
      "Export a detailed PDF report\nto print or share with your\ndoctor anytime.",
    imageRatio: 210 / 185,
    imageWidthRatio: 0.47,
    maxImageWidth: 190,
  },
];

export default function OnboardingScreen() {
  const [pageIndex, setPageIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const isLastPage = pageIndex === onboardingPages.length - 1;
  const currentPage = onboardingPages[pageIndex];
  const imageFrameHeight = Math.min(Math.max(height * 0.38, 270), 330);
  const imageWidth = Math.min(
    width * currentPage.imageWidthRatio,
    currentPage.maxImageWidth,
  );

  const finishOnboarding = () => {
    router.replace("/");
  };

  const goToNextPage = useCallback(() => {
    setPageIndex((currentIndex) =>
      Math.min(currentIndex + 1, onboardingPages.length - 1),
    );
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPageIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }, []);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          Math.abs(gestureState.dx) > 16 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5,
        onPanResponderRelease: (_event, gestureState) => {
          if (gestureState.dx <= -50) {
            goToNextPage();
          }

          if (gestureState.dx >= 50) {
            goToPreviousPage();
          }
        },
      }),
    [goToNextPage, goToPreviousPage],
  );

  const handleNextPress = () => {
    if (isLastPage) {
      finishOnboarding();
      return;
    }

    goToNextPage();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />

      <View className="h-14 items-end justify-center px-7">
        {!isLastPage ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            className="min-h-8 justify-center px-1"
            onPress={finishOnboarding}
          >
            <Text className="font-headly-medium text-sm text-headly-teal">
              Skip
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 px-7" {...swipeResponder.panHandlers}>
        <View
          style={{ height: imageFrameHeight }}
          className="items-center justify-center"
        >
          <Image
            source={currentPage.image}
            contentFit="contain"
            style={{
              width: imageWidth,
              height: imageWidth * currentPage.imageRatio,
            }}
          />
        </View>

        <View className="items-center">
          <Text className="headly-text-h3 text-center">
            {currentPage.title}
            {currentPage.accentTitle ? (
              <Text className="headly-text-h3 text-headly-teal">
                {currentPage.accentTitle}
              </Text>
            ) : null}
          </Text>
          <Text className="headly-text-body-small mt-4 text-center text-headly-text-primary">
            {currentPage.description}
          </Text>
        </View>
      </View>

      <View className="gap-8 px-7 pb-9">
        <View className="h-3 flex-row items-center justify-center gap-3">
          {onboardingPages.map((page, index) => (
            <View
              key={page.id}
              className={
                index === pageIndex
                  ? "h-3 w-3 rounded-full bg-headly-teal"
                  : "h-2 w-2 rounded-full bg-[#DADDE8]"
              }
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          className="h-12 items-center justify-center rounded-[14px] bg-headly-teal"
          onPress={handleNextPress}
        >
          <Text className="font-headly-medium text-base text-white">
            {isLastPage ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
