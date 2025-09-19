// front/components/UpgradeView.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  NORMAL_USER_MAX_CHARTS,
  PREMIUM_USER_MAX_CHARTS,
} from "@/constants/config";
import { Check } from "lucide-react";

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
);

type Props = {
  onProceed: () => void;
};

export const UpgradeView = ({ onProceed }: Props) => {
  return (
    <div className="rounded-lg border bg-card p-6 text-foreground shadow-lg">
      <h2 className="text-2xl font-bold text-center">KABUKAWA View Pro</h2>

      <div className="my-6">
        <p className="text-center text-muted-foreground">
          プレミアムプランにアップグレードして、全ての機能を開放しましょう。
        </p>
        <div className="my-6 text-center">
          <span className="text-5xl font-extrabold">¥500</span>
          <span className="ml-2 text-xl font-medium text-muted-foreground">
            / 買い切り
          </span>
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
      <Button onClick={onProceed} className="mt-8 w-full" size="lg">
        アップグレードに進む
      </Button>
    </div>
  );
};
