// front/app/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ChartWidget from "./ChartWidget";
import { Button } from "@/components/ui/button"; // shadcn/ui

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

  // 1. TanStack Queryでバックエンドからレイアウト情報を取得
  const { data: initialLayout, isLoading } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
  });

  // 2. 取得したデータをstateにセット
  useEffect(() => {
    if (initialLayout) {
      setItems(initialLayout);
    }
  }, [initialLayout]);

  // 3. TanStack Queryでレイアウト情報をバックエンドに保存する関数を定義
  const mutation = useMutation({
    mutationFn: saveLayout,
    onSuccess: () => {
      // 保存が成功したら、キャッシュを更新するなどの処理も可能
      queryClient.invalidateQueries({ queryKey: ["layout"] });
      console.log("Layout saved!");
    },
  });

  // 4. グリッドのレイアウトが変更されたときに呼ばれる関数
  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    // 現在の銘柄情報と新しい位置情報をマージする
    const updatedItems = newLayout.map((layoutItem) => {
      const existingItem = items.find((item) => item.i === layoutItem.i);
      return {
        ...layoutItem,
        symbol: existingItem ? existingItem.symbol : "",
      };
    });
    setItems(updatedItems);
    // mutation.mutate(updatedItems); // ドラッグのたびに保存すると重いので、ボタンで保存
  };

  const handleSaveLayout = () => {
    mutation.mutate(items);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="p-4 space-x-2">
        {/* 時間足一括変更ボタン */}
        <Button onClick={() => setInterval("60")}>1時間</Button>
        <Button onClick={() => setInterval("240")}>4時間</Button>
        <Button onClick={() => setInterval("D")}>日足</Button>
        <Button onClick={() => setInterval("W")}>週足</Button>
        <Button onClick={handleSaveLayout} variant="outline">
          レイアウト保存
        </Button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: items.map(({ symbol, ...rest }) => rest) }} // react-grid-layoutに渡すデータからsymbolを除外
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
      >
        {items.map((item) => (
          <div key={item.i} className="bg-gray-800 rounded-lg overflow-hidden">
            <ChartWidget symbol={item.symbol} interval={interval} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
