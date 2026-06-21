import {
  headacheEpisodes,
  historyReferenceDate,
} from "@/data/history";
import {
  type HeadacheEpisode,
  type HeadacheHistoryEntry,
  type HeadacheHistoryQuery,
  type HeadacheHistorySection,
  type HistoryRange,
  type SupabaseHeadacheEpisodeRow,
} from "@/types/history";

type DashboardMetric = {
  label: string;
  value: string;
};

type DashboardLastEpisode = {
  date: string;
  duration: string;
  intensity: string;
  location: string;
  symptoms: string;
};

type DashboardTrendPoint = {
  intensity: number;
  x: number;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function getEntryDate(entry: HeadacheHistoryEntry) {
  const [year = "2024", month = "1", day = "1"] = entry.date.split("-");

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function isInSelectedRange(entry: HeadacheHistoryEntry, range: HistoryRange) {
  if (range === "all") {
    return true;
  }

  const entryDate = getEntryDate(entry);
  const sameYear =
    entryDate.getFullYear() === historyReferenceDate.getFullYear();

  if (range === "year") {
    return sameYear;
  }

  return sameYear && entryDate.getMonth() === historyReferenceDate.getMonth();
}

function formatDuration(durationMinutes: number | null) {
  if (!durationMinutes || durationMinutes <= 0) {
    return "0h 0m";
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function getDurationMinutes(startDate: Date, endDate: Date) {
  return Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60000),
  );
}

function getAverage(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function formatAverageIntensity(intensity: number) {
  return intensity % 1 === 0 ? `${intensity}` : intensity.toFixed(1);
}

function formatMonthDay(date: Date) {
  return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

export function mapEpisodeToHistoryEntry(
  episode: HeadacheEpisode,
): HeadacheHistoryEntry {
  const startDate = new Date(episode.startDateTime);
  const endDate = new Date(episode.endDateTime);
  const durationMinutes = getDurationMinutes(startDate, endDate);

  return {
    ...episode,
    date: formatDateKey(startDate),
    duration: formatDuration(durationMinutes),
    durationMinutes,
    time: formatTime(startDate),
  };
}

export function mapSupabaseEpisodeToHistoryEntry(
  episode: SupabaseHeadacheEpisodeRow,
): HeadacheHistoryEntry {
  return mapEpisodeToHistoryEntry({
    endDateTime: episode.end_at ?? episode.start_at,
    id: episode.id,
    intensity: episode.intensity ?? 0,
    location: episode.location ?? "Unknown",
    medicationsTaken: episode.medications_taken ?? [],
    startDateTime: episode.start_at,
    symptoms: episode.symptoms ?? [],
  });
}

export function filterHistoryEntries(
  entries: HeadacheHistoryEntry[],
  query: HeadacheHistoryQuery,
) {
  return entries.filter(
    (entry) =>
      isInSelectedRange(entry, query.range) &&
      entry.intensity >= query.minimumIntensity,
  );
}

export function getHistorySectionLabel(entry: HeadacheHistoryEntry) {
  const entryDate = getEntryDate(entry);

  return `${monthNames[entryDate.getMonth()]} ${entryDate.getFullYear()}`;
}

export function getHistoryEntryDateLabel(entry: HeadacheHistoryEntry) {
  const entryDate = getEntryDate(entry);

  return `${monthNames[entryDate.getMonth()].slice(0, 3)} ${entryDate.getDate()},`;
}

export function getDashboardMetrics(
  entries: HeadacheHistoryEntry[],
): DashboardMetric[] {
  const averageIntensity = getAverage(entries.map((entry) => entry.intensity));
  const averageDuration = Math.round(
    getAverage(entries.map((entry) => entry.durationMinutes)),
  );

  return [
    { label: "Episodes", value: `${entries.length}` },
    {
      label: "Avg. Intensity",
      value: formatAverageIntensity(averageIntensity),
    },
    {
      label: "Avg. Duration",
      value: formatDuration(averageDuration),
    },
  ];
}

export function getDashboardLastEpisode(
  entries: HeadacheHistoryEntry[],
): DashboardLastEpisode | null {
  const latestEpisode = [...entries].sort((firstEntry, secondEntry) => {
    const firstDate = new Date(firstEntry.startDateTime);
    const secondDate = new Date(secondEntry.startDateTime);

    return secondDate.getTime() - firstDate.getTime();
  })[0];

  if (!latestEpisode) {
    return null;
  }

  const latestDate = getEntryDate(latestEpisode);

  return {
    date: `${formatMonthDay(latestDate)}, ${latestDate.getFullYear()} - ${latestEpisode.time}`,
    duration: latestEpisode.duration,
    intensity: `${latestEpisode.intensity}/10`,
    location: latestEpisode.location,
    symptoms:
      latestEpisode.symptoms.length > 0
        ? latestEpisode.symptoms.join(", ")
        : "No symptoms logged",
  };
}

export function getDashboardTrend(
  entries: HeadacheHistoryEntry[],
): DashboardTrendPoint[] {
  const sortedEntries = [...entries].sort(
    (firstEntry, secondEntry) =>
      new Date(firstEntry.startDateTime).getTime() -
      new Date(secondEntry.startDateTime).getTime(),
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

export function groupHistoryEntries(
  entries: HeadacheHistoryEntry[],
): HeadacheHistorySection[] {
  return entries.reduce<HeadacheHistorySection[]>((sections, entry) => {
    const title = getHistorySectionLabel(entry);
    const section = sections.find((item) => item.title === title);

    if (section) {
      section.data.push(entry);
      return sections;
    }

    return [...sections, { title, data: [entry] }];
  }, []);
}

export async function getHeadacheHistoryEntries(query: HeadacheHistoryQuery) {
  return filterHistoryEntries(
    headacheEpisodes.map(mapEpisodeToHistoryEntry),
    query,
  );
}
