// front/components/TestModeNotice.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const TestModeNotice = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-10 right-4 bg-yellow-100 hover:bg-yellow-200"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          テストモードについて
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            テスト用カード情報
          </DialogTitle>
          <DialogDescription className="pt-2 text-left text-red-600 font-semibold mb-4">
            これはテスト環境です。実際のカード番号は入力しないでください。
          </DialogDescription>
        </DialogHeader>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          以下のテスト用カード番号をご利用ください。
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
            成功するカード番号:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>** Visa: 4242 4242 4242 4242</li>
            <li>** Mastercard: 5454 5454 5454 5454</li>
            <li>** 有効期限: 任意の将来の月/年（例: 12/25）</li>
            <li>** セキュリティコード: 任意の数値(例: 123)</li>
          </ul>
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mt-4 mb-2">
            失敗するカード番号:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>** 残高不足: 4000 0000 0000 0001</li>
            <li>** カード拒否: 4000 0000 0000 0002</li>
            <li>その他Stripeドキュメントを参照</li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
