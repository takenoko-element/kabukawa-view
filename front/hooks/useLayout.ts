// front/hooks/useLayout.ts
// hooks/useLayout.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Layout, Layouts as ReactGridLayouts } from "react-grid-layout";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { LayoutItem, Symbol, Layouts } from "@/types";
import { COLS } from "@/constants/cols";
import { DefaultChartSizes } from "@/types";
import { API_URL } from "@/constants/config";

// APIから取得/APIへ送信するデータの型
type LayoutData = Layouts;

export const useLayout = (defaultChartSizes: DefaultChartSizes) => {
  const queryClient = useQueryClient();
  const [layouts, setLayouts] = useState<Layouts>({});
  const { getToken, isSignedIn } = useAuth();
  const isInitialLoad = useRef(true);

  // --- API通信の関数 ---
  const fetchLayout = async (): Promise<LayoutData> => {
    const token = await getToken();
    if (!token) {
      return {};
    }
    const { data } = await axios.get(`${API_URL}/api/layout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // APIからのレスポンスが空の場合、空のオブジェクトを返す
    return data && Object.keys(data).length > 0 ? data : {};
  };

  const saveLayoutApi = async (layouts: LayoutData): Promise<void> => {
    const token = await getToken();
    if (!token) return;
    await axios.post(`${API_URL}/api/layout`, layouts, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: initialLayouts, isLoading } = useQuery({
    queryKey: ["layouts"],
    queryFn: fetchLayout,
    enabled: !!isSignedIn,
  });

  useEffect(() => {
    if (initialLayouts) {
      setLayouts(initialLayouts);
    }
  }, [initialLayouts]);

  useEffect(() => {
    if (!isSignedIn) {
      setLayouts({});
      isInitialLoad.current = true;
    }
  }, [isSignedIn]);

  const mutation = useMutation({
    mutationFn: saveLayoutApi,
    onSuccess: (_, savedLayouts) => {
      queryClient.setQueryData(["layouts"], savedLayouts);
      // toast.success("レイアウトを自動保存しました");
    },
    onError: (error) => {
      console.error("Layout save failed:", error);
      toast.error("レイアウトの自動保存に失敗しました");
    },
  });

  // --- レイアウト自動保存 ---
  useEffect(() => {
    if (!isSignedIn || isLoading) {
      return;
    }

    // 初回読み込み時は、保存処理をスキップする
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // ユーザー操作終了後1.5秒のデバウンスを設定
    const handler = setTimeout(() => {
      mutation.mutate(layouts);
    }, 1500);

    // クリーンアップ関数
    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layouts]);

  const items = useMemo(() => layouts.lg || [], [layouts]);
  const addedSymbols = useMemo(() => items.map((item) => item.symbol), [items]);

  const findNextAvailablePosition = useCallback(
    (
      layout: LayoutItem[],
      itemWidth: number,
      itemHeight: number,
      cols: number
    ): { x: number; y: number } => {
      let maxY = 0;
      layout.forEach((item) => {
        maxY = Math.max(maxY, item.y + item.h);
      });

      for (let y = 0; y <= maxY; y++) {
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

  const handleLayoutChange = useCallback(
    (_: Layout[], allNewLayouts: ReactGridLayouts) => {
      setLayouts((currentLayouts) => {
        const allItems = currentLayouts.lg || [];
        const updatedLayouts: Layouts = {};

        for (const breakpoint in allNewLayouts) {
          updatedLayouts[breakpoint] = allNewLayouts[breakpoint].map(
            (newLayoutItem) => {
              const originalItem = allItems.find(
                (item) => item.i === newLayoutItem.i
              );
              return {
                ...newLayoutItem,
                symbol: originalItem?.symbol || "",
                label: originalItem?.label || "",
              };
            }
          );
        }
        return { ...currentLayouts, ...updatedLayouts };
      });
    },
    []
  );

  // 手動レイアウト保存実装時に必要
  // const saveLayout = () => {
  //   mutation.mutate(layouts);
  // };

  const addMultipleCharts = (symbols: Symbol[]) => {
    const symbolsToAdd = symbols.filter(
      (symbol) => !addedSymbols.includes(symbol.value)
    );
    if (symbolsToAdd.length === 0) return;

    setLayouts((prevLayouts) => {
      const newLayouts = JSON.parse(JSON.stringify(prevLayouts)); // Deep copy
      const breakpoints = Object.keys(COLS) as (keyof typeof COLS)[];

      symbolsToAdd.forEach((symbol) => {
        const uniqueId = `${
          symbol.value
        }_${new Date().getTime()}_${Math.random()}`;

        breakpoints.forEach((bp) => {
          if (!newLayouts[bp]) {
            newLayouts[bp] = [];
          }
          const layoutForPlacement = newLayouts[bp];
          const { w, h } = defaultChartSizes[bp];
          const { x, y } = findNextAvailablePosition(
            layoutForPlacement,
            w,
            h,
            COLS[bp]
          );
          const newItem: LayoutItem = {
            i: uniqueId,
            x,
            y,
            w,
            h,
            symbol: symbol.value,
            label: symbol.label,
          };
          newLayouts[bp].push(newItem);
        });
      });
      return newLayouts;
    });
  };

  const removeChart = useCallback((itemIdToRemove: string) => {
    setLayouts((prevLayouts) => {
      const newLayouts: Layouts = {};
      for (const bp in prevLayouts) {
        newLayouts[bp] = prevLayouts[bp].filter(
          (item) => item.i !== itemIdToRemove
        );
      }
      return newLayouts;
    });
  }, []);

  return {
    layouts,
    items, // ChartGridのレンダリング用に 'lg' のアイテムを渡す
    isLoading,
    addedSymbols,
    handleLayoutChange,
    // 手動レイアウト保存実装時に必要
    // saveLayout,
    addMultipleCharts,
    removeChart,
  };
};
