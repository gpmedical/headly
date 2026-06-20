export type DashboardMetric = {
  label: string;
  value: string;
};

export type TrendPoint = {
  x: number;
  y: number;
};

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Episodes", value: "5" },
  { label: "Avg. Intensity", value: "6.2" },
  { label: "Avg. Duration", value: "10h 45m" },
];

export const dashboardTrend: TrendPoint[] = [
  { x: 0, y: 50 },
  { x: 0.1, y: 41 },
  { x: 0.18, y: 32 },
  { x: 0.29, y: 33 },
  { x: 0.38, y: 14 },
  { x: 0.47, y: 41 },
  { x: 0.54, y: 51 },
  { x: 0.62, y: 34 },
  { x: 0.71, y: 57 },
  { x: 0.79, y: 47 },
  { x: 0.88, y: 49 },
  { x: 0.94, y: 15 },
  { x: 1, y: 22 },
];

export const dashboardLastEpisode = {
  date: "May 28, 2024 - 14:30",
  intensity: "7/10",
  location: "Left side",
  duration: "4h 30m",
  symptoms: "Nausea, Sensitivity to light",
};

export const dashboardReminder = {
  medication: "Propranolol 20 mg",
  time: "Today, 8:00 PM",
};
