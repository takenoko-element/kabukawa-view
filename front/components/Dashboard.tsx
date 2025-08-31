// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CandlestickChart,
  LineChart,
  BarChart4,
  Settings,
  Search,
} from "lucide-react";

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
import { AllChartSettings, TradingViewOptions } from "@/types/ChartOptions";
import ChartWidget from "./ChartWidget";
import ThemeToggleButton from "./ThemeToggleButton";
import { ChartSettingsModal } from "./ChartSettingsModal";
import { Symbol } from "@/types/Symbol";
import { SymbolSearchModal } from "./SymbolSearchModal";

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
  { label: "ニッスイ", value: "TRADU:1332" },
  { label: "大成建設", value: "TRADU:1801" },
  { label: "大林組", value: "TRADU:1802" },
  { label: "清水建設", value: "1803" },
  { label: "長谷工コーポレーション", value: "2503" },
];

const iconMap: Record<ChartType, React.ElementType> = {
  candles: CandlestickChart,
  line: LineChart,
  bars: BarChart4,
};

const COLS = { lg: 72, md: 60, sm: 36, xs: 24, xxs: 12 };

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
  const [widgetOptions, setWidgetOptions] = useState<TradingViewOptions>({
    hide_top_toolbar: true,
    hide_side_toolbar: true,
    hide_legend: false,
    hide_volume: false,
    withdateranges: false,
  });
  const [enableChartOperation, setEnableChartOperation] = useState(false);
  // 検索モーダルの開閉状態を管理
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  // デフォルトのチャートサイズを管理
  const [defaultChartSize, setDefaultChartSize] = useState({ w: 24, h: 18 });

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

  const findNextAvailablePosition = useCallback(
    (
      layout: LayoutItem[],
      itemWidth: number,
      itemHeight: number
    ): { x: number; y: number } => {
      const cols = COLS.lg; // 最大のcolsを基準に計算
      let maxY = 0;
      layout.forEach((item) => {
        maxY = Math.max(maxY, item.y + item.h);
      });

      // グリッドを上から順にチェック
      for (let y = 0; y < maxY + itemHeight; y++) {
        for (let x = 0; x <= cols - itemWidth; x++) {
          let isSpaceAvailable = true;
          // 新しいアイテムが既存のアイテムと重ならないかチェック
          for (const item of layout) {
            if (
              x < item.x + item.w &&
              x + itemWidth > item.x &&
              y < item.y + item.h &&
              y + itemHeight > item.y
            ) {
              isSpaceAvailable = false;
              break;
            }
          }
          if (isSpaceAvailable) {
            return { x, y };
          }
        }
      }

      // 空きスペースが見つからなければ最下部に配置
      return { x: 0, y: maxY };
    },
    []
  );

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
    const { w, h } = defaultChartSize;
    const { x, y } = findNextAvailablePosition(items, w, h);

    const newItem: LayoutItem = {
      i: `item_${new Date().getTime()}`,
      x,
      y,
      w,
      h,
      symbol: selectedSymbol.value,
      label: selectedSymbol.label,
    };

    setItems([...items, newItem]);
    setSelectedSymbol(null);
  };

  const handleRemoveChart = (itemIdToRemove: string) => {
    setItems(items.filter((item) => item.i !== itemIdToRemove));
  };

  const handleSaveSettings = (newOptions: AllChartSettings) => {
    const { enable_chart_operation, default_w, default_h, ...restOptions } =
      newOptions;

    if (JSON.stringify(widgetOptions) !== JSON.stringify(restOptions)) {
      setWidgetOptions(restOptions);
    }
    setEnableChartOperation(!!enable_chart_operation);
    // デフォルトサイズを更新
    if (default_w && default_h) {
      setDefaultChartSize({ w: default_w, h: default_h });
    }
    setIsSettingsModalOpen(false);
  };

  // 複数の銘柄を一度に追加するためのハンドラ
  const handleAddMultipleCharts = (symbols: Symbol[]) => {
    // 既存のアイテムのコピーを作成し、これを基準に新しいアイテムの配置を計算する
    const layoutForPlacement = [...items];

    const newItems = symbols.map((symbol) => {
      const { w, h } = defaultChartSize;
      // 常に最新のレイアウト状況を渡して、次の配置場所を見つける
      const { x, y } = findNextAvailablePosition(layoutForPlacement, w, h);

      const newItem: LayoutItem = {
        i: `${symbol.value}_${new Date().getTime()}_${Math.random()}`,
        x,
        y,
        w,
        h,
        symbol: symbol.value,
        label: symbol.label,
      };

      // 次のアイテムの配置計算のために、作成したアイテムを仮のレイアウトに追加する
      layoutForPlacement.push(newItem);

      return newItem;
    });

    // 最後に、既存のアイテムと新しく作成したすべてのアイテムを結合してstateを更新する
    setItems((prevItems) => [...prevItems, ...newItems]);
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
        {/* グループ3: 銘柄追加のプルダウンメニュー */}
        <div className="ml-4 flex items-center gap-2">
          <Button onClick={() => setIsSearchModalOpen(true)}>
            <Search className="mr-2 h-4 w-4" />
            銘柄を追加
          </Button>
        </div>
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
        {/* レイアウト保存 */}
        <Button
          onClick={handleSaveLayout}
          variant="outline"
          className="transition-all duration-200"
        >
          レイアウト保存
        </Button>
        {/* ライトモード/ダークモード */}
        <ThemeToggleButton />
      </div>

      <ResponsiveGridLayout
        // isDragging状態に応じてクラスを動的に追加
        className={`layout ${isDragging ? "dragging" : ""}`}
        cols={COLS}
        rowHeight={16}
        onLayoutChange={handleLayoutChange}
        draggableCancel=".chart-area"
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
              <span className="flex-1 min-w-0 truncate">{item.label}</span>
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
            <div className="flex-grow h-full relative">
              {/* ChartWidget自体は常にドラッグキャンセル領域に配置 */}
              <div className="chart-area h-full">
                <ChartWidget
                  symbol={item.symbol}
                  interval={interval}
                  label={item.label}
                  chartType={chartType}
                  theme={resolvedTheme as "light" | "dark"}
                  options={widgetOptions}
                />
              </div>

              {/* チャート操作が無効な時だけ、上に透明なオーバーレイを重ねてドラッグ操作を受け付ける */}
              {!enableChartOperation && (
                <div className="absolute inset-0 cursor-move" />
              )}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
      {/* --- モーダルコンポーネントを描画 --- */}
      <ChartSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        options={{
          ...widgetOptions,
          enable_chart_operation: enableChartOperation,
          default_w: defaultChartSize.w,
          default_h: defaultChartSize.h,
        }}
        onSave={handleSaveSettings}
      />
      <SymbolSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAdd={handleAddMultipleCharts}
      />
    </div>
  );
};

export default Dashboard;
