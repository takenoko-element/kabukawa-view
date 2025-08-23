// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChartWidget from "./ChartWidget";

// グリッドレイアウトの型定義
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  symbol: string;
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
  { label: "S&P 500", value: "SP:SPX" },
  { label: "NASDAQ 100", value: "NASDAQ:NDX" },
  { label: "Apple", value: "NASDAQ:AAPL" },
  { label: "Microsoft", value: "NASDAQ:MSFT" },
  { label: "ドル/円 (USD/JPY)", value: "FX:USDJPY" },
  { label: "ユーロ/ドル (EUR/USD)", value: "FX:EURUSD" },
];

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [interval, setInterval] = useState("D");
  // ドラッグ/リサイズ中かどうかの状態を管理
  const [isDragging, setIsDragging] = useState(false);
  // 銘柄コードを管理
  const [newSymbol, setNewSymbol] = useState("");

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
    if (!newSymbol.trim()) return;

    const newItem: LayoutItem = {
      // ユニークなIDを生成
      i: `item_${new Date().getTime()}`,
      // 新しいチャートは左下に配置する
      // y: Infinity を指定すると、グリッドの最下部に自動で配置される
      x: 0,
      y: Infinity,
      // デフォルトのサイズ
      w: 8,
      h: 6,
      // 入力された銘柄コード
      symbol: newSymbol.toUpperCase(),
    };

    setItems([...items, newItem]);
    setNewSymbol("");
  };

  const handleRemoveChart = (itemIdToRemove: string) => {
    setItems(items.filter((item) => item.i !== itemIdToRemove));
  };

  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div>
      <div className="p-4 flex items-center gap-2">
        {["15", "30", "60", "240", "D", "W"].map((iv) => (
          <Button
            key={iv}
            onClick={() => setInterval(iv)}
            // 現在選択中の時間足と一致する場合のスタイルを追加
            variant={interval === iv ? "default" : "secondary"}
            className="transition-all duration-200"
          >
            {/* 表示用のラベルを定義 */}
            {
              {
                "15": "15分",
                "30": "30分",
                "60": "1時間",
                "240": "4時間",
                D: "日足",
                W: "週足",
              }[iv]
            }
          </Button>
        ))}
        <div className="ml-4 flex items-center gap-2">
          {/* プルダウンメニュー */}
          <Select onValueChange={(value) => setNewSymbol(value)}>
            <SelectTrigger className="w-[220px] bg-gray-800 border-gray-600 text-white">
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
          {/* 手動入力欄 */}
          <Input
            type="text"
            placeholder="銘柄コード (例: TSE:9984)"
            className="w-48 bg-gray-800 border-gray-600 text-white"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            // Enterキーでも追加できるようにする
            onKeyDown={(e) => e.key === "Enter" && handleAddChart()}
          />
          <Button onClick={handleAddChart}>追加</Button>
        </div>
        <div className="flex-grow" /> {/* 右寄せにするためのスペーサー */}
        <Button
          onClick={handleSaveLayout}
          variant="outline"
          className="transition-all duration-200 text-black"
        >
          レイアウト保存
        </Button>
      </div>

      <ResponsiveGridLayout
        // isDragging状態に応じてクラスを動的に追加
        className={`layout ${isDragging ? "dragging" : ""}`}
        layouts={{ lg: items.map(({ symbol, ...rest }) => rest) }}
        cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
        rowHeight={50}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
        compactType={null}
        preventCollision={true}
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
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg flex flex-col"
          >
            <div className="drag-handle flex items-center pr-2">
              <span>{item.symbol}</span>
              <div className="flex-grow" />
              <button
                onClick={() => handleRemoveChart(item.i)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
                title="チャートを削除"
              >
                <span className="text-xl font-bold -translate-y-px">
                  &times;
                </span>
              </button>
            </div>
            <div className="flex-grow h-full">
              <ChartWidget symbol={item.symbol} interval={interval} />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
