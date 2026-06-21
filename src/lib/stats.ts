import { historyReferenceDate } from "@/data/history";
import { type HeadacheHistoryEntry } from "@/types/history";

export type StatsTab = "overview" | "triggers" | "symptoms" | "medications";

export type StatsTimeRange = "thisMonth" | "lastSixMonths" | "lastYear" | "allTime";

export type TrendDirection = "down" | "flat" | "up";

export const statsTimeRangeOptions: {
  label: string;
  value: StatsTimeRange;
}[] = [
  { label: "This month", value: "thisMonth" },
  { label: "Last 6 months", value: "lastSixMonths" },
  { label: "Last year", value: "lastYear" },
  { label: "All time", value: "allTime" },
];

export type StatsMetric = {
  label: string;
  value: string;
  helper: string;
  delta: string;
  direction: TrendDirection;
};

export type StatsRankItem = {
  label: string;
  count: number;
  percent: number;
};

export type StatsMonthItem = {
  label: string;
  thisYear: number;
  lastYear: number;
};

export type StatsTimeOfDayItem = {
  label: "Morning" | "Afternoon" | "Evening" | "Night";
  count: number;
  percent: number;
  color: string;
};

export type StatsTrendPoint = {
  intensity: number;
  x: number;
};

export type StatsData = {
  averageIntensity: StatsMetric;
  averageDuration: StatsMetric;
  insightRangeLabel: string;
  totalEpisodes: StatsMetric;
  monthlyEpisodes: StatsMonthItem[];
  intensityTrend: StatsTrendPoint[];
  triggerRanking: StatsRankItem[];
  symptomRanking: StatsRankItem[];
  medicationRanking: StatsRankItem[];
  timeOfDay: StatsTimeOfDayItem[];
};

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function getEntryDate(entry: HeadacheHistoryEntry) {
  return new Date(entry.startDateTime);
}

function isSameMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getRangeStartDate(range: StatsTimeRange, referenceDate: Date) {
  const referenceMonthStart = getStartOfMonth(referenceDate);

  if (range === "lastSixMonths") {
    return new Date(
      referenceMonthStart.getFullYear(),
      referenceMonthStart.getMonth() - 5,
      1,
    );
  }

  if (range === "lastYear") {
    return new Date(
      referenceMonthStart.getFullYear(),
      referenceMonthStart.getMonth() - 11,
      1,
    );
  }

  return referenceMonthStart;
}

function getRangeMonthSpan(range: StatsTimeRange) {
  if (range === "lastSixMonths") {
    return 6;
  }

  if (range === "lastYear") {
    return 12;
  }

  if (range === "thisMonth") {
    return 1;
  }

  return null;
}

function getRangeEndDate(referenceDate: Date) {
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    23,
    59,
    59,
    999,
  );
}

function getRangeEntries(
  entries: HeadacheHistoryEntry[],
  range: StatsTimeRange,
  referenceDate: Date,
) {
  if (range === "allTime") {
    return entries;
  }

  const rangeStartDate = getRangeStartDate(range, referenceDate);
  const rangeEndDate = getRangeEndDate(referenceDate);

  return entries.filter((entry) => {
    const entryDate = getEntryDate(entry);

    return entryDate >= rangeStartDate && entryDate <= rangeEndDate;
  });
}

