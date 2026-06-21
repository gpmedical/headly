import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { MainScreen } from "@/components/navigation/main-screen";
import {
  StatisticsContent,
  StatisticsHeader,
  StatsTabBar,
} from "@/components/stats/statistics-content";
import { useHeadacheHistory } from "@/hooks/use-headache-history";
import { getStatsData, type StatsTab, type StatsTimeRange } from "@/lib/stats";

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");
  const [selectedRange, setSelectedRange] =
    useState<StatsTimeRange>("thisMonth");
  const historyQuery = useMemo(
    () => ({
      minimumIntensity: 0,
      range: "all" as const,
    }),
    [],
  );
  const { data: historyEntries, error, isLoading } =
    useHeadacheHistory(historyQuery);
  const stats = useMemo(
    () => getStatsData(historyEntries, selectedRange),
    [historyEntries, selectedRange],
  );

  return (
    <MainScreen>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 28,
          paddingHorizontal: 23,
          paddingTop: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <StatisticsHeader />
        <StatsTabBar activeTab={activeTab} onChange={setActiveTab} />

        <View className="mt-[17px]">
          {isLoading ? (
            <View className="headly-dashboard__card items-center px-[18px] py-[28px]">
              <Text className="text-center font-headly-semibold text-[14px] leading-[19px] text-[#111827]">
                Loading statistics
              </Text>
            </View>
          ) : error ? (
            <View className="headly-dashboard__card items-center px-[18px] py-[28px]">
              <Text className="text-center font-headly-semibold text-[14px] leading-[19px] text-[#111827]">
                {error}
              </Text>
            </View>
          ) : (
            <StatisticsContent
              activeTab={activeTab}
              onRangeChange={setSelectedRange}
              selectedRange={selectedRange}
              stats={stats}
            />
          )}
        </View>
      </ScrollView>
    </MainScreen>
  );
}
