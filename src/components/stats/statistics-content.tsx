import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, Text, type ViewStyle, View } from "react-native";

import {
  statsTimeRangeOptions,
  type StatsData,
  type StatsRankItem,
  type StatsTab,
  type StatsTimeOfDayItem,
  type StatsTimeRange,
  type StatsTrendPoint,
  type TrendDirection,
} from "@/lib/stats";

const tabs: { label: string; value: StatsTab }[] = [
  { label: "Overview", value: "overview" },
  { label: "Triggers", value: "triggers" },
  { label: "Symptoms", value: "symptoms" },
  { label: "Medications", value: "medications" },
];

const chartHeight = 72;
const barChartHeight = 128;
const interactiveScale: ViewStyle = { transform: [{ scale: 0.98 }] };

type RangeFilterProps = {
  filterId: string;
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  onToggleFilter: (filterId: string) => void;
};

type RangeMenuProps = {
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
};

type InsightFilterProps = {
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
};

function interactiveFeedback({ pressed }: { pressed: boolean }) {
  return pressed ? interactiveScale : undefined;
}

function getTrendColor(direction: TrendDirection) {
  if (direction === "down") {
    return "#10A065";
  }

  if (direction === "up") {
    return "#F05A6B";
  }

  return "#8A93A6";
}

function getTrendArrow(direction: TrendDirection) {
  if (direction === "down") {
    return "↓";
  }

  if (direction === "up") {
    return "↑";
  }

  return "→";
}

function getSparklineY(intensity: number) {
  const clampedIntensity = Math.max(0, Math.min(10, intensity));

  return chartHeight - 10 - (clampedIntensity / 10) * (chartHeight - 20);
}

