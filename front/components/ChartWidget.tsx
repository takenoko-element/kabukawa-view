// front/app/components/ChartWidget.tsx
"use client";
import React, { useEffect, useRef, memo } from "react";

import { ChartType } from "@/types";

type Props = {
  symbol: string;
  interval: string;
  label: string;
  chartType: ChartType;
  theme?: "light" | "dark";
};

// TradingViewウィジェットを描画するコンポーネント
const ChartWidget: React.FC<Props> = memo(
  ({ symbol, interval, label, chartType, theme = "light" }) => {
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
          switch (chartType) {
            case "overview":
              new window.TradingView.widget({
                width: "100%",
                height: "100%",
                symbol: symbol,
                interval: "D",
                timezone: "Asia/Tokyo",
                theme: theme,
                style: "3",
                locale: "ja",
                enable_publishing: false,
                container_id: widgetId,
              });
              break;
            case "advanced":
            default:
              new window.TradingView.widget({
                autosize: true,
                symbol: symbol,
                interval: interval,
                timezone: "Asia/Tokyo",
                theme: theme,
                style: "1",
                locale: "ja",
                enable_publishing: false,
                allow_symbol_change: true,
                container_id: widgetId, // 安定したIDを使用
                // 出来高を非表示にする
                hide_volume: true,
                // チャート上部のツールバーを非表示にする
                hide_top_toolbar: true,
                // 左側の描画ツールバーを非表示にする
                // hide_side_toolbar: true,
                // チャート左上の銘柄情報(OHLCなど)を非表示にする
                // hide_legend: true,
                // 下部の日付範囲セレクターを非表示にする
                // withdateranges: false,
              });
              break;
          }
        }
      };
      containerRef.current.appendChild(script);
    }, [symbol, interval, label, chartType, widgetId, theme]);

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
