// front/components/SubscribedView.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL } from "@/constants/config";
import { useUserStatus } from "@/hooks/useUserStatus";

type Props = {
  onUpgradeToOneTime: () => void;
};

const cancelSubscription = async (token: string | null) => {
  if (!token) {
    throw new Error("Authentication token not found.");
  }
  await axios.post(
    `${API_URL}/api/cancel-subscription`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const SubscribedView = ({ onUpgradeToOneTime }: Props) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { cancelAtPeriodEnd, subscriptionEndDate } = useUserStatus();

  const mutation = useMutation({
    mutationFn: () => getToken().then(cancelSubscription),
    onSuccess: () => {
      toast.success("サブスクリプションの解約を予約しました。");
      queryClient.invalidateQueries({ queryKey: ["userStatus"] });
      setIsCancelDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? error.response.data.detail
          : "サブスクリプションの解約に失敗しました。";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="rounded-lg border bg-card p-6 text-foreground shadow-lg text-center">
      <h2 className="text-2xl font-bold">プラン管理</h2>
      <p className="text-muted-foreground mt-2 mb-6">
        {cancelAtPeriodEnd && subscriptionEndDate
          ? `${subscriptionEndDate.toLocaleDateString()}に解約予定です。`
          : "現在サブスクリプションプランをご利用中です。"}
      </p>

      <div className="flex flex-col gap-4">
        <Button onClick={onUpgradeToOneTime} size="lg">
          買い切りプランにアップグレード
        </Button>

        {!cancelAtPeriodEnd && (
          <Dialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg">
                サブスクリプションを解約
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>本当に解約しますか？</DialogTitle>
                <DialogDescription className="pt-2">
                  サブスクリプションを解約すると、現在の請求期間の終了後、Proの機能が利用できなくなります。この操作は元に戻せません。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(false)}
                  disabled={mutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  解約を予約する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
