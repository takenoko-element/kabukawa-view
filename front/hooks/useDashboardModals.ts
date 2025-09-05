// front/hooks/useDashboardModals.ts
import { useState } from "react";

export const useDashboardModals = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return {
    isSettingsModalOpen,
    isSearchModalOpen,
    openSettingsModal: () => setIsSettingsModalOpen(true),
    closeSettingsModal: () => setIsSettingsModalOpen(false),
    openSearchModal: () => setIsSearchModalOpen(true),
    closeSearchModal: () => setIsSearchModalOpen(false),
  };
};
