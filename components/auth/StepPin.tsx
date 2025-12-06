import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { RefObject } from "react";

interface StepPinProps {
  avatarUrl: string | null;
  userName: string | null;
  greeting: string;
  pin: string[];
  pinRefs: RefObject<HTMLInputElement | null>[];
  status: "idle" | "checking" | "success" | "error";
  error: string | null;
  onPinChange: (index: number, value: string) => void;
  onPinKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onLogin: () => void;
  onReset: () => void;
  variants: any;
  itemVariants: any;
}

function capitalizeFirstLetter(name: string): string {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function StepPin({
  avatarUrl,
  userName,
  greeting,
  pin,
  pinRefs,
  status,
  error,
  onPinChange,
  onPinKeyDown,
  onPaste,
  onLogin,
  onReset,
  variants,
  itemVariants
}: StepPinProps) {
  return (
    <motion.div
      key="pinInput"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Avatar - Minimal ve Kişisel */}
      <motion.div variants={itemVariants} className="flex flex-col items-center space-y-6">
        <div className="w-32 h-32 bg-zinc-100 dark:bg-white/5 border-4 border-zinc-300 dark:border-white/10 rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-zinc-400 dark:text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>

        {/* Kişisel Selamlama */}
        {userName && (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-xl font-medium text-zinc-900 dark:text-white/90 text-center">
              {greeting}, {userName}
            </p>
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Yoksa {capitalizeFirstLetter(userName)} değil misin?
            </button>
          </div>
        )}

        {/* PIN Input Kutucukları - Modern ve Şık */}
        <div
          className={`flex justify-center gap-2 transition-transform ${status === "error" ? "animate-shake" : ""
            }`}
          style={
            status === "error"
              ? {
                animation: "shake 0.5s ease-in-out",
              }
              : undefined
          }
        >
          {pin.map((digit, index) => {
            let statusClasses = "";
            if (status === "success") {
              statusClasses = "border-green-500 text-green-500 ring-2 ring-green-500/50";
            } else if (status === "error") {
              statusClasses = "border-red-500 text-red-500 ring-2 ring-red-500/50";
            } else if (status === "checking") {
              statusClasses = "opacity-50 cursor-not-allowed";
            } else {
              statusClasses = "";
            }

            return (
              <input
                key={index}
                ref={pinRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onPinChange(index, e.target.value)}
                onKeyDown={(e) => onPinKeyDown(index, e)}
                onPaste={onPaste}
                disabled={status === "checking" || status === "success"}
                className={`w-10 h-14 bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/50 focus:bg-zinc-50 dark:focus:bg-white/10 transition-all duration-300 ${statusClasses}`}
              />
            );
          })}
        </div>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Giriş Yap Butonu */}
      <motion.button
        variants={itemVariants}
        onClick={onLogin}
        disabled={status === "checking" || status === "success" || pin.join("").length !== 6}
        className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === "checking" ? "Giriş yapılıyor..." : status === "success" ? "Başarılı!" : "Giriş Yap"}
      </motion.button>

      {/* PIN Unuttum Linki */}
      <motion.div variants={itemVariants} className="text-center mt-2">
        <Link href="/forgot-pin" className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
          PIN kodumu unuttum
        </Link>
      </motion.div>
    </motion.div>
  );
}
