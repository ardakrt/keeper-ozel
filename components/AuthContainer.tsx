"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthContainerProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  hideTabs?: boolean;
}

export default function AuthContainer({ children, showBackButton = false, onBackClick, hideTabs = false }: AuthContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-black">
      {/* Light Mode Background - Only visible in light mode */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)",
          backgroundSize: "100% 100%",
        }}
      />
      {/* Dark Mode Background - Only visible in dark mode */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: (isLogin || isRegister)
            ? "radial-gradient(150% 150% at 50% 100%, #000000 40%, #299690ff 100%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.25), transparent 70%), #000000",
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >

          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 shadow-2xl"
          >
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="absolute top-6 left-6 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Geri"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Switch / Tabs */}
            {!hideTabs && (
              <div className="bg-zinc-100 dark:bg-white/5 p-1 rounded-xl flex mb-8 relative">
                <Link
                  href="/login"
                  className={`flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all relative z-10 ${
                    isLogin
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className={`flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all relative z-10 ${
                    isRegister
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
