// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ChartWidget from "./ChartWidget";
import { Button } from "@/components/ui/button";

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

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [interval, setInterval] = useState("D"); // 時間足の状態 (D: 日足)

  // ドラッグ/リサイズ中かどうかの状態を管理
  const [isDragging, setIsDragging] = useState(false);

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
    const updatedItems = newLayout.map((layoutItem) => {
      const existingItem = items.find((item) => item.i === layoutItem.i);
      return {
        ...layoutItem,
        symbol: existingItem ? existingItem.symbol : "TSE:9984", // Fallback symbol
      };
    });
    setItems(updatedItems);
  };

  const handleSaveLayout = () => {
    mutation.mutate(items);
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
            <div className="drag-handle">{item.symbol}</div>
            <div className="flex-grow h-full">
              <ChartWidget symbol={item.symbol} interval={interval} />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
