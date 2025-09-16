// front/app/(.)upgrade/page.tsx
"use client";

import { Loader2 } from "lucide-react";

import { UpgradeView } from "@/components/UpgradeView";
import { ModalWrapper } from "@/components/ModalWrapper";
import { useUserStatus } from "@/hooks/useUserStatus";

const InterceptedUpgradePage = () => {
  const { isPremium, isLoading } = useUserStatus();

  return (
    <ModalWrapper>
      {isLoading && (
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
      )}
      {!isLoading && !isPremium && <UpgradeView isCheckingStatus={isLoading} />}
      {/* 既にプレミアムの場合やエラーの場合はモーダル自体が空になる */}
    </ModalWrapper>
  );
};

export default InterceptedUpgradePage;
