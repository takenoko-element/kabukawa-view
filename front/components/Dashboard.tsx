// front/app/components/Dashboard.tsx
"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

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
    saveLayout,
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

  // レイアウト読み込みとスクリプト読み込みの両方が完了するまでローディング表示
  if (isLoading || scriptStatus !== "ready") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-center p-10">
          {isLoading ? "Loading Layout..." : "Loading Chart Library..."}
        </p>
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
        saveLayout={saveLayout}
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
