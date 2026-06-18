import { useAuth } from "@clerk/expo";
import { Image, type ImageProps } from "expo-image";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  type GestureResponderEvent,
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
    title: "Welcome to",
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
    imageWidthRatio: 0.62,
    maxImageWidth: 226,
  },
  {
    id: "insights",
    image: images.onboardingInsights,
    title: "See your patterns",
    description:
      "Explore statistics and trends to\nidentify what might be triggering\nyour headaches.",
    imageRatio: 205 / 190,
    imageWidthRatio: 0.6,
    maxImageWidth: 220,
  },
  {
    id: "reminders",
    image: images.onboardingReminders,
    title: "Stay on track",
    description:
      "Set medication reminders and\nnever miss an important dose\nagain.",
    imageRatio: 205 / 190,
    imageWidthRatio: 0.61,
    maxImageWidth: 224,
  },
  {
    id: "export",
    image: images.onboardingExport,
    title: "Share with your doctor",
    description:
      "Export a detailed PDF report\nto print or share with your\ndoctor anytime.",
    imageRatio: 210 / 185,
    imageWidthRatio: 0.6,
    maxImageWidth: 220,
  },
];

export default function OnboardingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const swipeStart = useRef<{ x: number; y: number; pageIndex: number } | null>(
    null,
  );
  const lastSwipeAt = useRef(0);
  const { width, height } = useWindowDimensions();
  const isLastPage = pageIndex === onboardingPages.length - 1;
  const currentPage = onboardingPages[pageIndex];
  const imageFrameHeight = Math.min(Math.max(height * 0.37, 266), 320);
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

  const handleSwipeStart = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    swipeStart.current = { x: pageX, y: pageY, pageIndex };
  };

  const handleSwipeEnd = (event: GestureResponderEvent) => {
    const swipe = swipeStart.current;

    if (!swipe) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const deltaX = pageX - swipe.x;
    const deltaY = pageY - swipe.y;
    swipeStart.current = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
      return;
    }

    const now = Date.now();
    if (now - lastSwipeAt.current < 400) {
      return;
    }

    lastSwipeAt.current = now;

    if (deltaX < 0) {
      setPageIndex(Math.min(swipe.pageIndex + 1, onboardingPages.length - 1));
      return;
    }

    setPageIndex(Math.max(swipe.pageIndex - 1, 0));
  };

  const handleNextPress = () => {
    if (isLastPage) {
      finishOnboarding();
      return;
    }

    goToNextPage();
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

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

      <View
        className="flex-1 px-7"
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleSwipeStart}
        onResponderRelease={handleSwipeEnd}
        onResponderTerminate={() => {
          swipeStart.current = null;
        }}
      >
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
          {currentPage.accentTitle ? (
            <View className="flex-row items-center justify-center">
              <Text className="headly-text-h3 text-center">
                {currentPage.title}
              </Text>
              <Image
                source={images.logo}
                contentFit="contain"
                accessibilityLabel={currentPage.accentTitle}
                style={{
                  height: 24,
                  marginLeft: 2,
                  transform: [{ translateY: 1 }],
                  width: 73,
                }}
              />
            </View>
          ) : (
            <Text className="headly-text-h3 text-center">
              {currentPage.title}
            </Text>
          )}
          <Text className="mt-[13px] text-center font-headly text-[12px] leading-[19px] text-headly-text-primary">
            {currentPage.description}
          </Text>
        </View>
      </View>

      <View className="gap-[30px] px-7 pb-9">
        <View className="h-[10px] flex-row items-center justify-center gap-[11px]">
          {onboardingPages.map((page, index) => (
            <View
              key={page.id}
              className={
                index === pageIndex
                  ? "h-[10px] w-[10px] rounded-full bg-headly-teal"
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
