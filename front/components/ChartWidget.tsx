// front/app/components/ChartWidget.tsx
"use client";
import React, { useEffect, useRef, memo } from "react";

import { ChartType } from "@/constants/chartTypes";
import { Interval } from "@/constants/intervals";
import { ChartOptions } from "@/types/ChartOptions";

type Props = {
  symbol: string;
  interval: Interval;
  label: string;
  chartType: ChartType;
  theme?: "light" | "dark";
  options: Omit<ChartOptions, "enable_chart_operation">;
};

// TradingViewウィジェットを描画するコンポーネント
const ChartWidget: React.FC<Props> = memo(
  ({ symbol, interval, label, chartType, theme = "light", options }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // 安定した一意なIDを生成する
    const widgetId = `tradingview_${symbol.replace(/[:]/g, "_")}`;

    useEffect(() => {
      // containerRef.current が存在することを確認
      if (!containerRef.current) {
        return;
      }

      // 毎回コンテナをクリアして、新しいウィジェットを描画する
      containerRef.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        // スクリプト読み込み後に window.TradingView が存在するか、
        // そしてコンテナがまだ存在するかを再度確認
        if (window.TradingView && containerRef.current) {
          const baseOptions = {
            autosize: true,
            interval: interval,
            symbol: symbol,
            timezone: "Asia/Tokyo",
            theme: theme,
            locale: "ja",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: widgetId,
          };

          let specificOptions = {};
          switch (chartType) {
            case "line":
              specificOptions = {
                style: "3",
              };
              break;
            case "bars":
              specificOptions = {
                style: "0",
              };
              break;
            case "candles":
            default:
              specificOptions = {
                style: "1",
              };
              break;
          }

          new window.TradingView.widget({
            ...baseOptions,
            ...specificOptions,
            ...options,
          });
        }
      };
      containerRef.current.appendChild(script);
    }, [symbol, interval, label, chartType, widgetId, theme, options]);

    return (
      <div
        id={widgetId} // 安定したIDを使用
        ref={containerRef}
        className="w-full h-full"
      />
    );
  }
);

ChartWidget.displayName = "ChartWidget";
export default ChartWidget;
