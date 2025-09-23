// front/components/UpgradeView.tsx
"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Plan } from "@/types";
import {
  NORMAL_USER_MAX_CHARTS,
  PREMIUM_USER_MAX_CHARTS,
} from "@/constants/config";
import { usePrices } from "@/hooks/usePrices";

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
);

type Props = {
  onProceed: (plan: Plan) => void;
};

const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== "number") return "---";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const UpgradeView = ({ onProceed }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("one_time");
  const { prices, isLoading, error } = usePrices();

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-foreground shadow-lg flex justify-center items-center h-[450px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !prices) {
    return (
      <div className="rounded-lg border bg-card p-6 text-destructive-foreground shadow-lg text-center">
        <h2 className="text-xl font-bold">エラー</h2>
        <p className="mt-4">価格情報の取得に失敗しました。</p>
        <p className="text-sm mt-1">時間をおいて再度お試しください。</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 text-foreground shadow-lg">
      <h2 className="text-2xl font-bold text-center">KABUKAWA View Pro</h2>

      <div className="my-6">
        <p className="text-center text-muted-foreground">
          アップグレードして、全ての機能を開放しましょう。
        </p>

        {/* --- プラン選択 --- */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div
            className={cn(
              "rounded-lg border p-4 text-center cursor-pointer transition-all",
              selectedPlan === "one_time" &&
                "ring-2 ring-primary border-primary"
            )}
            onClick={() => setSelectedPlan("one_time")}
          >
            <h3 className="font-semibold">買い切り</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(prices.one_time?.amount)}
            </p>
            <p className="text-xs text-muted-foreground">一括払い</p>
          </div>
          <div
            className={cn(
              "rounded-lg border p-4 text-center cursor-pointer transition-all",
              selectedPlan === "subscription" &&
                "ring-2 ring-primary border-primary"
            )}
            onClick={() => setSelectedPlan("subscription")}
          >
            <h3 className="font-semibold">サブスク</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(prices.subscription?.amount)}
            </p>
            <p className="text-xs text-muted-foreground">/ 月</p>
          </div>
        </div>
      </div>

      <ul className="space-y-4 text-left text-sm">
        <ListItem>
          <strong>チャート表示数の上限UP:</strong> 最大{NORMAL_USER_MAX_CHARTS}
          個から
          <strong>{PREMIUM_USER_MAX_CHARTS}個</strong>に増加します。
        </ListItem>
        {/* <ListItem>
          <strong>広告の非表示:</strong>{" "}
          より快適に分析に集中できます。(将来実装予定)
        </ListItem>
        <ListItem>
          <strong>優先的なサポート:</strong>{" "}
          お問い合わせに優先的に対応します。(将来実装予定)
        </ListItem> */}
      </ul>
      <Button
        onClick={() => onProceed(selectedPlan)}
        className="mt-8 w-full"
        size="lg"
      >
        アップグレードに進む
      </Button>
    </div>
  );
};
