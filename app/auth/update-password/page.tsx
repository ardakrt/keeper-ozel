"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateUserPin } from "@/app/actions";

export default function UpdatePasswordPage() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setter(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 6) {
      setErrorMessage("PIN kodu 6 haneli olmalıdır.");
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage("PIN kodları eşleşmiyor.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("new_pin", pin);
    formData.append("confirm_pin", confirmPin);

    try {
      // Server action ile PIN'i güncelle (Auth Password + DB Hash)
      await updateUserPin(formData);
      setStatus("success");
      
      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage("PIN güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-white/10 p-8 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">PIN Güncellendi!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Yeni PIN kodunuzla başarıyla giriş yapıldı. Yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-white/10 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">
            Yeni PIN Belirle
          </h1>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-8">
            Giriş yapmak için yeni 6 haneli PIN kodunuzu belirleyin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* PIN */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => handlePinChange(e, setPin)}
                  placeholder="Yeni PIN (6 hane)"
                  className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>

              {/* Confirm PIN */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => handlePinChange(e, setConfirmPin)}
                  placeholder="PIN Tekrar"
                  className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || pin.length !== 6 || confirmPin.length !== 6}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "PIN'i Güncelle"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
