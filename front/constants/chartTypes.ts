// front/constants/chartType.ts
export const chartTypeOptions = [
  { name: "candles", label: "ローソク足" },
  { name: "line", label: "ライン" },
  { name: "bars", label: "バー" },
] as const;

// データからChartTypeを自動生成する
export type ChartType = (typeof chartTypeOptions)[number]["name"];
