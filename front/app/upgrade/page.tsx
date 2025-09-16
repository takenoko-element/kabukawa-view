// front/app/upgrade/page.tsx
"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UpgradeView } from "@/components/UpgradeView";
import { useUserStatus } from "@/hooks/useUserStatus";

const UpgradePage = () => {
  const { isPremium, isLoading, error } = useUserStatus();

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}

        {error && (
          <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold">エラーが発生しました</h2>
            <p className="mt-2 text-muted-foreground">
              ユーザー情報の取得に失敗しました。
            </p>
            <Button asChild className="mt-6">
              <Link href="/">トップページへ戻る</Link>
            </Button>
          </div>
        )}

        {!isLoading && isPremium && (
          <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold">
              既にプレミアムプランにご登録済みです
            </h2>
            <Button asChild className="mt-6">
              <Link href="/">トップページへ戻る</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isPremium && (
          <UpgradeView isCheckingStatus={isLoading} />
        )}

        {!isLoading && (
          <Button variant="ghost" className="mt-2 w-full" asChild>
            <Link href="/">トップページへ戻る</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default UpgradePage;
