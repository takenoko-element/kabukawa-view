// front/components/UpgradeButton.tsx
"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserStatus } from "@/hooks/useUserStatus";

const calculateRemainingDays = (endDate: Date | null): number => {
  if (!endDate) return 0;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const UpgradeButton = () => {
  const { status, subscriptionEndDate, isLoading } = useUserStatus();

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[130px]">
        ...
      </Button>
    );
  }

  // 買い切りユーザーの場合
  if (status === "lifetime") {
    return (
      <Button variant="outline" disabled className="w-[130px]">
        <Crown className="mr-2 h-4 w-4 text-yellow-500" /> Pro
      </Button>
    );
  }

  // サブスクユーザーの場合
  if (status === "subscribed") {
    const remainingDays = calculateRemainingDays(subscriptionEndDate);
    return (
      <Button asChild className="w-[130px] h-auto flex-col items-center py-1.5">
        <Link href="/upgrade">
          <div className="flex items-center">
            <Crown className="mr-2 h-4 w-4 text-yellow-500" /> Pro{" "}
            <span className="text-xs ml-1">(Sub)</span>
          </div>
          <div className="text-xs mt-0.5">残り {remainingDays} 日</div>
        </Link>
      </Button>
    );
  }

  // 一般ユーザーの場合の表示
  return (
    <Button asChild className="w-[130px]">
      <Link href="/upgrade">アップグレード</Link>
    </Button>
  );
};
