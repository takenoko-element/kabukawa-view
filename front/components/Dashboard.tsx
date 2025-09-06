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

const Dashboard = () => {
  const { resolvedTheme } = useTheme();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scriptStatus = useTradingViewScript();

  const {
    items,
    // setItems,
    isLoading,
    addedSymbols,
    handleLayoutChange,
    saveLayout,
    addMultipleCharts,
    removeChart,
  } = useLayout();

  const {
    chartSettings,
    setChartSettings,
    interval,
    setInterval,
    chartType,
    setChartType,
    widgetOptions,
    enableChartOperation,
    defaultChartSize,
  } = useChartSettings();

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
    addMultipleCharts(symbols, defaultChartSize);
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
      />
    </div>
  );
};

export default Dashboard;
