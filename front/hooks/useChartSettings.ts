// front/hooks/useChartSettings.ts
import { useState, useMemo } from "react";
import { Interval } from "@/constants/intervals";
import { ChartType } from "@/constants/chartTypes";
import { AllChartSettings, TradingViewOptions } from "@/types";

export const useChartSettings = () => {
  const [interval, setInterval] = useState<Interval>("30");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [chartSettings, setChartSettings] = useState<AllChartSettings>({
    hide_top_toolbar: true,
    hide_side_toolbar: true,
    hide_legend: false,
    hide_volume: false,
    withdateranges: false,
    enable_chart_operation: false,
    default_w: 24,
    default_h: 18,
  });

  // TradingViewウィジェットに渡すオプションをメモ化
  const widgetOptions: TradingViewOptions = useMemo(() => {
    const { enable_chart_operation, default_w, default_h, ...rest } =
      chartSettings;
    return rest;
  }, [chartSettings]);

  const enableChartOperation = chartSettings.enable_chart_operation;
  const defaultChartSize = useMemo(
    () => ({
      w: chartSettings.default_w || 24,
      h: chartSettings.default_h || 18,
    }),
    [chartSettings.default_w, chartSettings.default_h]
  );

  return {
    interval,
    setInterval,
    chartType,
    setChartType,
    widgetOptions,
    enableChartOperation,
    defaultChartSize,
    chartSettings,
    setChartSettings,
  };
};
