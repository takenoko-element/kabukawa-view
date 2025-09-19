// front/app/@modal/(.)upgrade/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStatus } from "@/hooks/useUserStatus";
import { CheckoutWrapper } from "@/components/CheckoutWrapper";
import { UpgradeView } from "@/components/UpgradeView";

const InterceptedUpgradePage = () => {
  const { isPremium, isLoading } = useUserStatus();
  const [view, setView] = useState<"benefits" | "payment">("benefits");
  const router = useRouter();

  const handleClose = () => {
    // トップページに遷移することで、モーダルを閉じる
    router.back();
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        // 閉じる操作（'x'ボタン、オーバーレイクリックなど）が行われたら
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-full max-w-md">
        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
          </div>
        )}
        {!isLoading && !isPremium && (
          <>
            {view === "benefits" && (
              <DialogHeader>
                <DialogTitle>
                  <UpgradeView onProceed={() => setView("payment")} />
                </DialogTitle>
              </DialogHeader>
            )}
            {view === "payment" && <CheckoutWrapper />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterceptedUpgradePage;
