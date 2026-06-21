import { Image } from "expo-image";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  ScrollView,
  Text,
  type ViewStyle,
  View,
} from "react-native";

import { MainScreen } from "@/components/navigation/main-screen";
import { images } from "@/constants/images";
import { historyRangeOptions } from "@/data/history";
import { useHeadacheHistory } from "@/hooks/use-headache-history";
import {
  getHistoryEntryDateLabel,
  groupHistoryEntries,
} from "@/lib/history";
import { type HeadacheHistoryEntry, type HistoryRange } from "@/types/history";

const interactiveScale: ViewStyle = { transform: [{ scale: 0.97 }] };

function interactiveFeedback({ pressed }: { pressed: boolean }) {
  return pressed ? interactiveScale : undefined;
}

function getIntensityStyle(intensity: number) {
  if (intensity >= 8) {
    return {
      backgroundColor: "#C84D57",
      color: "#FFFFFF",
    };
  }

  if (intensity >= 6) {
    return {
      backgroundColor: intensity === 6 ? "#D45A63" : "#8C72D4",
      color: "#FFFFFF",
    };
  }

  return {
    backgroundColor: "#CDEFF1",
    color: "#2F6971",
  };
}

type IntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackMetrics = useRef({ pageX: 0, width: 0 });

  const measureTrack = useCallback((layoutWidth?: number) => {
    trackRef.current?.measure((_x, _y, measuredWidth, _height, pageX) => {
      const nextWidth = layoutWidth ?? measuredWidth;

      trackMetrics.current = {
        pageX,
        width: nextWidth,
      };
      setTrackWidth(nextWidth);
    });
  }, []);

  const updateValueFromX = useCallback(
    (x: number, width: number) => {
      if (width <= 0) {
        return;
      }

      const nextValue = Math.max(
        0,
        Math.min(10, Math.round((x / width) * 10)),
      );
      onChange(nextValue);
    },
    [onChange],
  );

  const updateValueFromEvent = useCallback(
    (event: GestureResponderEvent) => {
      const metrics = trackMetrics.current;
      const width = metrics.width || trackWidth;
      const relativeX =
        metrics.pageX > 0
          ? event.nativeEvent.pageX - metrics.pageX
          : event.nativeEvent.locationX;

      updateValueFromX(relativeX, width);
    },
    [trackWidth, updateValueFromX],
  );

  const fillWidth = trackWidth > 0 ? (value / 10) * trackWidth : 0;

  return (
    <View className="mt-[12px]">
      <View className="mb-[8px] flex-row items-center justify-between">
        <Text className="font-headly-medium text-[11px] leading-[15px] text-[#4B5563]">
          Min intensity
        </Text>
        <Text className="font-headly-semibold text-[12px] leading-[16px] text-[#14A4A1]">
          {value}/10
        </Text>
      </View>

      <View
        ref={trackRef}
        className="h-[28px] justify-center"
        onLayout={(event) => {
          measureTrack(event.nativeEvent.layout.width);
        }}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          measureTrack();
          updateValueFromEvent(event);
        }}
        onResponderMove={updateValueFromEvent}
        onResponderTerminationRequest={() => false}
        onStartShouldSetResponder={() => true}
        style={{ touchAction: "none" } as ViewStyle}
      >
        <View className="h-[4px] rounded-full bg-[#E6EEF2]">
          <View
            className="h-[4px] rounded-full bg-[#14A4A1]"
            style={{ width: fillWidth }}
          />
        </View>
        <View
          className="absolute top-[5px] h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#14A4A1]"
          style={{
            boxShadow: "0px 3px 8px rgba(20, 164, 161, 0.28)",
            left: Math.max(0, fillWidth - 9),
          }}
        />
      </View>
    </View>
  );
}

