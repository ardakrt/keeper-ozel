"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardList from "@/components/CardList";
import NewCardForm from "@/components/NewCardForm";
import { useModalStore } from "@/lib/store/useModalStore";
import type { CardDisplay } from "@/types/card";

interface CardsPageManagerProps {
  cards: CardDisplay[];
  onRefresh?: () => void;
  onViewChange?: (view: "list" | "create") => void;
}

const CardsPageManager = forwardRef(({ cards, onRefresh, onViewChange }: CardsPageManagerProps, ref) => {
  const [view, setView] = useState<"list" | "create">("list");
  const isAddCardModalOpen = useModalStore((state) => state.isAddCardModalOpen);
  const openAddCardModal = useModalStore((state) => state.openAddCardModal);
  const closeAddCardModal = useModalStore((state) => state.closeAddCardModal);

  useImperativeHandle(ref, () => ({
    triggerCreate: () => {
      openAddCardModal();
    }
  }));

  useEffect(() => {
    if (isAddCardModalOpen) {
      setView("create");
      onViewChange?.("create");
    } else {
      setView("list");
      onViewChange?.("list");
    }
  }, [isAddCardModalOpen, onViewChange]);

  const handleCardCreated = () => {
    closeAddCardModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancel = () => {
    closeAddCardModal();
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!isAddCardModalOpen ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CardList cards={cards} onRefresh={onRefresh} />
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <NewCardForm
              alwaysOpen={true}
              onCardCreated={handleCardCreated}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CardsPageManager.displayName = "CardsPageManager";

export default CardsPageManager;
