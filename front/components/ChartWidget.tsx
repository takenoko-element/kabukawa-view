// front/app/components/ChartWidget.tsx
"use client";
import React, { useEffect, useRef, memo } from "react";

type Props = {
  symbol: string;
  interval: string;
};

// TradingViewウィジェットを描画するコンポーネント
// React.memo を使って、propsが変更されない限り再描画しないようにする
const ChartWidget: React.FC<Props> = memo(({ symbol, interval }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector("iframe")) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval, // 'D', '60', '240' など
            timezone: "Asia/Tokyo",
            theme: "dark",
            style: "1",
            locale: "ja",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: containerRef.current!.id,
          });
        }
      };
      containerRef.current.appendChild(script);
    }
  }, [symbol, interval]); // symbolやintervalが変わったときだけ再生成

  // container_idに一意なIDを付与する
  return (
    <div
      id={`tradingview_${symbol}_${Math.random()}`}
      ref={containerRef}
      className="w-full h-full"
    />
  );
});

ChartWidget.displayName = "ChartWidget";
export default ChartWidget;