function HistoryEntryRow({
  entry,
  isLast,
}: {
  entry: HeadacheHistoryEntry;
  isLast: boolean;
}) {
  const intensityStyle = getIntensityStyle(entry.intensity);

  return (
    <View
      className={
        isLast
          ? "px-[16px] pb-[13px] pt-[12px]"
          : "border-b border-[#EEF0F5] px-[16px] pb-[13px] pt-[12px]"
      }
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-headly-medium text-[12px] leading-[16px] text-[#1F2937]">
          {getHistoryEntryDateLabel(entry)} {entry.time}
        </Text>
        <View
          className="h-[19px] min-w-[46px] items-center justify-center rounded-full px-[10px]"
          style={{ backgroundColor: intensityStyle.backgroundColor }}
        >
          <Text
            className="font-headly-semibold text-[11px] leading-[14px]"
            style={{ color: intensityStyle.color }}
          >
            {entry.intensity}/10
          </Text>
        </View>
      </View>

      <View className="mt-[6px] flex-row items-center">
        <View className="min-w-[111px] flex-row items-center gap-[8px]">
          <Image
            source={images.historyHeadTinyIcon}
            contentFit="contain"
            style={{ height: 16, width: 16 }}
          />
          <Text className="font-headly-medium text-[11px] leading-[15px] text-[#5C667A]">
            {entry.location}
          </Text>
        </View>

        <View className="flex-row items-center gap-[8px]">
          <Image
            source={images.clockTinyIcon}
            contentFit="contain"
            style={{ height: 16, width: 16 }}
          />
          <Text className="font-headly-medium text-[11px] leading-[15px] text-[#5C667A]">
            {entry.duration}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [selectedRange, setSelectedRange] = useState<HistoryRange>("month");
  const [showFilters, setShowFilters] = useState(false);
  const [minimumIntensity, setMinimumIntensity] = useState(0);

  const historyQuery = useMemo(
    () => ({
      minimumIntensity,
      range: selectedRange,
    }),
    [minimumIntensity, selectedRange],
  );
  const {
    data: historyEntries,
    error,
    isLoading,
  } = useHeadacheHistory(historyQuery);

  const sections = useMemo(
    () => groupHistoryEntries(historyEntries),
    [historyEntries],
  );

  return (
    <MainScreen>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 26,
          paddingHorizontal: 23,
          paddingTop: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[38px] justify-center">
          <Text className="text-center font-headly-semibold text-[16px] leading-[21px] text-[#111827]">
            History
          </Text>

          <Pressable
            accessibilityLabel={showFilters ? "Hide filters" : "Show filters"}
            accessibilityRole="button"
            className="absolute right-0 top-[2px] h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full hover:bg-white/80 active:bg-white"
            onPress={() => {
              setShowFilters((isVisible) => !isVisible);
            }}
            style={interactiveFeedback}
          >
            <Image
              source={images.filterIcon}
              contentFit="contain"
              style={{ height: 21, width: 21 }}
            />
          </Pressable>
        </View>

        <View className="mt-[17px] h-[26px] flex-row rounded-full border border-[#DEE4EC] bg-[#F5F6FA] p-[2px]">
          {historyRangeOptions.map((option) => {
            const isSelected = selectedRange === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={
                  isSelected
                    ? "h-[20px] flex-1 cursor-pointer items-center justify-center rounded-full bg-[#14A4A1]"
                    : "h-[20px] flex-1 cursor-pointer items-center justify-center rounded-full"
                }
                onPress={() => {
                  setSelectedRange(option.value);
                }}
                style={interactiveFeedback}
              >
                <Text
                  className={
                    isSelected
                      ? "font-headly-semibold text-[10px] leading-[13px] text-white"
                      : "font-headly-medium text-[10px] leading-[13px] text-[#566071]"
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showFilters ? (
          <View className="headly-dashboard__card mt-[12px] px-[16px] py-[13px]">
            <View className="flex-row items-center justify-between">
              <Text className="font-headly-semibold text-[12px] leading-[16px] text-[#111827]">
                Filters
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset filters"
                onPress={() => {
                  setMinimumIntensity(0);
                }}
              >
                <Text className="font-headly-medium text-[11px] leading-[15px] text-[#14A4A1]">
                  Reset
                </Text>
              </Pressable>
            </View>
            <IntensitySlider
              value={minimumIntensity}
              onChange={setMinimumIntensity}
            />
          </View>
        ) : null}

        <View className="mt-[16px] gap-[10px]">
          {isLoading ? (
            <View className="headly-dashboard__card items-center px-[18px] py-[28px]">
              <Text className="text-center font-headly-semibold text-[14px] leading-[19px] text-[#111827]">
                Loading history
              </Text>
            </View>
          ) : error ? (
            <View className="headly-dashboard__card items-center px-[18px] py-[28px]">
              <Text className="text-center font-headly-semibold text-[14px] leading-[19px] text-[#111827]">
                {error}
              </Text>
            </View>
          ) : sections.length > 0 ? (
            sections.map((section) => (
              <View key={section.title}>
                <Text className="mb-[7px] font-headly-medium text-[11px] leading-[15px] text-[#374151]">
                  {section.title}
                </Text>
                <View className="headly-dashboard__card overflow-hidden">
                  {section.data.map((entry, index) => (
                    <HistoryEntryRow
                      key={entry.id}
                      entry={entry}
                      isLast={index === section.data.length - 1}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View className="headly-dashboard__card items-center px-[18px] py-[28px]">
              <Text className="text-center font-headly-semibold text-[14px] leading-[19px] text-[#111827]">
                No history found
              </Text>
              <Text className="mt-[5px] text-center font-headly-medium text-[11px] leading-[16px] text-[#667085]">
                Try lowering the intensity filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </MainScreen>
  );
}
