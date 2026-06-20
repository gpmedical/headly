import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { type Href, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  type ViewStyle,
  View,
} from "react-native";

import { MainScreen } from "@/components/navigation/main-screen";
import { images } from "@/constants/images";
import {
  dashboardLastEpisode,
  dashboardMetrics,
  dashboardReminder,
  dashboardTrend,
} from "@/data/dashboard";

const chartHeight = 70;
const interactiveScale: ViewStyle = { transform: [{ scale: 0.98 }] };

function interactiveFeedback({ pressed }: { pressed: boolean }) {
  return pressed ? interactiveScale : undefined;
}

function navigateTo(href: Href) {
  router.push(href);
}

function TrendLine({ width }: { width: number }) {
  const segments = dashboardTrend.slice(0, -1).map((point, index) => {
    const nextPoint = dashboardTrend[index + 1];
    const x1 = point.x * width;
    const y1 = point.y;
    const x2 = nextPoint.x * width;
    const y2 = nextPoint.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return {
      angle,
      length,
      left: x1 + dx / 2 - length / 2,
      top: y1 + dy / 2 - 1,
    };
  });

  return (
    <View style={{ height: chartHeight, width }} className="relative">
      {segments.map((segment, index) => (
        <View
          key={`${segment.left}-${index}`}
          style={{
            height: 2,
            left: segment.left,
            position: "absolute",
            top: segment.top,
            transform: [{ rotateZ: `${segment.angle}rad` }],
            width: segment.length,
          }}
          className="rounded-full bg-[#8D7DDE]"
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const [chartWidth, setChartWidth] = useState(0);
  const firstName = user?.firstName?.trim();
  const greeting = firstName ? `Hello, ${firstName}` : "Hello!";

  return (
    <MainScreen>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 22,
          paddingHorizontal: 23,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-[17px] flex-row items-start justify-between">
          <View>
            <Text className="font-headly-semibold text-[21px] leading-[27px] text-[#111827]">
              {greeting}
            </Text>
            <Text className="font-headly-medium text-[14px] leading-[19px] text-[#111827]">
              Here's your summary
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Open reminders"
            accessibilityRole="button"
            className="h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/80 active:bg-white"
            onPress={() => {
              navigateTo("/reminders" as Href);
            }}
            style={interactiveFeedback}
          >
            <Image
              source={images.bellOutlineIcon}
              contentFit="contain"
              style={{ height: 23, width: 23 }}
            />
          </Pressable>
        </View>

        <View className="headly-dashboard__card px-[18px] pb-[13px] pt-[17px]">
          <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
            This Month
          </Text>

          <View className="mt-[18px] flex-row justify-between px-[7px]">
            {dashboardMetrics.map((metric) => (
              <View key={metric.label} className="min-w-[70px]">
                <Text className="font-headly-semibold text-[25px] leading-[29px] text-[#111827]">
                  {metric.value}
                </Text>
                <Text className="mt-[2px] font-headly-medium text-[10px] leading-[13px] text-[#4B5563]">
                  {metric.label}
                </Text>
              </View>
            ))}
          </View>

          <View
            className="mt-[19px] w-full"
            onLayout={(event) => {
              const nextWidth = event.nativeEvent.layout.width;
              setChartWidth((currentWidth) =>
                Math.abs(currentWidth - nextWidth) > 0.5
                  ? nextWidth
                  : currentWidth,
              );
            }}
          >
            {chartWidth > 0 ? (
              <TrendLine width={chartWidth} />
            ) : (
              <View style={{ height: chartHeight }} />
            )}
          </View>

          <View className="mt-[5px] flex-row justify-between">
            <Text className="font-headly-medium text-[10px] leading-[13px] text-[#667085]">
              May 1
            </Text>
            <Text className="font-headly-medium text-[10px] leading-[13px] text-[#667085]">
              May 15
            </Text>
            <Text className="font-headly-medium text-[10px] leading-[13px] text-[#667085]">
              May 31
            </Text>
          </View>
        </View>

        <View className="headly-dashboard__card mt-[18px] px-[18px] pb-[17px] pt-[15px]">
          <View className="flex-row items-center justify-between">
            <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
              Last Episode
            </Text>
          </View>

          <View className="mt-[13px] flex-row items-center justify-between">
            <Text className="font-headly-medium text-[13px] leading-[17px] text-[#1F2937]">
              {dashboardLastEpisode.date}
            </Text>
            <View className="h-[24px] min-w-[62px] items-center justify-center rounded-full bg-[#9075CB] px-3">
              <Text className="font-headly-semibold text-[13px] leading-[16px] text-white">
                {dashboardLastEpisode.intensity}
              </Text>
            </View>
          </View>

          <View className="mt-[15px] flex-row items-center gap-[22px]">
            <View className="flex-row items-center gap-[8px]">
              <Image
                source={images.locationTinyIcon}
                contentFit="contain"
                style={{ height: 17, width: 17 }}
              />
              <Text className="font-headly-medium text-[13px] leading-[17px] text-[#374151]">
                {dashboardLastEpisode.location}
              </Text>
            </View>

            <View className="flex-row items-center gap-[8px]">
              <Image
                source={images.clockTinyIcon}
                contentFit="contain"
                style={{ height: 17, width: 17 }}
              />
              <Text className="font-headly-medium text-[13px] leading-[17px] text-[#374151]">
                {dashboardLastEpisode.duration}
              </Text>
            </View>
          </View>

          <View className="mt-[13px] flex-row items-center gap-[8px]">
            <Image
              source={images.symptomTinyIcon}
              contentFit="contain"
              style={{ height: 17, width: 17 }}
            />
            <Text className="font-headly-medium text-[13px] leading-[17px] text-[#374151]">
              {dashboardLastEpisode.symptoms}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Open upcoming reminder"
          accessibilityRole="button"
          className="headly-dashboard__card mt-[18px] cursor-pointer flex-row items-center justify-between px-[18px] py-[19px] hover:shadow-headly-md"
          onPress={() => {
            navigateTo("/reminders" as Href);
          }}
          style={interactiveFeedback}
        >
          <View>
            <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
              Upcoming Reminder
            </Text>
            <View className="mt-[13px] flex-row items-center gap-[13px]">
              <View className="h-[28px] w-[34px]">
                <View
                  className="absolute left-0 top-0 h-[18px] w-[24px] rounded-full border-[2px] border-[#1E7482] bg-[#34C8B7]"
                  style={{ transform: [{ rotateZ: "-42deg" }] }}
                />
                <View className="absolute bottom-0 right-0 h-[14px] w-[18px] rounded-full border-[2px] border-[#6D6EB7] bg-[#F7F6FF]" />
              </View>
              <View>
                <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
                  {dashboardReminder.medication}
                </Text>
                <Text className="mt-[3px] font-headly-medium text-[11px] leading-[14px] text-[#667085]">
                  {dashboardReminder.time}
                </Text>
              </View>
            </View>
          </View>

          <Image
            source={images.chevronRightIcon}
            contentFit="contain"
            style={{ height: 20, width: 20 }}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Log new headache"
          accessibilityRole="button"
          className="headly-dashboard__cta mt-[22px] cursor-pointer hover:bg-[#159B99] hover:shadow-headly-md active:bg-[#0F8F8D]"
          onPress={() => {
            navigateTo("/log-headache" as Href);
          }}
          style={interactiveFeedback}
        >
          <Image
            source={images.plusIcon}
            contentFit="contain"
            style={{ height: 18, width: 18 }}
          />
          <Text className="ml-[12px] font-headly-semibold text-[14px] leading-[18px] text-white">
            Log New Headache
          </Text>
        </Pressable>
      </ScrollView>
    </MainScreen>
  );
}
