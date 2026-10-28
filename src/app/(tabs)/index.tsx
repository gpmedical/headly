import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { type Href, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  type ViewStyle,
  View,
} from "react-native";

import { MainScreen } from "@/components/navigation/main-screen";
import { images } from "@/constants/images";
import { dashboardReminder } from "@/data/dashboard";
import { useHeadacheHistory } from "@/hooks/use-headache-history";
import {
  getDashboardLastEpisode,
  getDashboardMetrics,
  getDashboardTrend,
} from "@/lib/history";

const chartHeight = 70;
const interactiveScale: ViewStyle = { transform: [{ scale: 0.98 }] };

function interactiveFeedback({ pressed }: { pressed: boolean }) {
  return pressed ? interactiveScale : undefined;
}

function navigateTo(href: Href) {
  router.navigate(href);
}

function getTrendY(intensity: number) {
  const clampedIntensity = Math.max(0, Math.min(10, intensity));

  return chartHeight - 8 - (clampedIntensity / 10) * (chartHeight - 16);
}

function TrendLine({
  points,
  width,
}: {
  points: { intensity: number; x: number }[];
  width: number;
}) {
  const segments = points.slice(0, -1).map((point, index) => {
    const nextPoint = points[index + 1];
    const x1 = point.x * width;
    const y1 = getTrendY(point.intensity);
    const x2 = nextPoint.x * width;
    const y2 = getTrendY(nextPoint.intensity);
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
  const monthlyHistoryQuery = useMemo(
    () => ({
      minimumIntensity: 0,
      range: "month" as const,
    }),
    [],
  );
  const allHistoryQuery = useMemo(
    () => ({
      minimumIntensity: 0,
      range: "all" as const,
    }),
    [],
  );
  const { data: monthlyHistoryEntries } =
    useHeadacheHistory(monthlyHistoryQuery);
  const { data: allHistoryEntries } = useHeadacheHistory(allHistoryQuery);
  const dashboardMetrics = useMemo(
    () => getDashboardMetrics(monthlyHistoryEntries),
    [monthlyHistoryEntries],
  );
  const dashboardTrend = useMemo(
    () => getDashboardTrend(monthlyHistoryEntries),
    [monthlyHistoryEntries],
  );
  const dashboardLastEpisode = useMemo(
    () => getDashboardLastEpisode(allHistoryEntries),
    [allHistoryEntries],
  );
  const firstName = user?.firstName?.trim();
  const greeting = firstName ? `Hello, ${firstName}` : "Hello!";

  return (
    <MainScreen>
      <ScrollView contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 23,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-[24px] flex-row items-center justify-between">
          <View className="min-w-0 flex-1 pr-[12px]">
            <Text className="font-headly-semibold text-[28px] leading-[36px] text-[#111827]">
              {greeting}
            </Text>
            <Text className="mt-[4px] font-headly-medium text-[14px] leading-[21px] text-[#111827]">
              Here&apos;s your summary
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Open reminders"
            accessibilityRole="button"
            className="h-12 w-12 shrink-0 bg-white cursor-pointer items-center justify-center rounded-full hover:bg-white/80 active:bg-white"
            onPress={() => {
              navigateTo("/reminders" as Href);
            }}
            style={interactiveFeedback}
          >
            <Image
              source={process.env.EXPO_OS === "ios" ? "sf:bell" : images.bellOutlineIcon}
              tintColor="#1F2740"
              contentFit="contain"
              style={{ height: 23, width: 23 }}
            />
          </Pressable>
        </View>

        <View className="headly-dashboard__hero px-[24px] pb-[24px] pt-[24px]">
          <Text className="font-headly-semibold text-[15px] leading-[21px] text-[#111827]">
            This Month
          </Text>

          <View className="mt-[22px] flex-row flex-wrap justify-between gap-[8px]">
            {dashboardMetrics.map((metric) => (
              <View key={metric.label} className="min-w-[70px] grow rounded-[16px] bg-white/60 px-[10px] py-[12px]">
                <Text className="font-headly-semibold text-[34px] leading-[42px] text-[#111827]">
                  {metric.value}
                </Text>
                <Text className="mt-[4px] font-headly-medium text-[11px] leading-[16px] text-[#4B5563]">
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
            {chartWidth > 0 && dashboardTrend.length > 0 ? (
              <TrendLine points={dashboardTrend} width={chartWidth} />
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

        <View className="headly-dashboard__card mt-[20px] px-[22px] pb-[22px] pt-[22px]">
          <View className="flex-row items-center justify-between">
            <Text className="font-headly-semibold text-[15px] leading-[21px] text-[#111827]">
              Last Episode
            </Text>
          </View>

          <View className="mt-[13px] flex-row items-center justify-between">
            <Text className="font-headly-medium text-[13px] leading-[17px] text-[#1F2937]">
              {dashboardLastEpisode?.date ?? "No episodes logged"}
            </Text>
            <View className="min-h-[30px] min-w-[68px] items-center justify-center rounded-full bg-[#9075CB] px-3">
              <Text className="font-headly-semibold text-[13px] leading-[16px] text-white">
                {dashboardLastEpisode?.intensity ?? "0/10"}
              </Text>
            </View>
          </View>

          <View className="mt-[18px] flex-row flex-wrap items-center gap-[18px]">
            <View className="flex-row items-center gap-[8px]">
              <Image
                source={images.locationTinyIcon}
                contentFit="contain"
                style={{ height: 17, width: 17 }}
              />
              <Text className="font-headly-medium text-[13px] leading-[17px] text-[#374151]">
                {dashboardLastEpisode?.location ?? "No location"}
              </Text>
            </View>

            <View className="flex-row items-center gap-[8px]">
              <Image
                source={images.clockTinyIcon}
                contentFit="contain"
                style={{ height: 17, width: 17 }}
              />
              <Text className="font-headly-medium text-[13px] leading-[17px] text-[#374151]">
                {dashboardLastEpisode?.duration ?? "0h 0m"}
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
              {dashboardLastEpisode?.symptoms ?? "No symptoms logged"}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Open upcoming reminder"
          accessibilityRole="button"
          className="headly-dashboard__reminder mt-[20px] cursor-pointer flex-row items-center justify-between px-[22px] py-[22px] hover:shadow-headly-md"
          onPress={() => {
            navigateTo("/reminders" as Href);
          }}
          style={interactiveFeedback}
        >
          <View>
            <Text className="font-headly-semibold text-[15px] leading-[21px] text-[#111827]">
              Upcoming Reminder
            </Text>
            <View className="mt-[13px] flex-row items-center gap-[13px]">
              <View className="h-[48px] w-[48px] items-center justify-center rounded-[16px] bg-white">
                <Image source={images.capsule} contentFit="contain" style={{ width: 32, height: 32 }} />
              </View>
              <View>
                <Text className="font-headly-semibold text-[15px] leading-[21px] text-[#111827]">
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
