// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

import { AllChartSettings, Symbol } from "@/types";
import { ChartSettingsModal } from "./ChartSettingsModal";
import { SymbolSearchModal } from "./SymbolSearchModal";
import DashboardHeader from "./DashboardHeader";
import ChartGrid from "./ChartGrid";
import { HeaderToggleButton } from "./HeaderToggleButton";
import { useLayout } from "@/hooks/useLayout";
import { useChartSettings } from "@/hooks/useChartSettings";
import { useDashboardModals } from "@/hooks/useDashboardModals";
import { useTradingViewScript } from "@/hooks/useTradingViewScript";
import { useUserStatus } from "@/hooks/useUserStatus";

const Dashboard = () => {
  const { resolvedTheme } = useTheme();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scriptStatus = useTradingViewScript();
  const { isPremium } = useUserStatus();
  const [showSlowLoadMessage, setShowSlowLoadMessage] = useState(false);

  const {
    chartSettings,
    setChartSettings,
    interval,
    setInterval,
    chartType,
    setChartType,
    widgetOptions,
    enableChartOperation,
    defaultChartSizes,
  } = useChartSettings();

  const {
    layouts,
    items,
    // setItems,
    isLoading,
    addedSymbols,
    handleLayoutChange,
    // 手動レイアウト保存実装時に必要
    // saveLayout,
    addMultipleCharts,
    removeChart,
  } = useLayout(defaultChartSizes);

  const {
    isSettingsModalOpen,
    isSearchModalOpen,
    openSettingsModal,
    closeSettingsModal,
    openSearchModal,
    closeSearchModal,
  } = useDashboardModals();

  const handleSaveSettings = (newSettings: AllChartSettings) => {
    setChartSettings(newSettings);
    closeSettingsModal();
  };

  const handleAddMultipleCharts = (symbols: Symbol[]) => {
    addMultipleCharts(symbols);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        // 5秒経ってもローディング中ならメッセージを表示する
        setShowSlowLoadMessage(true);
      }, 5000);
    }

    // ローディングが完了するか、コンポーネントが破棄された場合はタイマーを解除
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading]);

  // レイアウト読み込みとスクリプト読み込みの両方が完了するまでローディング表示
  if (isLoading || scriptStatus !== "ready") {
    // 状態に応じて表示するメッセージを切り替え
    const message = isLoading
      ? "レイアウトを読み込んでいます..."
      : "チャートライブラリを準備しています...";

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex items-center gap-3 text-lg text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{message}</p>
        </div>
        {/* 3秒以上経過した場合にのみ、追加のメッセージを表示 */}
        {showSlowLoadMessage && (
          <div className="animate-fade-in text-center text-sm text-muted-foreground">
            <p>初回起動時や長時間の無操作後は、</p>
            <p>サーバーの起動に時間がかかる場合があります（1分程度）</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader
        isVisible={isHeaderVisible}
        interval={interval}
        setInterval={setInterval}
        chartType={chartType}
        setChartType={setChartType}
        openSettingsModal={openSettingsModal}
        openSearchModal={openSearchModal}
        // 手動レイアウト保存実装時に必要
        // saveLayout={saveLayout}
      />

      <div className="flex-grow relative">
        <HeaderToggleButton
          isVisible={isHeaderVisible}
          setIsVisible={setIsHeaderVisible}
        />
        <div className="absolute inset-0">
          <ChartGrid
            layouts={layouts}
            items={items}
            onLayoutChange={handleLayoutChange}
            onRemoveChart={removeChart}
            interval={interval}
            chartType={chartType}
            theme={resolvedTheme as "light" | "dark"}
            widgetOptions={widgetOptions}
            enableChartOperation={enableChartOperation}
          />
        </div>
      </div>

      <ChartSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        options={chartSettings}
        onSave={handleSaveSettings}
      />
      <SymbolSearchModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        onAdd={handleAddMultipleCharts}
        addedSymbols={addedSymbols}
        isPremium={isPremium}
      />
    </div>
  );
};

export default Dashboard;
