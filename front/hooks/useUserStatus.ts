// front/hooks/useUserStatus.ts
"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_URL } from "@/constants/config";

// APIからのレスポンスの型を定義
type UserStatusResponse = {
  status: "none" | "subscribed" | "lifetime";
  subscription_end_date?: string;
};

// ユーザーのプレミアム状態を取得するAPI関数
const fetchUserStatus = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) {
    return { status: "none", subscription_end_date: undefined };
  }

  const { data } = await axios.get<UserStatusResponse>(
    `${API_URL}/api/user-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

/**
 * ユーザーのプレミアム状態を取得・管理するカスタムフック
 */
export const useUserStatus = () => {
  const { getToken, isSignedIn } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userStatus"],
    queryFn: () => fetchUserStatus(getToken),
    enabled: !!isSignedIn, // ログインしている場合のみクエリを実行
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを有効にする
  });

  return {
    status: data?.status ?? "none",
    subscriptionEndDate: data?.subscription_end_date
      ? new Date(data.subscription_end_date)
      : null,
    isLoading,
    error,
    isPremium: data?.status === "lifetime" || data?.status === "subscribed",
  };
};
