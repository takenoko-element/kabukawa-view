// front/hooks/useLayout.ts
// hooks/useLayout.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Layout } from "react-grid-layout";
import { useAuth } from "@clerk/nextjs";

import { toast } from "sonner";
import { LayoutItem, Symbol } from "@/types";
import { COLS } from "@/constants/cols";

const API_URL = "http://localhost:8000";

// APIから取得/APIへ送信するデータの型
type LayoutData = LayoutItem[];

export const useLayout = () => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LayoutItem[]>([]);
  const { getToken } = useAuth();

  // --- API通信の関数 ---
  const fetchLayout = async (): Promise<LayoutData> => {
    const token = await getToken();
    const { data } = await axios.get(`${API_URL}/api/layout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  };

  const saveLayoutApi = async (layout: LayoutData): Promise<void> => {
    const token = await getToken();
    await axios.post(`${API_URL}/api/layout`, layout, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: initialLayout, isLoading } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
    // enabled: !!getToken(),
  });

  useEffect(() => {
    if (initialLayout) {
      setItems(initialLayout);
    }
  }, [initialLayout]);

  const mutation = useMutation({
    mutationFn: saveLayoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout"] });
      toast.success("レイアウトを保存しました");
    },
    onError: (error) => {
      console.error("Layout save failed:", error);
      toast.error("レイアウトの保存に失敗しました");
    },
  });

  const addedSymbols = useMemo(() => items.map((item) => item.symbol), [items]);

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

      for (let y = 0; y < maxY + itemHeight; y++) {
        for (let x = 0; x <= cols - itemWidth; x++) {
          let isSpaceAvailable = true;
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
      return { x: 0, y: maxY };
    },
    []
  );

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
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
  }, []);

  const saveLayout = () => {
    mutation.mutate(items);
  };

  const addMultipleCharts = (
    symbols: Symbol[],
    defaultChartSize: { w: number; h: number }
  ) => {
    const layoutForPlacement = [...items];
    const newItems = symbols.map((symbol) => {
      const { w, h } = defaultChartSize;
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
      layoutForPlacement.push(newItem);
      return newItem;
    });
    setItems((prevItems) => [...prevItems, ...newItems]);
  };

  const removeChart = useCallback((itemIdToRemove: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.i !== itemIdToRemove)
    );
  }, []);

  return {
    items,
    setItems,
    isLoading,
    addedSymbols,
    handleLayoutChange,
    saveLayout,
    addMultipleCharts,
    removeChart,
  };
};
