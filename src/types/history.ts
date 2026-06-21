export type HistoryRange = "all" | "month" | "year";

export type HeadacheEpisode = {
  id: string;
  startDateTime: string;
  endDateTime: string;
  intensity: number;
  location: string;
  symptoms: string[];
  medicationsTaken: string[];
};

export type HeadacheHistoryEntry = HeadacheEpisode & {
  date: string;
  duration: string;
  durationMinutes: number;
  time: string;
};

export type HeadacheHistoryQuery = {
  minimumIntensity: number;
  range: HistoryRange;
};

export type HeadacheHistorySection = {
  title: string;
  data: HeadacheHistoryEntry[];
};

export type SupabaseHeadacheEpisodeRow = {
  end_at: string | null;
  id: string;
  location: string | null;
  medications_taken: string[] | null;
  start_at: string;
  intensity: number | null;
  symptoms: string[] | null;
};
