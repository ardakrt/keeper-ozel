"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "!bg-white dark:!bg-[#09090b] !border !border-zinc-200 dark:!border-white/10 !text-zinc-900 dark:!text-white !rounded-xl !shadow-2xl !p-4 !text-sm !font-medium",
        duration: 4000,
        success: {
          iconTheme: {
            primary: "#10b981", // emerald-500
            secondary: "white",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // red-500
            secondary: "white",
          },
        },
        loading: {
          iconTheme: {
            primary: "#3b82f6", // blue-500
            secondary: "white",
          },
        },
        style: {
          maxWidth: "400px",
        },
      }}
    />
  );
}
