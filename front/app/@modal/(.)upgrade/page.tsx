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
import { Plan } from "@/types";
import { SubscribedView } from "@/components/SubscribedView";
import { Button } from "@/components/ui/button";

const InterceptedUpgradePage = () => {
  const { status, isLoading } = useUserStatus();
  const [view, setView] = useState<"benefits" | "payment">("benefits");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("one_time");
  const router = useRouter();

  const handleClose = () => {
    // トップページに遷移することで、モーダルを閉じる
    router.back();
  };

  const handleProceedToPayment = (plan: Plan) => {
    setSelectedPlan(plan);
    setView("payment");
  };

  // 表示するコンポーネントがカード型か、シンプルなダイアログかを判定
  const isCardView = !isLoading && status !== "lifetime";

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className={
          isCardView
            ? "p-0 border-0 bg-transparent shadow-none w-full max-w-md"
            : "w-full max-w-md"
        }
        onPointerDownOutside={(e) => {
          if (view === "payment") {
            e.preventDefault();
          }
        }}
      >
        {isLoading && (
          <>
            <DialogHeader>
              <DialogTitle>読み込み中...</DialogTitle>
            </DialogHeader>
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            </div>
          </>
        )}

        {!isLoading && status === "lifetime" && (
          <>
            <DialogHeader>
              <DialogTitle>Pro会員です</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-2 text-center">
              <p>すでに買い切りプランにご登録済みです。</p>
              <Button onClick={handleClose} className="mt-6 w-full">
                閉じる
              </Button>
            </div>
          </>
        )}

        {!isLoading && status !== "lifetime" && (
          <>
            <DialogTitle className="sr-only">
              {view === "payment"
                ? "お支払い"
                : status === "subscribed"
                ? "プラン管理"
                : "アップグレード"}
            </DialogTitle>

            {view === "payment" ? (
              <CheckoutWrapper plan={selectedPlan} />
            ) : status === "subscribed" ? (
              <SubscribedView
                onUpgradeToOneTime={() => handleProceedToPayment("one_time")}
              />
            ) : (
              // status === 'none'
              <UpgradeView onProceed={handleProceedToPayment} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterceptedUpgradePage;
