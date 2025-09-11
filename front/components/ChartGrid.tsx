// front/components/ChartGrid.tsx
import { useCallback, useState } from "react";
import {
  Responsive,
  WidthProvider,
  Layouts as ReactGridLayouts,
} from "react-grid-layout";
import ChartWidget from "./ChartWidget";
import { LayoutItem, TradingViewOptions, Layouts } from "@/types";
import { COLS } from "@/constants/cols";
import { Interval } from "@/constants/intervals";
import { ChartType } from "@/constants/chartTypes";

type Props = {
  layouts: Layouts;
  items: LayoutItem[];
  onLayoutChange: (
    layout: ReactGridLayout.Layout[],
    allLayouts: ReactGridLayouts
  ) => void;
  onRemoveChart: (itemId: string) => void;
  interval: Interval;
  chartType: ChartType;
  theme: "light" | "dark";
  widgetOptions: TradingViewOptions;
  enableChartOperation: boolean;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const ChartGrid = ({
  layouts,
  items,
  onLayoutChange,
  onRemoveChart,
  interval,
  chartType,
  theme,
  widgetOptions,
  enableChartOperation,
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleRemoveRequest = (itemId: string) => {
    setRemovingItemId(itemId);
  };

  const handleCleanupComplete = useCallback(
    (itemId: string) => {
      onRemoveChart(itemId);
      setRemovingItemId(null);
    },
    [onRemoveChart]
  );

  return (
    <ResponsiveGridLayout
      className={`layout ${isDragging ? "dragging" : ""}`}
      layouts={layouts}
      cols={COLS}
      rowHeight={16}
      onLayoutChange={onLayoutChange}
      draggableCancel=".chart-area"
      resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
      compactType="vertical"
      preventCollision={false}
      onDragStart={() => setIsDragging(true)}
      onDragStop={() => setIsDragging(false)}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={() => setIsDragging(false)}
      margin={[0, 0]}
      containerPadding={[0, 0]}
    >
      {items.map((item) => (
        <div
          key={item.i}
          className="bg-card rounded-lg overflow-hidden border border-border shadow-lg flex flex-col"
        >
          <div className="drag-handle flex items-center pr-2 bg-muted/50 text-muted-foreground">
            <span className="flex-1 min-w-0 truncate">{item.label}</span>
            <button
              onClick={() => handleRemoveRequest(item.i)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="チャートを削除"
              disabled={removingItemId !== null}
            >
              <span className="text-xl font-bold -translate-y-px">&times;</span>
            </button>
          </div>
          <div className="flex-grow h-full relative">
            <div className="chart-area h-full">
              <ChartWidget
                item={item}
                interval={interval}
                chartType={chartType}
                theme={theme}
                options={widgetOptions}
                isRemoving={removingItemId === item.i}
                onCleanupComplete={handleCleanupComplete}
              />
            </div>
            {!enableChartOperation && (
              <div className="absolute inset-0 cursor-move" />
            )}
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default ChartGrid;
