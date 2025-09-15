// front/components/ModalWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-full max-w-md">
        {children}
      </DialogContent>
    </Dialog>
  );
}
