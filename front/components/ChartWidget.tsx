// front/app/components/ChartWidget.tsx
"use client";
import React, { useEffect, useRef, memo } from "react";

import { ChartType } from "@/constants/chartTypes";
import { Interval } from "@/constants/intervals";
import { TradingViewOptions } from "@/types/ChartOptions";

interface TradingViewWidget {
  remove: () => void;
}

type Props = {
  symbol: string;
  interval: Interval;
  label: string;
  chartType: ChartType;
  theme?: "light" | "dark";
  options: TradingViewOptions;
};

// TradingViewウィジェットを描画するコンポーネント
const ChartWidget: React.FC<Props> = memo(
  ({ symbol, interval, label, chartType, theme = "light", options }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // ウィジェットのインスタンスをrefで保持
    const widgetRef = useRef<TradingViewWidget | null>(null);
    // 安定した一意なIDを生成する
    const widgetId = `tradingview_${symbol.replace(/[:]/g, "_")}`;

    useEffect(() => {
      const createWidget = () => {
        if (!containerRef.current || !window.TradingView) return;

        // 既存のウィジェットがあれば削除
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

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
            specificOptions = { style: "3" };
            break;
          case "bars":
            specificOptions = { style: "0" };
            break;
          case "candles":
          default:
            specificOptions = { style: "1" };
            break;
        }

        // 新しいウィジェットを作成し、refに保存
        widgetRef.current = new window.TradingView.widget({
          ...baseOptions,
          ...specificOptions,
          ...options,
        });
      };

      // TradingViewスクリプトが読み込まれていればウィジェットを作成
      if (window.TradingView) {
        createWidget();
      } else {
        // スクリプトがなければ読み込む
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = createWidget; // 読み込み完了後にウィジェット作成
        document.body.appendChild(script);
      }

      // コンポーネントのアンマウント時に実行されるクリーンアップ関数
      return () => {
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }
      };
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
