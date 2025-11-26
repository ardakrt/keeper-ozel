"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IbanList from "@/components/IbanList";
import NewIbanForm from "@/components/NewIbanForm";
import { useModalStore } from "@/lib/store/useModalStore";

type Iban = {
  id?: string | number;
  label?: string | null;
  iban?: string | null;
  bank_name?: string | null;
};

interface IbansPageManagerProps {
  ibans: Iban[];
  onRefresh?: () => void;
  onViewChange?: (view: "list" | "create") => void;
}

const IbansPageManager = forwardRef(({ ibans, onRefresh, onViewChange }: IbansPageManagerProps, ref) => {
  const [view, setView] = useState<"list" | "create">("list");
  const isAddIbanModalOpen = useModalStore((state) => state.isAddIbanModalOpen);
  const openAddIbanModal = useModalStore((state) => state.openAddIbanModal);
  const closeAddIbanModal = useModalStore((state) => state.closeAddIbanModal);

  useImperativeHandle(ref, () => ({
    triggerCreate: () => {
      openAddIbanModal();
    }
  }));

  useEffect(() => {
    if (isAddIbanModalOpen) {
      setView("create");
      onViewChange?.("create");
    } else {
      setView("list");
      onViewChange?.("list");
    }
  }, [isAddIbanModalOpen, onViewChange]);

  const handleIbanCreated = () => {
    closeAddIbanModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancel = () => {
    closeAddIbanModal();
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!isAddIbanModalOpen ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <IbanList ibans={ibans} onRefresh={onRefresh} />
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
            <NewIbanForm
              onIbanCreated={handleIbanCreated}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

IbansPageManager.displayName = "IbansPageManager";

export default IbansPageManager;
