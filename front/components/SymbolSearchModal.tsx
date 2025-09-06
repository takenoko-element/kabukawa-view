//front/components/SymbolSearchModal.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Symbol } from "@/types/Symbol";

const API_URL = "http://localhost:8000";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbols: Symbol[]) => void;
  addedSymbols: string[];
};

const TAB_DEFINITIONS = {
  japan: { label: "日本株" },
  us: { label: "米国株" },
  index: { label: "インデックス" },
  fx: { label: "FX" },
};
type TabKey = keyof typeof TAB_DEFINITIONS;

const fetchSymbols = async (): Promise<Symbol[]> => {
  const { data } = await axios.get(`${API_URL}/api/symbols`);
  return data;
};

export const SymbolSearchModal = ({
  isOpen,
  onClose,
  onAdd,
  addedSymbols,
}: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>("japan");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<Symbol[]>([]);

  const { data: allSymbols, isLoading } = useQuery({
    queryKey: ["symbols"],
    queryFn: fetchSymbols,
  });

  // カテゴリごとに銘柄をグループ化
  const symbolsByCategory = useMemo(() => {
    const groupedSymbols: Record<TabKey, Symbol[]> = {
      japan: [],
      us: [],
      index: [],
      fx: [],
    };

    if (!allSymbols) {
      return groupedSymbols;
    }

    for (const symbol of allSymbols) {
      const category = symbol.category as TabKey;
      if (groupedSymbols[category]) {
        groupedSymbols[category].push(symbol);
      }
    }
    return groupedSymbols;
  }, [allSymbols]);

  const filteredSymbols = useMemo(() => {
    const data = symbolsByCategory[activeTab] || [];
    if (!searchQuery) {
      return data;
    }
    return data.filter(
      (symbol: Symbol) =>
        symbol.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        symbol.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery, symbolsByCategory]);

  const handleSelectSymbol = (symbol: Symbol) => {
    // 既にダッシュボードに追加されているシンボルは選択不可にする
    if (addedSymbols.includes(symbol.value)) {
      return;
    }

    setSelectedSymbols((prev) =>
      prev.some((s) => s.value === symbol.value)
        ? prev.filter((s) => s.value !== symbol.value)
        : [...prev, symbol]
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedSymbols([]);
      setSearchQuery("");
      setActiveTab("japan");
    }, 200);
  };

  const handleAdd = () => {
    onAdd(selectedSymbols);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>銘柄を追加</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex gap-4 px-6 overflow-hidden">
          {/* 左側: 選択中（ストック）の銘柄リスト */}
          <div className="w-1/3 flex flex-col gap-2 border-r pr-4 min-h-0">
            <h3 className="text-lg font-semibold tracking-tight">
              追加する銘柄 ({selectedSymbols.length})
            </h3>
            <ScrollArea className="flex-grow min-h-0">
              <div className="flex flex-col gap-2">
                {selectedSymbols.length > 0 ? (
                  selectedSymbols.map((symbol) => (
                    <Badge
                      key={symbol.value}
                      variant="secondary"
                      className="flex justify-between items-center p-2 text-sm"
                    >
                      <span className="truncate">{symbol.label}</span>
                      <button
                        onClick={() => handleSelectSymbol(symbol)}
                        className="ml-2 rounded-full hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">
                    右のリストから銘柄をクリックして追加します。
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右側: 検索エリア */}
          <div className="w-2/3 flex flex-col gap-4 pt-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="銘柄名、シンボルで検索..."
                className="pl-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxLength={30}
              />
            </div>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabKey)}
              className="flex flex-col flex-grow min-h-0"
            >
              <TabsList className="gap-3">
                {Object.entries(TAB_DEFINITIONS).map(([key, { label }]) => (
                  <TabsTrigger key={key} value={key}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="flex-grow min-h-0 mt-2">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <p className="text-center p-4">読み込み中...</p>
                  ) : (
                    filteredSymbols.map((symbol: Symbol) => {
                      const isSelected = selectedSymbols.some(
                        (s) => s.value === symbol.value
                      );
                      const isAlreadyAdded = addedSymbols.includes(
                        symbol.value
                      );
                      return (
                        <div
                          key={symbol.value}
                          onClick={() => handleSelectSymbol(symbol)}
                          className={`flex items-center gap-4 p-2 pr-4 rounded-md ${
                            isAlreadyAdded
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-muted"
                          } ${isSelected ? "bg-muted font-semibold" : ""}`}
                        >
                          <span className="w-20 text-sm text-muted-foreground">
                            {symbol.value.split(":").pop()}
                          </span>
                          <span className="flex-grow truncate">
                            {symbol.label}
                          </span>
                          {isAlreadyAdded && (
                            <Badge variant="secondary">追加済み</Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleAdd} disabled={selectedSymbols.length === 0}>
            {selectedSymbols.length > 0
              ? `${selectedSymbols.length}銘柄を追加`
              : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
