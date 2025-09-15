// front/app/(.)upgrade/cancel/page.tsx
"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModalWrapper } from "@/components/ModalWrapper";

const CancelView = () => (
  <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
    <XCircle className="mx-auto h-16 w-16 text-destructive" />
    <DialogHeader className="space-y-2 mt-6 text-center">
      <DialogTitle asChild>
        <h1 className="text-3xl font-bold">決済がキャンセルされました</h1>
      </DialogTitle>
      <p className="text-lg text-muted-foreground">
        いつでもアップグレードをお待ちしております。
      </p>
    </DialogHeader>
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

const InterceptedCancelPage = () => {
  return (
    <ModalWrapper>
      <CancelView />
    </ModalWrapper>
  );
};

export default InterceptedCancelPage;
