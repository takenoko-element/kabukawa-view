// front/app/upgrade/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/config";
import { UpgradeView } from "@/components/UpgradeView";

const fetchUserStatus = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  const { data } = await axios.get(`${API_URL}/api/user-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const UpgradePage = () => {
  const { getToken, isSignedIn } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["userStatus"],
    queryFn: () => fetchUserStatus(getToken),
    enabled: !!isSignedIn,
    retry: false,
  });

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}

        {error && (
          <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold">エラーが発生しました</h2>
            <p className="mt-2 text-muted-foreground">
              ユーザー情報の取得に失敗しました。
            </p>
            <Button asChild className="mt-6">
              <Link href="/">トップページへ戻る</Link>
            </Button>
          </div>
        )}

        {data?.is_premium && (
          <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold">
              既にプレミアムプランにご登録済みです
            </h2>
            <Button asChild className="mt-6">
              <Link href="/">トップページへ戻る</Link>
            </Button>
          </div>
        )}

        {data && !data.is_premium && (
          <UpgradeView isCheckingStatus={isLoading} />
        )}

        {!isLoading && (
          <Button variant="ghost" className="mt-2 w-full" asChild>
            <Link href="/">トップページへ戻る</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default UpgradePage;
