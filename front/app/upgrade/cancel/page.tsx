// front/app/upgrade/cancel/page.tsx
"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const CancelView = () => (
  <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
    <XCircle className="mx-auto h-16 w-16 text-destructive" />
    <div className="space-y-2 mt-6">
      <h1 className="text-3xl font-bold">決済がキャンセルされました</h1>
      <p className="text-lg text-muted-foreground">
        手続きは完了していません。
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <Button asChild size="lg" variant="outline" className="w-full">
        <Link href="/upgrade">もう一度試す</Link>
      </Button>
      <Button asChild size="lg" className="w-full">
        <Link href="/">ダッシュボードへ戻る</Link>
      </Button>
    </div>
  </div>
);

const UpgradeCancelPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="w-full max-w-md">
        <CancelView />
      </div>
    </div>
  );
};

export default UpgradeCancelPage;
