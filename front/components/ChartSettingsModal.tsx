// front/components/ChartSettingsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ChartOptions } from "@/types/ChartOptions";
import { Input } from "./ui/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  options: ChartOptions & { default_w?: number; default_h?: number };
  onSave: (
    newOptions: ChartOptions & { default_w?: number; default_h?: number }
  ) => void;
};

// --- バリデーションの制約を定義 ---
const SIZE_CONSTRAINTS = {
  w: { min: 8, max: 72 },
  h: { min: 9, max: 50 },
};

// オプションのラベルと説明を定義
const optionMetadata = [
  {
    key: "hide_top_toolbar",
    label: "上部ツールバーを表示",
    description: "チャート上部の時間足やスタイル変更などのツールバーです。",
  },
  {
    key: "hide_side_toolbar",
    label: "描画ツールバーを表示",
    description: "チャート左側のトレンドラインなどを引くツールバーです。",
  },
  {
    key: "hide_legend",
    label: "銘柄情報を表示",
    description: "チャート左上のOHLC（始値・高値・安値・終値）情報です。",
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
  {
    key: "enable_chart_operation",
    label: "チャート操作を有効化",
    description: "チャートをドラッグ/スクロールで操作を有効にします。",
  },
];

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

  // propsで渡されたoptionsが変更されたらローカルstateも更新
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // トグルスイッチの変更をハンドル
  const handleToggle = (key: keyof ChartOptions, checked: boolean) => {
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

    // stateを更新して入力値を即座に反映
    setLocalOptions((prev) => ({ ...prev, [key]: numValue }));

    // バリデーションチェック
    if (numValue === undefined || value.trim() === "") {
      setErrors((prev) => ({ ...prev, [key]: "数値を入力してください。" }));
    } else if (isNaN(numValue)) {
      setErrors((prev) => ({ ...prev, [key]: "無効な数値です。" }));
    } else {
      const constraints =
        key === "default_w" ? SIZE_CONSTRAINTS.w : SIZE_CONSTRAINTS.h;
      if (numValue < constraints.min || numValue > constraints.max) {
        setErrors((prev) => ({
          ...prev,
          [key]: `${constraints.min}〜${constraints.max}の範囲で入力してください。`,
        }));
      } else {
        // エラーがない場合は該当キーのエラーメッセージを削除
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
  };

  // エラーオブジェクトに何かしらのキーが存在するかどうかで、エラーの有無を判定
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>チャート表示設定</DialogTitle>
          <DialogDescription>
            全てのチャートに適用される表示オプションを変更します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {optionMetadata.map(({ key, label, description }) => {
            // 表示/非表示をUI上の表現に合わせる
            const isChecked = key.startsWith("hide_")
              ? !localOptions[key as keyof ChartOptions]
              : localOptions[key as keyof ChartOptions];

            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={key} className="text-base">
                    {label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  id={key}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggle(key as keyof ChartOptions, checked)
                  }
                />
              </div>
            );
          })}
          {/* --- チャートサイズの入力欄 --- */}
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="default_size" className="text-base">
                デフォルトチャートサイズ
              </Label>
              <p className="text-sm text-muted-foreground pt-1">
                新規追加時のチャートの幅(W)と高さ(H)を設定します。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* --- 幅(W)の入力欄 --- */}
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
                  <p className="text-sm text-destructive">{errors.default_w}</p>
                )}
              </div>
              {/* --- 高さ(H)の入力欄 --- */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default_h">
                  高さ (H: {SIZE_CONSTRAINTS.h.min}〜{SIZE_CONSTRAINTS.h.max})
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
                  <p className="text-sm text-destructive">{errors.default_h}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
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
