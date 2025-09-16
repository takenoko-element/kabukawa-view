// front/components/UpgradeButton.tsx
"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserStatus } from "@/hooks/useUserStatus";

export const UpgradeButton = () => {
  const { isPremium, isLoading } = useUserStatus();

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[130px]">
        ...
      </Button>
    );
  }

  // プレミアムユーザーの場合の表示
  if (isPremium) {
    return (
      <Button variant="outline" disabled className="w-[130px]">
        <Crown className="mr-2 h-4 w-4 text-yellow-500" /> Pro
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
