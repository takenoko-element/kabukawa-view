// front/app/(.)upgrade/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/config";
import { UpgradeView } from "@/components/UpgradeView";
import { ModalWrapper } from "@/components/ModalWrapper";

const fetchUserStatus = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  const { data } = await axios.get(`${API_URL}/api/user-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const InterceptedUpgradePage = () => {
  const { getToken, isSignedIn } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["userStatus"],
    queryFn: () => fetchUserStatus(getToken),
    enabled: !!isSignedIn,
  });

  return (
    <ModalWrapper>
      {isLoading && (
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
      )}
      {data && !data.is_premium && <UpgradeView isCheckingStatus={isLoading} />}
      {/* 既にプレミアムの場合やエラーの場合はモーダル自体が空になる */}
    </ModalWrapper>
  );
};

export default InterceptedUpgradePage;
