// front/hooks/useUserStatus.ts
"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_URL } from "@/constants/config";

// ユーザーのプレミアム状態を取得するAPI関数
const fetchUserStatus = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  // 未ログイン時はデフォルトで非プレミアム状態とする
  if (!token) return { is_premium: false };

  const { data } = await axios.get(`${API_URL}/api/user-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
    isPremium: data?.is_premium || false,
    isLoading,
    error,
  };
};
