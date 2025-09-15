// front/components/UpgradeView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_URL } from "@/constants/config";

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center">
    <svg
      className="mr-2 h-5 w-5 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
    <span>{children}</span>
  </li>
);

export const UpgradeView = ({
  isCheckingStatus,
}: {
  isCheckingStatus: boolean;
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsRedirecting(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/api/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(response.data.url);
    } catch (err) {
      console.error("決済ページへのリダイレクトに失敗しました。", err);
      setIsRedirecting(false);
    }
  };

  // 親コンポーネントでラップされるため、ローディングやエラー、プレミアム状態のUIは返さない
  if (isCheckingStatus) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-8 text-center shadow-lg">
      <DialogHeader className="text-center">
        <DialogTitle asChild>
          <h1 className="text-3xl font-bold tracking-tight">
            KABUKAWA View Pro
          </h1>
        </DialogTitle>
        <p className="mt-4 text-muted-foreground">
          プレミアムプランにアップグレードして、全ての機能を開放しましょう。
        </p>
      </DialogHeader>
      <div className="my-8">
        <span className="text-5xl font-extrabold">¥500</span>
        <span className="ml-2 text-xl font-medium text-muted-foreground">
          / 買い切り
        </span>
      </div>
      <ul className="space-y-3 text-left">
        <ListItem>機能1: 広告の非表示</ListItem>
        <ListItem>機能2: 保存できるレイアウト数の増加</ListItem>
        <ListItem>機能3: 優先的なサポート</ListItem>
      </ul>
      <Button
        onClick={handleUpgrade}
        disabled={isRedirecting}
        className="mt-8 w-full"
        size="lg"
      >
        {isRedirecting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        アップグレードする
      </Button>
    </div>
  );
};
