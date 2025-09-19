// front/app/@modal/(.)upgrade/success/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const InterceptedSuccessPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // ユーザー情報を再取得してヘッダーの表示などを更新
    queryClient.invalidateQueries({ queryKey: ["userStatus"] });
  }, [queryClient]);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // アニメーションが終わるのを少し待ってから遷移
      setTimeout(() => {
        router.push("/");
      }, 150);
    }
  }, [isOpen, router]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <DialogHeader className="space-y-2 mt-6 text-center">
            <DialogTitle asChild>
              <h1 className="text-3xl font-bold">アップグレード完了</h1>
            </DialogTitle>
            <p className="text-lg text-muted-foreground">
              ありがとうございます。
            </p>
          </DialogHeader>
          <Button onClick={handleClose} size="lg" className="mt-6 w-full">
            ダッシュボードへ戻る
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterceptedSuccessPage;
