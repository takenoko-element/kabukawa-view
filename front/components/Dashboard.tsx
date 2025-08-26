// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CandlestickChart, LineChart, BarChart4, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { chartTypeOptions, ChartType } from "@/constants/chartTypes";
import { intervalOptions, Interval } from "@/constants/intervals";
import { ChartOptions } from "@/types/ChartOptions";
import ChartWidget from "./ChartWidget";
import ThemeToggleButton from "./ThemeToggleButton";
import { ChartSettingsModal } from "./ChartSettingsModal";

// グリッドレイアウトの型定義
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  symbol: string;
  label: string;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// APIから取得/APIへ送信するデータの型
type LayoutData = LayoutItem[];

// --- API通信の関数 ---
const fetchLayout = async (): Promise<LayoutData> => {
  const { data } = await axios.get("http://localhost:8000/api/layout");
  return data;
};

const saveLayout = async (layout: LayoutData): Promise<void> => {
  await axios.post("http://localhost:8000/api/layout", layout);
};

const presetSymbols = [
  { label: "日経平均 (Nikkei 225)", value: "NIKKEI225" },
  { label: "TOPIX", value: "TOPIX" },
  { label: "トヨタ自動車", value: "TRADU:7203" },
  { label: "ソニーグループ", value: "TRADU:6758" },
  { label: "ソフトバンクグループ", value: "TRADU:9984" },
  { label: "S&P 500", value: "VANTAGE:SP500" },
  { label: "NASDAQ 100", value: "NASDAQ:NDX" },
  { label: "Apple", value: "NASDAQ:AAPL" },
  { label: "Microsoft", value: "NASDAQ:MSFT" },
  { label: "ドル/円 (USD/JPY)", value: "FX:USDJPY" },
  { label: "ユーロ/ドル (EUR/USD)", value: "FX:EURUSD" },
];

const iconMap: Record<ChartType, React.ElementType> = {
  candles: CandlestickChart,
  line: LineChart,
  bars: BarChart4,
};

const Dashboard = () => {
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [interval, setInterval] = useState<Interval>("30");
  // ドラッグ/リサイズ中かどうかの状態を管理
  const [isDragging, setIsDragging] = useState(false);
  // 選択された銘柄情報を管理
  const [selectedSymbol, setSelectedSymbol] = useState<{
    label: string;
    value: string;
  } | null>(null);
  // チャートのスタイルを管理
  const [chartType, setChartType] = useState<ChartType>("candles");
  // モーダルの開閉状態を管理
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // チャートオプションの状態を管理
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    hide_top_toolbar: true,
    hide_side_toolbar: true,
    hide_legend: false,
    hide_volume: false,
    withdateranges: false,
  });

  const { data: initialLayout, isLoading } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
  });

  useEffect(() => {
    if (initialLayout) {
      setItems(initialLayout);
    }
  }, [initialLayout]);

  const mutation = useMutation({
    mutationFn: saveLayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout"] });
      console.log("Layout saved!");
    },
  });

  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    setItems((currentItems) => {
      const layoutMap = new Map(newLayout.map((l) => [l.i, l]));
      return currentItems.map((item) => {
        const layoutUpdate = layoutMap.get(item.i);
        if (layoutUpdate) {
          return {
            ...item,
            x: layoutUpdate.x,
            y: layoutUpdate.y,
            w: layoutUpdate.w,
            h: layoutUpdate.h,
          };
        }
        return item;
      });
    });
  };

  const handleSaveLayout = () => {
    mutation.mutate(items);
  };

  const handleAddChart = () => {
    if (!selectedSymbol) return;

    const newItem: LayoutItem = {
      // ユニークなIDを生成
      i: `item_${new Date().getTime()}`,
      // 新しいチャートは左下に配置する
      // y: Infinity を指定すると、グリッドの最下部に自動で配置される
      x: 0,
      y: Infinity,
      // デフォルトのサイズ
      w: 24,
      h: 18,
      // 選択された銘柄の値をsymbolに、ラベルをlabelに設定
      symbol: selectedSymbol.value,
      label: selectedSymbol.label,
    };

    setItems([...items, newItem]);
    setSelectedSymbol(null);
  };

  const handleRemoveChart = (itemIdToRemove: string) => {
    setItems(items.filter((item) => item.i !== itemIdToRemove));
  };

  const handleSaveSettings = (newOptions: ChartOptions) => {
    setChartOptions(newOptions);
    setIsSettingsModalOpen(false);
  };

  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div>
      <div className="h-14 px-4 py-2 flex items-center gap-4">
        {/* グループ1: チャートスタイルと設定 */}
        <div className="flex items-center gap-1">
          {chartTypeOptions.map((option) => {
            const IconComponent = iconMap[option.name];
            return (
              <Button
                key={option.name}
                variant={chartType === option.name ? "default" : "secondary"}
                size="icon"
                onClick={() => setChartType(option.name)}
                title={option.label}
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsModalOpen(true)}
            title="チャート設定"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <Separator orientation="vertical" />
        {/* グループ2: 時間足 */}
        <div className="flex items-center gap-1">
          {intervalOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setInterval(option.value)}
              // 現在選択中の時間足と一致する場合のスタイルを追加
              variant={interval === option.value ? "default" : "secondary"}
              className="transition-all duration-200"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Separator orientation="vertical" />
        {/* グループ2: 銘柄追加のプルダウンメニュー */}
        <div className="ml-4 flex items-center gap-2">
          <Select
            onValueChange={(value) => {
              const selected = presetSymbols.find((s) => s.value === value);
              if (selected) {
                setSelectedSymbol(selected);
              }
            }}
            value={selectedSymbol?.value ?? ""}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="一覧から選択" />
            </SelectTrigger>
            <SelectContent>
              {presetSymbols.map((symbol) => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddChart}>追加</Button>
        </div>
        <div className="flex-grow" /> {/* 右寄せにするためのスペーサー */}
        <Button
          onClick={handleSaveLayout}
          variant="outline"
          className="transition-all duration-200"
        >
          レイアウト保存
        </Button>
        <ThemeToggleButton />
      </div>

      <ResponsiveGridLayout
        // isDragging状態に応じてクラスを動的に追加
        className={`layout ${isDragging ? "dragging" : ""}`}
        cols={{ lg: 72, md: 60, sm: 36, xs: 24, xxs: 12 }}
        rowHeight={16}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
        compactType="vertical"
        preventCollision={false}
        // ドラッグ/リサイズ開始/終了時にisDragging状態を更新
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={() => setIsDragging(false)}
        // アイテム間のマージンとコンテナのパディングを0に設定
        margin={[0, 0]}
        containerPadding={[0, 0]}
      >
        {items.map((item) => (
          <div
            key={item.i}
            data-grid={{
              i: item.i,
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            }}
            className="bg-card rounded-lg overflow-hidden border border-border shadow-lg flex flex-col"
          >
            <div className="drag-handle flex items-center pr-2 bg-muted/50 text-muted-foreground">
              <span>{item.label}</span>
              <div className="flex-grow" />
              <button
                onClick={() => handleRemoveChart(item.i)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title="チャートを削除"
              >
                <span className="text-xl font-bold -translate-y-px">
                  &times;
                </span>
              </button>
            </div>
            <div className="flex-grow h-full">
              <ChartWidget
                symbol={item.symbol}
                interval={interval}
                label={item.label}
                chartType={chartType}
                theme={resolvedTheme as "light" | "dark"}
                options={chartOptions}
              />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
      {/* --- モーダルコンポーネントを描画 --- */}
      <ChartSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        options={chartOptions}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default Dashboard;
