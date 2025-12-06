import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { RefObject } from "react";

interface Step2FAProps {
  type: "pushWaiting" | "verificationInput";
  email: string;
  pin: string[];
  pinRefs: RefObject<HTMLInputElement | null>[];
  status: "idle" | "checking" | "success" | "error";
  error: string | null;
  timeRemaining: number;
  resendStatus: string | null;
  onPinChange: (index: number, value: string) => void;
  onPinKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerification: () => void;
  onResend: () => void;
  onCancel: () => void;
  variants: any;
  itemVariants: any;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Step2FA({
  type,
  email,
  pin,
  pinRefs,
  status,
  error,
  timeRemaining,
  resendStatus,
  onPinChange,
  onPinKeyDown,
  onPaste,
  onVerification,
  onResend,
  onCancel,
  variants,
  itemVariants
}: Step2FAProps) {
  if (type === "pushWaiting") {
    return (
      <motion.div
        key="pushWaiting"
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8"
      >
        {/* Animated Phone Icon */}
        <motion.div variants={itemVariants} className="flex flex-col items-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="w-24 h-24 bg-emerald-500/10 border-4 border-emerald-500/30 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </motion.div>
            <motion.div
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Mobil Onay Bekleniyor
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Lütfen telefonunuzdan giriş isteğini onaylayın
            </p>
          </div>

          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-12 h-12 border-4 border-zinc-200 dark:border-white/10 border-t-emerald-500 rounded-full"
          />

          {/* Timer */}
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm font-mono font-semibold">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Info Text */}
          <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center max-w-xs">
            İstek 5 dakika içinde otomatik olarak iptal edilecek
          </p>
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

        {/* Cancel Button */}
        <motion.button
          variants={itemVariants}
          type="button"
          onClick={onCancel}
          className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-transparent border-2 border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white hover:border-red-500/50 hover:bg-red-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          İsteği İptal Et
        </motion.button>

        {/* Back to Login */}
        <motion.p variants={itemVariants} className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          PIN ile giriş yapmak için{" "}
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300 font-medium transition-colors underline"
          >
            buraya tıklayın
          </button>
        </motion.p>
      </motion.div>
    );
  }

  // verificationInput mode
  return (
    <motion.div
      key="verificationInput"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <div className="w-20 h-20 bg-emerald-500/10 border-4 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          E-posta Doğrulama
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {email} adresine gönderilen 6 haneli kodu girin.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col items-center space-y-6">
        <div
          className={`flex justify-center gap-2 transition-transform ${status === "error" ? "animate-shake" : ""
            }`}
          style={status === "error" ? { animation: "shake 0.5s ease-in-out" } : undefined}
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
                type="text"
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

      <motion.button
        variants={itemVariants}
        onClick={onVerification}
        disabled={status === "checking" || status === "success" || pin.join("").length !== 6}
        className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === "checking" ? "Doğrulanıyor..." : status === "success" ? "Başarılı!" : "Doğrula"}
      </motion.button>

      <motion.div variants={itemVariants} className="text-center mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={onResend}
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          Kodu tekrar gönder
        </button>
        
        {resendStatus && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs font-medium text-emerald-500"
          >
            {resendStatus}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
