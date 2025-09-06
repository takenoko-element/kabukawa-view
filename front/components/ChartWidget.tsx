// front/app/components/ChartWidget.tsx
"use client";
import React, { useEffect, useRef, memo } from "react";

import { ChartType } from "@/constants/chartTypes";
import { Interval } from "@/constants/intervals";
import { TradingViewOptions, LayoutItem } from "@/types";

interface TradingViewWidget {
  remove: () => void;
}

type Props = {
  item: LayoutItem;
  interval: Interval;
  chartType: ChartType;
  theme?: "light" | "dark";
  options: TradingViewOptions;
  isRemoving: boolean;
  onCleanupComplete: (itemId: string) => void;
};

// TradingViewウィジェットを描画するコンポーネント
const ChartWidget: React.FC<Props> = memo(
  ({
    item,
    interval,
    chartType,
    theme = "light",
    options,
    isRemoving,
    onCleanupComplete,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // ウィジェットのインスタンスをrefで保持
    const widgetRef = useRef<TradingViewWidget | null>(null);
    // 安定した一意なIDを生成する
    const widgetId = `tradingview_${item.symbol.replace(/[:]/g, "_")}`;

    // [役割1: 削除処理] isRemovingがtrueになった時だけ実行されるフック
    useEffect(() => {
      if (isRemoving) {
        if (widgetRef.current) {
          try {
            widgetRef.current.remove();
          } catch (error) {
            console.error("Error removing TradingView widget:", error);
          }
          widgetRef.current = null;
        }
        onCleanupComplete(item.i);
      }
    }, [isRemoving, item.i, onCleanupComplete]);

    // [役割2: 描画・更新処理] isRemovingがfalseの時だけ実行されるフック
    useEffect(() => {
      if (!containerRef.current || !window.TradingView) return;

      // 既存のウィジェットがあれば削除
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }

      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        interval: interval,
        symbol: item.symbol,
        timezone: "Asia/Tokyo",
        theme: theme,
        locale: "ja",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: widgetId,
        style: chartType === "line" ? "3" : chartType === "bars" ? "0" : "1",
        ...options,
      });

      return () => {
        if (widgetRef.current) {
          try {
            widgetRef.current.remove();
          } catch (error) {
            console.error(
              "Error removing TradingView widget on unmount:",
              error
            );
          }
          widgetRef.current = null;
        }
      };
    }, [item.symbol, interval, chartType, theme, options, widgetId]);

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
