// front/app/(.)upgrade/success/page.tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModalWrapper } from "@/components/ModalWrapper";

const SuccessView = () => (
  <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
    <DialogHeader className="space-y-2 mt-6 text-center">
      <DialogTitle asChild>
        <h1 className="text-3xl font-bold">アップグレード完了</h1>
      </DialogTitle>
      <p className="text-lg text-muted-foreground">ありがとうございます。</p>
    </DialogHeader>
    <Button asChild size="lg" className="mt-6 w-full">
      <Link href="/">ダッシュボードへ戻る</Link>
    </Button>
  </div>
);

const InterceptedSuccessPage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["userStatus"] });
  }, [queryClient]);

  return (
    <ModalWrapper>
      <SuccessView />
    </ModalWrapper>
  );
};

export default InterceptedSuccessPage;