function getPreviousRangeEntries(
  entries: HeadacheHistoryEntry[],
  range: StatsTimeRange,
  referenceDate: Date,
) {
  const monthSpan = getRangeMonthSpan(range);

  if (monthSpan === null) {
    return [];
  }

  const rangeStartDate = getRangeStartDate(range, referenceDate);
  const previousRangeStartDate = new Date(
    rangeStartDate.getFullYear(),
    rangeStartDate.getMonth() - monthSpan,
    1,
  );
  const previousRangeEndDate = new Date(
    rangeStartDate.getFullYear(),
    rangeStartDate.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  return entries.filter((entry) => {
    const entryDate = getEntryDate(entry);

    return (
      entryDate >= previousRangeStartDate && entryDate <= previousRangeEndDate
    );
  });
}

function getRangeLabel(range: StatsTimeRange) {
  return (
    statsTimeRangeOptions.find((option) => option.value === range)?.label ??
    "This month"
  );
}

function getComparisonHelper(range: StatsTimeRange) {
  if (range === "allTime") {
    return "all logged episodes";
  }

  if (range === "thisMonth") {
    return "vs last month";
  }

  return "vs previous period";
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatIntensity(value: number) {
  return value % 1 === 0 ? `${value}` : value.toFixed(1);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "0h 0m";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function formatDurationDelta(minutes: number) {
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainingMinutes = absoluteMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getDirection(delta: number): TrendDirection {
  if (delta > 0) {
    return "up";
  }

  if (delta < 0) {
    return "down";
  }

  return "flat";
}

function getMetricDelta(delta: number, formatter: (value: number) => string) {
  if (delta === 0) {
    return "0";
  }

  return `${delta > 0 ? "+" : "-"} ${formatter(Math.abs(delta))}`;
}

function getMonthlyEntries(
  entries: HeadacheHistoryEntry[],
  year: number,
  month: number,
) {
  return entries.filter((entry) => isSameMonth(getEntryDate(entry), year, month));
}

function getMonthBuckets(
  entries: HeadacheHistoryEntry[],
  range: StatsTimeRange,
  referenceDate: Date,
) {
  if (range === "thisMonth") {
    const referenceMonthStart = getStartOfMonth(referenceDate);

    return Array.from({ length: referenceDate.getMonth() + 1 }, (_, index) => {
      return new Date(referenceMonthStart.getFullYear(), index, 1);
    });
  }

  if (range === "allTime") {
    if (entries.length === 0) {
      return Array.from({ length: referenceDate.getMonth() + 1 }, (_, index) => {
        return new Date(referenceDate.getFullYear(), index, 1);
      });
    }

    const sortedDates = entries
      .map((entry) => getStartOfMonth(getEntryDate(entry)))
      .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());
    const firstDate = sortedDates[0];
    const buckets: Date[] = [];
    const bucketDate = new Date(firstDate.getFullYear(), 0, 1);
    const rangeEndDate = getStartOfMonth(referenceDate);

    while (bucketDate <= rangeEndDate) {
      buckets.push(new Date(bucketDate));
      bucketDate.setMonth(bucketDate.getMonth() + 1);
    }

    return buckets;
  }

  const monthSpan = getRangeMonthSpan(range) ?? 1;
  const rangeStartDate = getRangeStartDate(range, referenceDate);

  return Array.from({ length: monthSpan }, (_, index) => {
    return new Date(
      rangeStartDate.getFullYear(),
      rangeStartDate.getMonth() + index,
      1,
    );
  });
}

function getRankItems(
  entries: HeadacheHistoryEntry[],
  getItems: (entry: HeadacheHistoryEntry) => string[],
) {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    getItems(entry).forEach((item) => {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([label, count]) => ({
      count,
      label,
      percent:
        entries.length === 0 ? 0 : Math.round((count / entries.length) * 100),
    }))
    .sort((firstItem, secondItem) => {
      if (secondItem.count !== firstItem.count) {
        return secondItem.count - firstItem.count;
      }

      return firstItem.label.localeCompare(secondItem.label);
    });
}

function getTimeOfDay(entries: HeadacheHistoryEntry[]): StatsTimeOfDayItem[] {
  const items: StatsTimeOfDayItem[] = [
    { label: "Morning", count: 0, percent: 0, color: "#14A4A1" },
    { label: "Afternoon", count: 0, percent: 0, color: "#86B7C9" },
    { label: "Evening", count: 0, percent: 0, color: "#B99FE6" },
    { label: "Night", count: 0, percent: 0, color: "#D6C7F3" },
  ];

  entries.forEach((entry) => {
    const hour = getEntryDate(entry).getHours();

    if (hour >= 5 && hour < 12) {
      items[0].count += 1;
      return;
    }

    if (hour >= 12 && hour < 17) {
      items[1].count += 1;
      return;
    }

    if (hour >= 17 && hour < 21) {
      items[2].count += 1;
      return;
    }

    items[3].count += 1;
  });

  return items.map((item) => ({
    ...item,
    percent:
      entries.length === 0 ? 0 : Math.round((item.count / entries.length) * 100),
  }));
}

function getIntensityTrend(entries: HeadacheHistoryEntry[]): StatsTrendPoint[] {
  const sortedEntries = [...entries].sort(
    (firstEntry, secondEntry) =>
      getEntryDate(firstEntry).getTime() - getEntryDate(secondEntry).getTime(),
  );

  if (sortedEntries.length === 0) {
    return [];
  }

  if (sortedEntries.length === 1) {
    return [{ intensity: sortedEntries[0].intensity, x: 0.5 }];
  }

  return sortedEntries.map((entry, index) => ({
    intensity: entry.intensity,
    x: index / (sortedEntries.length - 1),
  }));
}

export function getStatsData(
  entries: HeadacheHistoryEntry[],
  insightRange: StatsTimeRange = "thisMonth",
  referenceDate = historyReferenceDate,
): StatsData {
  const insightEntries = getRangeEntries(entries, insightRange, referenceDate);
  const previousInsightEntries = getPreviousRangeEntries(
    entries,
    insightRange,
    referenceDate,
  );
  const insightRangeLabel = getRangeLabel(insightRange);
  const comparisonHelper = getComparisonHelper(insightRange);

  const averageIntensity = getAverage(
    insightEntries.map((entry) => entry.intensity),
  );
  const averageDuration = Math.round(
    getAverage(insightEntries.map((entry) => entry.durationMinutes)),
  );
  const previousAverageIntensity =
    insightRange === "allTime"
      ? averageIntensity
      : getAverage(previousInsightEntries.map((entry) => entry.intensity));
  const previousAverageDuration =
    insightRange === "allTime"
      ? averageDuration
      : Math.round(
          getAverage(previousInsightEntries.map((entry) => entry.durationMinutes)),
        );
  const intensityDelta = Number(
    (averageIntensity - previousAverageIntensity).toFixed(1),
  );
  const durationDelta = averageDuration - previousAverageDuration;
  const episodeDelta =
    insightRange === "allTime"
      ? 0
      : insightEntries.length - previousInsightEntries.length;
  const monthBuckets = getMonthBuckets(entries, insightRange, referenceDate);

  return {
    averageDuration: {
      delta: getMetricDelta(durationDelta, formatDurationDelta),
      direction: getDirection(durationDelta),
      helper: comparisonHelper,
      label: "Average Duration",
      value: formatDuration(averageDuration),
    },
    averageIntensity: {
      delta: getMetricDelta(intensityDelta, (value) => value.toFixed(1)),
      direction: getDirection(intensityDelta),
      helper: comparisonHelper,
      label: "Average Intensity",
      value: `${formatIntensity(averageIntensity)}/10`,
    },
    insightRangeLabel,
    intensityTrend: getIntensityTrend(insightEntries),
    medicationRanking: getRankItems(
      insightEntries,
      (entry) => entry.medicationsTaken,
    ),
    monthlyEpisodes: monthBuckets.map((bucketDate) => ({
      label: shortMonthNames[bucketDate.getMonth()],
      lastYear: getMonthlyEntries(
        entries,
        bucketDate.getFullYear() - 1,
        bucketDate.getMonth(),
      ).length,
      thisYear: getMonthlyEntries(
        entries,
        bucketDate.getFullYear(),
        bucketDate.getMonth(),
      ).length,
    })),
    symptomRanking: getRankItems(insightEntries, (entry) => entry.symptoms),
    timeOfDay: getTimeOfDay(insightEntries),
    totalEpisodes: {
      delta: getMetricDelta(episodeDelta, (value) => `${value}`),
      direction: getDirection(episodeDelta),
      helper: comparisonHelper,
      label: "Total Episodes",
      value: `${insightEntries.length}`,
    },
    triggerRanking: getRankItems(insightEntries, (entry) => entry.triggers),
  };
}
