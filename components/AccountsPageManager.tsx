"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountList from "@/components/AccountList";
import NewAccountForm from "@/components/NewAccountForm";

type Account = {
  id?: string | number;
  uuid?: string;
  service_name?: string | null;
  service?: string | null;
  username?: string | null;
  username_enc?: string | null;
  bt_token_id_password?: string | null;
};

interface AccountsPageManagerProps {
  accounts: Account[];
  onRefresh?: () => void;
  onViewChange?: (view: "list" | "create") => void;
}

const AccountsPageManager = forwardRef(({ accounts, onRefresh, onViewChange }: AccountsPageManagerProps, ref) => {
  const [view, setView] = useState<"list" | "create">("list");

  useImperativeHandle(ref, () => ({
    triggerCreate: () => {
      setView("create");
      onViewChange?.("create");
    },
    triggerList: () => {
      setView("list");
      onViewChange?.("list");
    }
  }));

  const handleAccountCreated = () => {
    setView("list");
    onViewChange?.("list");
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancel = () => {
    setView("list");
    onViewChange?.("list");
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <AccountList accounts={accounts} onRefresh={onRefresh} />
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
            <NewAccountForm
              onAccountCreated={handleAccountCreated}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AccountsPageManager.displayName = "AccountsPageManager";

export default AccountsPageManager;
