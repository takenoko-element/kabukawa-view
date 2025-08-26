// front/components/ChartSettingsModal.tsx
"use client";

import { useState, useEffect } from "react";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  options: ChartOptions;
  onSave: (newOptions: ChartOptions) => void;
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
];

export const ChartSettingsModal = ({
  isOpen,
  onClose,
  options,
  onSave,
}: Props) => {
  // モーダル内での変更を一時的に保持するためのローカルstate
  const [localOptions, setLocalOptions] = useState(options);

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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>設定を適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
