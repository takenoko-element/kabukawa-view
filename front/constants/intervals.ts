// front/constants/intervals.ts
export const intervalOptions = [
  { value: "15", label: "15分" },
  { value: "30", label: "30分" },
  { value: "60", label: "1時間" },
  { value: "240", label: "4時間" },
  { value: "D", label: "日足" },
  { value: "W", label: "週足" },
] as const;

export type Interval = (typeof intervalOptions)[number]["value"];
