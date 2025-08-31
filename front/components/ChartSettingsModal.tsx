// front/components/ChartSettingsModal.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AllChartSettings, TradingViewOptions } from "@/types/ChartOptions";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  options: AllChartSettings;
  onSave: (newOptions: AllChartSettings) => void;
};

// --- バリデーションの制約を定義 ---
const SIZE_CONSTRAINTS = {
  w: { min: 8, max: 72 },
  h: { min: 9, max: 50 },
};

// オプションのラベルと説明を定義
const displayOptionsMetadata = [
  {
    key: "hide_top_toolbar",
    label: "上部ツールバーを表示",
    description: "時間足やスタイル変更などのツールバーです。",
  },
  {
    key: "hide_side_toolbar",
    label: "描画ツールバーを表示",
    description: "トレンドラインなどを引くツールバーです。",
  },
  {
    key: "hide_legend",
    label: "銘柄情報を表示",
    description: "銘柄のOHLC（始値・高値・安値・終値）情報です。",
  },
  {
    key: "hide_volume",
    label: "出来高情報を表示",
    description: "チャート下の出来高情報です。",
  },
  {
    key: "withdateranges",
    label: "日付範囲セレクターを表示",
    description: "チャート下部の日付や期間を選択するボタンです。",
  },
];

// その他の操作・設定
const behaviorOptionsMetadata = {
  enable_chart_operation: {
    key: "enable_chart_operation",
    label: "チャート操作を有効化",
    description: "チャートをドラッグ/スクロールで操作を有効にします。",
  },
};

export const ChartSettingsModal = ({
  isOpen,
  onClose,
  options,
  onSave,
}: Props) => {
  // モーダル内での変更を一時的に保持するためのローカルstate
  const [localOptions, setLocalOptions] = useState(options);
  const [errors, setErrors] = useState<{
    default_w?: string;
    default_h?: string;
  }>({});

  // バリデーションチェック
  const validateOptions = useCallback((opts: typeof localOptions) => {
    const newErrors: { default_w?: string; default_h?: string } = {};
    const { default_w, default_h } = opts;

    // 幅(W)のバリデーション
    if (default_w === undefined || String(default_w).trim() === "") {
      newErrors.default_w = "数値を入力してください。";
    } else if (isNaN(default_w)) {
      newErrors.default_w = "無効な数値です。";
    } else {
      const c = SIZE_CONSTRAINTS.w;
      if (default_w < c.min || default_w > c.max) {
        newErrors.default_w = `${c.min}〜${c.max}の範囲で入力してください。`;
      }
    }

    // 高さ(H)のバリデーション
    if (default_h === undefined || String(default_h).trim() === "") {
      newErrors.default_h = "数値を入力してください。";
    } else if (isNaN(default_h)) {
      newErrors.default_h = "無効な数値です。";
    } else {
      const c = SIZE_CONSTRAINTS.h;
      if (default_h < c.min || default_h > c.max) {
        newErrors.default_h = `${c.min}〜${c.max}の範囲で入力してください。`;
      }
    }
    setErrors(newErrors);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalOptions(options);
    }
  }, [options, isOpen]);

  useEffect(() => {
    validateOptions(localOptions);
  }, [localOptions, validateOptions]);

  // トグルスイッチの変更をハンドル
  const handleToggle = (key: keyof AllChartSettings, checked: boolean) => {
    // TradingViewのオプションは 'hide_...' が多いので、表示/非表示を反転させる
    const value = key.startsWith("hide_") ? !checked : checked;
    setLocalOptions((prev) => ({ ...prev, [key]: value }));
  };

  // 保存ボタンが押されたら、変更を親コンポーネントに渡す
  const handleSave = () => {
    onSave(localOptions);
  };

  // チャートサイズの変更
  const handleSizeChange = (key: "default_w" | "default_h", value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setLocalOptions((prev) => ({ ...prev, [key]: numValue }));
  };

  // エラーオブジェクトに何かしらのキーが存在するかどうかで、エラーの有無を判定
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl grid grid-rows-[auto_1fr_auto] max-h-[90vh] p-0">
        <ScrollArea className="px-6 min-h-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>チャート表示設定</DialogTitle>
            <DialogDescription>
              全てのチャートに適用される表示オプションを変更します。
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">
            {/* 左カラム: 表示設定 */}
            <div className="flex flex-col gap-6">
              {displayOptionsMetadata.map(({ key, label, description }) => {
                const typedKey = key as keyof TradingViewOptions;
                const isChecked = key.startsWith("hide_")
                  ? !localOptions[typedKey]
                  : localOptions[typedKey];
                return (
                  <div key={key} className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 pr-4">
                      <Label htmlFor={key} className="text-base">
                        {label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={!!isChecked}
                      onCheckedChange={(checked) =>
                        handleToggle(typedKey, checked)
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* 右カラム: 操作設定とサイズ設定 */}
            <div className="flex flex-col gap-6 rounded-lg border bg-muted/30 p-4">
              {/* チャート操作 */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1 pr-4">
                    <Label
                      htmlFor={
                        behaviorOptionsMetadata.enable_chart_operation.key
                      }
                      className="text-base"
                    >
                      {behaviorOptionsMetadata.enable_chart_operation.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {
                        behaviorOptionsMetadata.enable_chart_operation
                          .description
                      }
                    </p>
                  </div>
                  <Switch
                    id={behaviorOptionsMetadata.enable_chart_operation.key}
                    checked={!!localOptions.enable_chart_operation}
                    onCheckedChange={(checked) =>
                      handleToggle("enable_chart_operation", checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* デフォルトサイズ */}
              <div className="flex flex-col gap-2">
                <div>
                  <Label htmlFor="default_size" className="text-base">
                    デフォルトチャートサイズ
                  </Label>
                  <p className="text-sm text-muted-foreground pt-1">
                    新規追加時のチャートの幅(W)と高さ(H)を設定します。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 items-start pt-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="default_w">
                      幅 (W: {SIZE_CONSTRAINTS.w.min}〜{SIZE_CONSTRAINTS.w.max})
                    </Label>
                    <Input
                      id="default_w"
                      type="number"
                      placeholder="W"
                      value={localOptions.default_w ?? ""}
                      onChange={(e) =>
                        handleSizeChange("default_w", e.target.value)
                      }
                      aria-invalid={!!errors.default_w}
                    />
                    {errors.default_w && (
                      <p className="text-sm text-destructive">
                        {errors.default_w}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="default_h">
                      高さ (H: {SIZE_CONSTRAINTS.h.min}〜
                      {SIZE_CONSTRAINTS.h.max})
                    </Label>
                    <Input
                      id="default_h"
                      type="number"
                      placeholder="H"
                      value={localOptions.default_h ?? ""}
                      onChange={(e) =>
                        handleSizeChange("default_h", e.target.value)
                      }
                      aria-invalid={!!errors.default_h}
                    />
                    {errors.default_h && (
                      <p className="text-sm text-destructive">
                        {errors.default_h}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={hasErrors}>
            設定を適用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
