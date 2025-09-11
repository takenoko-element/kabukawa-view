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
    defaultChartSizes: {
      lg: { w: 24, h: 18 },
      md: { w: 20, h: 18 },
      sm: { w: 12, h: 18 },
      xs: { w: 12, h: 18 },
      xxs: { w: 12, h: 18 },
    },
  });

  // TradingViewウィジェットに渡すオプションをメモ化
  const widgetOptions: TradingViewOptions = useMemo(() => {
    const { enable_chart_operation, defaultChartSizes, ...rest } =
      chartSettings;
    return rest;
  }, [chartSettings]);

  const enableChartOperation = chartSettings.enable_chart_operation;
  const defaultChartSizes = chartSettings.defaultChartSizes;

  return {
    interval,
    setInterval,
    chartType,
    setChartType,
    widgetOptions,
    enableChartOperation,
    defaultChartSizes,
    chartSettings,
    setChartSettings,
  };
};
