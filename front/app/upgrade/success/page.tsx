// front/app/upgrade/success/page.tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

const SuccessView = () => (
  <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
    <div className="space-y-2 mt-6">
      <h1 className="text-3xl font-bold">アップグレード完了</h1>
      <p className="text-lg text-muted-foreground">
        プレミアムプランへのご登録、誠にありがとうございます。
      </p>
    </div>
  </div>
);

const UpgradeSuccessPage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["userStatus"] });
  }, [queryClient]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <SuccessView />
      <Button asChild size="lg" className="w-full max-w-md">
        <Link href="/">ダッシュボードへ戻る</Link>
      </Button>
    </div>
  );
};

export default UpgradeSuccessPage;
