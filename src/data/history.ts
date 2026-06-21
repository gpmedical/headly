import { type HeadacheEpisode, type HistoryRange } from "@/types/history";

export const historyRangeOptions: { label: string; value: HistoryRange }[] = [
  { label: "All", value: "all" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export const historyReferenceDate = new Date(2024, 4, 31);

export const headacheEpisodes: HeadacheEpisode[] = [
  {
    id: "may-28",
    startDateTime: "2024-05-28T14:30:00",
    endDateTime: "2024-05-28T19:00:00",
    intensity: 7,
    location: "Left side",
    triggers: ["Stress", "Dehydration", "Lack of sleep"],
    symptoms: ["Nausea", "Sensitivity to light"],
    medicationsTaken: ["Ibuprofen 400 mg"],
  },
  {
    id: "may-24",
    startDateTime: "2024-05-24T09:15:00",
    endDateTime: "2024-05-24T11:30:00",
    intensity: 5,
    location: "Whole head",
    triggers: ["Stress", "Skipped meal"],
    symptoms: ["Fatigue"],
    medicationsTaken: ["Paracetamol 500 mg"],
  },
  {
    id: "may-20",
    startDateTime: "2024-05-20T19:45:00",
    endDateTime: "2024-05-21T01:45:00",
    intensity: 8,
    location: "Right side",
    triggers: ["Dehydration", "Screen time"],
    symptoms: ["Nausea", "Blurred vision"],
    medicationsTaken: ["Sumatriptan 50 mg"],
  },
  {
    id: "may-17",
    startDateTime: "2024-05-17T11:20:00",
    endDateTime: "2024-05-17T12:50:00",
    intensity: 4,
    location: "Left side",
    triggers: ["Stress", "Weather change"],
    symptoms: ["Sensitivity to sound"],
    medicationsTaken: ["Aspirin 500 mg"],
  },
  {
    id: "may-12",
    startDateTime: "2024-05-12T08:10:00",
    endDateTime: "2024-05-12T11:55:00",
    intensity: 6,
    location: "Back of head",
    triggers: ["Lack of sleep", "Stress"],
    symptoms: ["Neck stiffness"],
    medicationsTaken: ["Naproxen 220 mg"],
  },
  {
    id: "apr-26",
    startDateTime: "2024-04-26T16:05:00",
    endDateTime: "2024-04-26T18:45:00",
    intensity: 5,
    location: "Forehead",
    triggers: ["Stress", "Screen time"],
    symptoms: ["Fatigue"],
    medicationsTaken: ["Paracetamol 500 mg"],
  },
  {
    id: "mar-08",
    startDateTime: "2024-03-08T07:55:00",
    endDateTime: "2024-03-08T13:05:00",
    intensity: 9,
    location: "Temples",
    triggers: ["Dehydration", "Alcohol", "Lack of sleep"],
    symptoms: ["Aura", "Nausea"],
    medicationsTaken: ["Sumatriptan 50 mg", "Ibuprofen 400 mg"],
  },
];
