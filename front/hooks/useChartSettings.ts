// front/hooks/useChartSettings.ts
import { useState, useMemo, useCallback } from "react";
import { Interval } from "@/constants/intervals";
import { ChartType } from "@/constants/chartTypes";
import { AllChartSettings, TradingViewOptions } from "@/types";

// オブジェクトが等しいか簡易的にチェックする関数
const simpleDeepEqual = (objA: unknown, objB: unknown) => {
  return JSON.stringify(objA) === JSON.stringify(objB);
};

export const useChartSettings = () => {
  const [interval, setInterval] = useState<Interval>("30");
  const [chartType, setChartType] = useState<ChartType>("candles");

  // TradingViewウィジェットに直接関わる設定
  const [widgetOptions, setWidgetOptions] = useState<TradingViewOptions>({
    hide_top_toolbar: true,
    hide_side_toolbar: true,
    hide_legend: false,
    hide_volume: false,
    withdateranges: false,
  });

  // それ以外のチャートに関する設定
  const [behaviorSettings, setBehaviorSettings] = useState({
    enable_chart_operation: false,
    defaultChartSizes: {
      lg: { w: 24, h: 18 },
      md: { w: 20, h: 18 },
      sm: { w: 12, h: 18 },
      xs: { w: 12, h: 18 },
      xxs: { w: 12, h: 18 },
    },
  });

  const chartSettings: AllChartSettings = useMemo(
    () => ({
      ...widgetOptions,
      ...behaviorSettings,
    }),
    [widgetOptions, behaviorSettings]
  );

  const setChartSettings = useCallback(
    (newSettings: AllChartSettings) => {
      // 新しい設定を「ウィジェット用」と「動作設定用」に分割
      const { enable_chart_operation, defaultChartSizes, ...newWidgetOptions } =
        newSettings;

      const newBehaviorSettings = {
        enable_chart_operation,
        defaultChartSizes,
      };

      // 差分をチェックして、変更があったものだけを更新する
      if (!simpleDeepEqual(widgetOptions, newWidgetOptions)) {
        setWidgetOptions(newWidgetOptions);
      }

      if (!simpleDeepEqual(behaviorSettings, newBehaviorSettings)) {
        setBehaviorSettings(newBehaviorSettings);
      }
    },
    [widgetOptions, behaviorSettings]
  );

  return {
    interval,
    setInterval,
    chartType,
    setChartType,
    widgetOptions,
    enableChartOperation: behaviorSettings.enable_chart_operation,
    defaultChartSizes: behaviorSettings.defaultChartSizes,
    chartSettings,
    setChartSettings,
  };
};
