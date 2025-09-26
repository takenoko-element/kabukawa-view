// front/app/upgrade/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserStatus } from "@/hooks/useUserStatus";
import { CheckoutWrapper } from "@/components/CheckoutWrapper";
import { UpgradeView } from "@/components/UpgradeView";
import { Plan } from "@/types";
import { SubscribedView } from "@/components/SubscribedView";

const UpgradePage = () => {
  const { status, isLoading, error } = useUserStatus();
  const [view, setView] = useState<"benefits" | "payment">("benefits");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("one_time");

  const handleProceed = (plan: Plan) => {
    setSelectedPlan(plan);
    setView("payment");
  };

  const handleUpgradeToOneTime = () => {
    setSelectedPlan("one_time");
    setView("payment");
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;
    }

    if (error) {
      return (
        <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold">エラーが発生しました</h2>
          <p className="mt-2 text-muted-foreground">
            ユーザー情報の取得に失敗しました。
          </p>
          <Button asChild className="mt-6">
            <Link href="/">トップページへ戻る</Link>
          </Button>
        </div>
      );
    }

    if (status === "lifetime") {
      return (
        <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold">
            既に買い切りプランにご登録済みです
          </h2>
          <Button asChild className="mt-6">
            <Link href="/">トップページへ戻る</Link>
          </Button>
        </div>
      );
    }

    if (view === "payment") {
      return (
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="w-full max-w-md">
            <CheckoutWrapper plan={selectedPlan} />
          </div>
        </div>
      );
    }

    if (status === "subscribed") {
      return (
        <div className="max-w-md mx-auto">
          <SubscribedView onUpgradeToOneTime={handleUpgradeToOneTime} />
        </div>
      );
    }

    // status === 'none'
    return (
      <div className="max-w-md mx-auto">
        <UpgradeView onProceed={handleProceed} />
      </div>
    );
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">{renderContent()}</div>
    </div>
  );
};

export default UpgradePage;
