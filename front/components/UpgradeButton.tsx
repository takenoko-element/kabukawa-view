// front/components/UpgradeButton.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/config";

// ユーザーのプレミアム状態を取得する関数
const fetchUserStatus = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  // トークンがない（未ログイン）場合は、プレミアムではないと判断
  if (!token) return { is_premium: false };

  const { data } = await axios.get(`${API_URL}/api/user-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const UpgradeButton = () => {
  const { getToken, isSignedIn } = useAuth();
  const { data: userStatus, isLoading } = useQuery({
    queryKey: ["userStatus"],
    queryFn: () => fetchUserStatus(getToken),
    enabled: !!isSignedIn, // ログインしている場合のみクエリを実行
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを有効にする
  });

  if (isLoading || !isSignedIn) {
    return (
      <Button variant="outline" className="w-[130px]">
        ...
      </Button>
    );
  }

  // プレミアムユーザーの場合の表示
  if (userStatus?.is_premium) {
    return (
      <Button variant="outline" disabled className="w-[130px]">
        <Crown className="mr-2 h-4 w-4 text-yellow-500" /> Pro
      </Button>
    );
  }

  // 一般ユーザーの場合の表示
  return (
    <Button asChild className="w-[130px]">
      <Link href="/upgrade">アップグレード</Link>
    </Button>
  );
};