function getDonutUri(items: StatsTimeOfDayItem[]) {
  const circumference = 2 * Math.PI * 38;
  let offset = 0;
  const circles = items
    .map((item) => {
      const length = item.percent === 0 ? 0 : (item.percent / 100) * circumference;
      const dash = Math.max(0, length - 2.5);
      const circle = `<circle cx="52" cy="52" r="38" fill="none" stroke="${item.color}" stroke-width="18" stroke-linecap="butt" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 52 52)" />`;

      offset += length;
      return circle;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104"><circle cx="52" cy="52" r="38" fill="none" stroke="#F1EEF7" stroke-width="18"/>${circles}<circle cx="52" cy="52" r="26" fill="#FFFFFF"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function MiniTrendChart({ points }: { points: StatsTrendPoint[] }) {
  const [width, setWidth] = useState(0);
  const segments = points.slice(0, -1).map((point, index) => {
    const nextPoint = points[index + 1];
    const x1 = point.x * width;
    const y1 = getSparklineY(point.intensity);
    const x2 = nextPoint.x * width;
    const y2 = getSparklineY(nextPoint.intensity);
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
    <View
      className="h-[72px] flex-1 justify-end"
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setWidth((currentWidth) =>
          Math.abs(currentWidth - nextWidth) > 0.5 ? nextWidth : currentWidth,
        );
      }}
    >
      {width > 0 && segments.length > 0 ? (
        <View className="relative" style={{ height: chartHeight, width }}>
          {segments.map((segment, index) => (
            <View
              key={`${segment.left}-${index}`}
              className="absolute rounded-full bg-[#8D76DA]"
              style={{
                height: 2,
                left: segment.left,
                top: segment.top,
                transform: [{ rotateZ: `${segment.angle}rad` }],
                width: segment.length,
              }}
            />
          ))}
        </View>
      ) : (
        <View className="h-[72px]" />
      )}
    </View>
  );
}

export function StatisticsHeader() {
  return (
    <View className="h-[38px] justify-center">
      <Text className="text-center font-headly-semibold text-[16px] leading-[21px] text-[#111827]">
        Statistics
      </Text>
    </View>
  );
}

export function StatsTabBar({
  activeTab,
  onChange,
}: {
  activeTab: StatsTab;
  onChange: (tab: StatsTab) => void;
}) {
  return (
    <View className="mt-[17px] h-[31px] flex-row items-center justify-between">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={
              isSelected
                ? "h-[26px] cursor-pointer items-center justify-center rounded-full bg-[#14A4A1] px-[15px]"
                : "h-[26px] cursor-pointer items-center justify-center rounded-full px-[8px] hover:bg-white/80 active:bg-white"
            }
            onPress={() => {
              onChange(tab.value);
            }}
            style={interactiveFeedback}
          >
            <Text
              className={
                isSelected
                  ? "font-headly-semibold text-[11px] leading-[15px] text-white"
                  : "font-headly-medium text-[11px] leading-[15px] text-[#111827]"
              }
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MetricTrend({
  delta,
  direction,
}: {
  delta: string;
  direction: TrendDirection;
}) {
  return (
    <Text
      className="mt-[7px] font-headly-semibold text-[12px] leading-[16px]"
      style={{ color: getTrendColor(direction) }}
    >
      {getTrendArrow(direction)} {delta}
    </Text>
  );
}

function OverviewHeroCard({
  data,
  filterId,
  openFilterId,
  points,
  selectedRange,
  onChangeRange,
  onToggleFilter,
}: {
  data: StatsData["averageIntensity"];
  filterId: string;
  openFilterId: string | null;
  points: StatsTrendPoint[];
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
}) {
  const [value, denominator = "10"] = data.value.split("/");
  const isFilterOpen = openFilterId === filterId;

  return (
    <View
      className="headly-dashboard__card relative px-[17px] pb-[15px] pt-[16px]"
      style={{
        elevation: isFilterOpen ? 90 : 1,
        overflow: "visible",
        zIndex: isFilterOpen ? 90 : 1,
      }}
    >
      <View className="flex-row items-start justify-between gap-[10px]">
        <Text className="flex-1 font-headly-semibold text-[12px] leading-[16px] text-[#111827]">
          {data.label}
        </Text>
        <RangeFilterButton
          filterId={filterId}
          onToggleFilter={onToggleFilter}
          openFilterId={openFilterId}
          selectedRange={selectedRange}
        />
      </View>

      <View className="mt-[13px] flex-row items-end justify-between gap-[14px]">
        <View className="min-w-[88px]">
          <View className="flex-row items-end">
            <Text className="font-headly-semibold text-[34px] leading-[38px] text-[#111827]">
              {value}
            </Text>
            <Text className="mb-[4px] font-headly-medium text-[14px] leading-[18px] text-[#111827]">
              /{denominator}
            </Text>
          </View>
          <Text className="mt-[6px] font-headly-medium text-[11px] leading-[15px] text-[#7A8192]">
            {data.helper}
          </Text>
          <MetricTrend delta={data.delta} direction={data.direction} />
        </View>

        <MiniTrendChart points={points} />
      </View>

      {isFilterOpen ? (
        <RangeMenu
          onChangeRange={onChangeRange}
          selectedRange={selectedRange}
        />
      ) : null}
    </View>
  );
}

function SmallMetricCard({
  data,
  filterId,
  openFilterId,
  selectedRange,
  onChangeRange,
  onToggleFilter,
}: {
  data: StatsData["averageDuration"];
  filterId: string;
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
}) {
  const isFilterOpen = openFilterId === filterId;

  return (
    <View
      className="headly-dashboard__card relative flex-1 px-[17px] pb-[17px] pt-[16px]"
      style={{
        elevation: isFilterOpen ? 90 : 1,
        overflow: "visible",
        zIndex: isFilterOpen ? 90 : 1,
      }}
    >
      <View className="gap-[8px]">
        <Text className="font-headly-semibold text-[12px] leading-[16px] text-[#111827]">
          {data.label}
        </Text>
        <View className="items-start">
          <RangeFilterButton
            filterId={filterId}
            onToggleFilter={onToggleFilter}
            openFilterId={openFilterId}
            selectedRange={selectedRange}
          />
        </View>
      </View>
      <Text className="mt-[14px] font-headly-semibold text-[26px] leading-[31px] text-[#111827]">
        {data.value}
      </Text>
      <Text className="mt-[8px] font-headly-medium text-[11px] leading-[15px] text-[#7A8192]">
        {data.helper}
      </Text>
      <MetricTrend delta={data.delta} direction={data.direction} />

      {isFilterOpen ? (
        <RangeMenu
          onChangeRange={onChangeRange}
          selectedRange={selectedRange}
        />
      ) : null}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-[5px]">
      <View
        className="h-[7px] w-[7px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="font-headly-medium text-[10px] leading-[13px] text-[#667085]">
        {label}
      </Text>
    </View>
  );
}

function RangeFilterButton({
  filterId,
  openFilterId,
  selectedRange,
  onToggleFilter,
}: RangeFilterProps) {
  const isOpen = openFilterId === filterId;
  const selectedLabel =
    statsTimeRangeOptions.find((option) => option.value === selectedRange)
      ?.label ?? "This month";

  return (
    <View
      className="relative items-end"
      style={{ elevation: isOpen ? 60 : 1, zIndex: isOpen ? 60 : 1 } as ViewStyle}
    >
      <Pressable
        accessibilityLabel={`Change range, current range ${selectedLabel}`}
        accessibilityRole="button"
        className="h-[26px] cursor-pointer items-center justify-center rounded-full border border-[#D8EDEA] bg-[#F3FBFA] px-[11px] hover:bg-[#E8F8F7] active:bg-[#DDF4F3]"
        onPress={() => {
          onToggleFilter(filterId);
        }}
        style={interactiveFeedback}
      >
        <Text className="font-headly-semibold text-[10px] leading-[13px] text-[#0E817F]">
          {selectedLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function RangeMenu({ selectedRange, onChangeRange }: RangeMenuProps) {
  return (
    <View
      className="absolute right-[18px] top-[46px] w-[126px] rounded-[12px] border border-[#D9E5EB] bg-white py-[4px]"
      style={{
        boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.16)",
        elevation: 100,
        zIndex: 100,
      }}
    >
      {statsTimeRangeOptions.map((option) => {
        const isSelected = selectedRange === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={
              isSelected
                ? "mx-[4px] h-[30px] cursor-pointer justify-center rounded-[8px] bg-[#E6F6F5] px-[9px]"
                : "mx-[4px] h-[30px] cursor-pointer justify-center rounded-[8px] px-[9px] hover:bg-[#F7FAFC] active:bg-[#EEF7F7]"
            }
            onPress={() => {
              onChangeRange(option.value);
            }}
            style={interactiveFeedback}
          >
            <Text
              className={
                isSelected
                  ? "font-headly-semibold text-[11px] leading-[15px] text-[#0E817F]"
                  : "font-headly-medium text-[11px] leading-[15px] text-[#344054]"
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EpisodesByMonthCard({
  data,
  filterId,
  openFilterId,
  selectedRange,
  onChangeRange,
  onToggleFilter,
}: {
  data: StatsData["monthlyEpisodes"];
  filterId: string;
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
}) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => Math.max(item.thisYear, item.lastYear)),
  );
  const isFilterOpen = openFilterId === filterId;
  const selectedLabel =
    statsTimeRangeOptions.find((option) => option.value === selectedRange)
      ?.label ?? "This month";
  const monthBarLayoutClass =
    data.length <= 2
      ? "h-[128px] flex-row items-end justify-around pl-[6px]"
      : "h-[128px] flex-row items-end justify-between pl-[6px]";

  return (
    <View
      className="headly-dashboard__card relative px-[18px] pb-[18px] pt-[17px]"
      style={{
        elevation: isFilterOpen ? 90 : 1,
        overflow: "visible",
        zIndex: isFilterOpen ? 90 : 1,
      }}
    >
      <View className="flex-row items-start justify-between gap-[10px]">
        <View className="flex-1">
          <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
            Episodes by Month
          </Text>
          <Text className="mt-[2px] font-headly-medium text-[10px] leading-[13px] text-[#667085]">
            {selectedLabel}
          </Text>
        </View>
        <RangeFilterButton
          filterId={filterId}
          onToggleFilter={onToggleFilter}
          openFilterId={openFilterId}
          selectedRange={selectedRange}
        />
      </View>

      <View className="mt-[10px] flex-row items-center justify-end gap-[13px]">
        <LegendDot color="#A58BE1" label="Current" />
        <LegendDot color="#D9D2F1" label="Previous" />
      </View>

      <View className="mt-[13px] flex-row">
        <View className="h-[128px] w-[22px] justify-between pb-[17px]">
          {[
            maxValue,
            Math.round(maxValue * 0.75),
            Math.round(maxValue * 0.5),
            Math.round(maxValue * 0.25),
            0,
          ].map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="font-headly-medium text-[9px] leading-[11px] text-[#4B5563]"
            >
              {label}
            </Text>
          ))}
        </View>

        <View className="relative flex-1">
          <View className="absolute left-0 right-0 top-0 h-[111px] justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <View key={line} className="h-[1px] bg-[#E6EAF1]" />
            ))}
          </View>

          <View className={monthBarLayoutClass}>
            {data.map((item) => (
              <View key={item.label} className="h-full items-center justify-end">
                <View className="h-[111px] flex-row items-end gap-[4px]">
                  <View
                    className="w-[9px] rounded-t-[4px] bg-[#A58BE1]"
                    style={{
                      height: Math.max(
                        item.thisYear > 0 ? 5 : 0,
                        (item.thisYear / maxValue) * barChartHeight * 0.86,
                      ),
                    }}
                  />
                  <View
                    className="w-[9px] rounded-t-[4px] bg-[#D9D2F1]"
                    style={{
                      height: Math.max(
                        item.lastYear > 0 ? 5 : 0,
                        (item.lastYear / maxValue) * barChartHeight * 0.86,
                      ),
                    }}
                  />
                </View>
                <Text className="mt-[6px] font-headly-medium text-[10px] leading-[13px] text-[#4B5563]">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {isFilterOpen ? (
        <RangeMenu
          onChangeRange={onChangeRange}
          selectedRange={selectedRange}
        />
      ) : null}
    </View>
  );
}

function RankingCard({
  caption,
  emptyLabel,
  filterId,
  items,
  openFilterId,
  selectedRange,
  title,
  onChangeRange,
  onToggleFilter,
}: {
  caption: string;
  emptyLabel: string;
  filterId: string;
  items: StatsRankItem[];
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  title: string;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
}) {
  const isFilterOpen = openFilterId === filterId;

  return (
    <View
      className="headly-dashboard__card relative px-[18px] pb-[16px] pt-[15px]"
      style={{
        elevation: isFilterOpen ? 90 : 1,
        overflow: "visible",
        zIndex: isFilterOpen ? 90 : 1,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
            {title}
          </Text>
          <Text className="mt-[2px] font-headly-medium text-[10px] leading-[13px] text-[#667085]">
            {caption}
          </Text>
        </View>
        <RangeFilterButton
          filterId={filterId}
          onToggleFilter={onToggleFilter}
          openFilterId={openFilterId}
          selectedRange={selectedRange}
        />
      </View>

      <View className="mt-[14px] gap-[11px]">
        {items.length > 0 ? (
          items.slice(0, 5).map((item) => (
            <View key={item.label} className="flex-row items-center">
              <Text
                adjustsFontSizeToFit
                className="w-[142px] font-headly-semibold text-[11px] leading-[15px] text-[#1F2937]"
                minimumFontScale={0.86}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <View className="h-[9px] min-w-[58px] flex-1 overflow-hidden rounded-full bg-[#F1EEF7]">
                <View
                  className="h-[9px] rounded-full bg-[#BCA7E9]"
                  style={{ width: `${Math.max(6, item.percent)}%` }}
                />
              </View>
              <Text className="w-[43px] text-right font-headly-medium text-[11px] leading-[15px] text-[#344054]">
                {item.percent}%
              </Text>
            </View>
          ))
        ) : (
          <Text className="font-headly-medium text-[12px] leading-[17px] text-[#667085]">
            {emptyLabel}
          </Text>
        )}
      </View>

      {isFilterOpen ? (
        <RangeMenu
          onChangeRange={onChangeRange}
          selectedRange={selectedRange}
        />
      ) : null}
    </View>
  );
}

function TimeOfDayCard({
  filterId,
  items,
  openFilterId,
  selectedRange,
  onChangeRange,
  onToggleFilter,
}: {
  filterId: string;
  items: StatsTimeOfDayItem[];
  openFilterId: string | null;
  selectedRange: StatsTimeRange;
  onChangeRange: (range: StatsTimeRange) => void;
  onToggleFilter: (filterId: string) => void;
}) {
  const donutUri = useMemo(() => getDonutUri(items), [items]);
  const isFilterOpen = openFilterId === filterId;

  return (
    <View
      className="headly-dashboard__card relative px-[18px] pb-[17px] pt-[16px]"
      style={{
        elevation: isFilterOpen ? 90 : 1,
        overflow: "visible",
        zIndex: isFilterOpen ? 90 : 1,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="font-headly-semibold text-[13px] leading-[17px] text-[#111827]">
            Time of Day
          </Text>
          <Text className="mt-[2px] font-headly-medium text-[10px] leading-[13px] text-[#667085]">
            When headaches occur most
          </Text>
        </View>
        <RangeFilterButton
          filterId={filterId}
          onToggleFilter={onToggleFilter}
          openFilterId={openFilterId}
          selectedRange={selectedRange}
        />
      </View>

      <View className="mt-[17px] flex-row items-center justify-between">
        <Image
          source={{ uri: donutUri }}
          contentFit="contain"
          style={{ height: 118, width: 118 }}
        />

        <View className="min-w-[128px] gap-[12px]">
          {items.map((item) => (
            <View key={item.label} className="flex-row items-center">
              <View
                className="h-[8px] w-[8px] rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text className="ml-[10px] flex-1 font-headly-medium text-[11px] leading-[15px] text-[#1F2937]">
                {item.label}
              </Text>
              <Text className="font-headly-medium text-[11px] leading-[15px] text-[#344054]">
                {item.percent}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {isFilterOpen ? (
        <RangeMenu
          onChangeRange={onChangeRange}
          selectedRange={selectedRange}
        />
      ) : null}
    </View>
  );
}

function OverviewContent({
  filterProps,
  stats,
}: {
  filterProps: InsightFilterProps;
  stats: StatsData;
}) {
  return (
    <View className="gap-[16px]">
      <OverviewHeroCard
        data={stats.averageIntensity}
        filterId="overview-intensity"
        points={stats.intensityTrend}
        {...filterProps}
      />

      <View className="flex-row gap-[12px]">
        <SmallMetricCard
          data={stats.averageDuration}
          filterId="overview-duration"
          {...filterProps}
        />
        <SmallMetricCard
          data={stats.totalEpisodes}
          filterId="overview-episodes"
          {...filterProps}
        />
      </View>

      <EpisodesByMonthCard
        data={stats.monthlyEpisodes}
        filterId="overview-months"
        {...filterProps}
      />

      <TimeOfDayCard
        filterId="overview-time"
        items={stats.timeOfDay}
        {...filterProps}
      />
    </View>
  );
}

export function StatisticsContent({
  activeTab,
  selectedRange,
  stats,
  onRangeChange,
}: {
  activeTab: StatsTab;
  selectedRange: StatsTimeRange;
  stats: StatsData;
  onRangeChange: (range: StatsTimeRange) => void;
}) {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const filterProps: InsightFilterProps = {
    onChangeRange: (range) => {
      onRangeChange(range);
      setOpenFilterId(null);
    },
    onToggleFilter: (filterId) => {
      setOpenFilterId((currentFilterId) =>
        currentFilterId === filterId ? null : filterId,
      );
    },
    openFilterId,
    selectedRange,
  };

  if (activeTab === "triggers") {
    return (
      <View className="gap-[16px]">
        <RankingCard
          caption={stats.insightRangeLabel}
          emptyLabel="No triggers logged for this range."
          filterId="triggers-ranking"
          items={stats.triggerRanking}
          {...filterProps}
          title="Most Common Triggers"
        />
      </View>
    );
  }

  if (activeTab === "symptoms") {
    return (
      <View className="gap-[16px]">
        <RankingCard
          caption={stats.insightRangeLabel}
          emptyLabel="No symptoms logged for this range."
          filterId="symptoms-ranking"
          items={stats.symptomRanking}
          {...filterProps}
          title="Most Common Symptoms"
        />
      </View>
    );
  }

  if (activeTab === "medications") {
    return (
      <View className="gap-[16px]">
        <RankingCard
          caption={stats.insightRangeLabel}
          emptyLabel="No medications logged for this range."
          filterId="medications-ranking"
          items={stats.medicationRanking}
          {...filterProps}
          title="Most Common Medications"
        />
      </View>
    );
  }

  return <OverviewContent filterProps={filterProps} stats={stats} />;
}
