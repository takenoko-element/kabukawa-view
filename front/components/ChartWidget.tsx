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

    useEffect(() => {
      const container = containerRef.current;
      // isRemovingがtrueになったら、すぐにクリーンアップ完了を通知して処理を終了
      if (isRemoving) {
        onCleanupComplete(item.i);
        return;
      }

      if (!containerRef.current || !window.TradingView) return;

      const createWidget = () => {
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
      };

      createWidget();

      // コンポーネントがアンマウントされる時のクリーンアップ処理
      return () => {
        // ウィジェットが存在し、かつコンテナ要素がまだDOMに存在する場合のみクリーンアップを実行
        if (
          widgetRef.current &&
          container &&
          document.body.contains(container)
        ) {
          try {
            widgetRef.current.remove();
          } catch (error) {
            // remove()自体が内部でエラーを起こすことがあるため、念のためtry...catchを行う
            console.error(
              "Error removing TradingView widget on unmount:",
              error
            );
          }
        }
        widgetRef.current = null;
      };
    }, [
      isRemoving,
      item.i,
      onCleanupComplete,
      item.symbol,
      interval,
      chartType,
      theme,
      options,
      widgetId,
    ]);

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
