"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/app/auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);

    const result = await resetPassword(formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-white/10 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="p-8">
          <div className="mb-8">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Giriş sayfasına dön
            </Link>
            
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Şifrenizi mi unuttunuz?
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Hesabınıza bağlı e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white">E-posta Gönderildi!</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Lütfen {email} adresindeki gelen kutunuzu (ve spam klasörünü) kontrol edin.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-medium text-sm hover:opacity-90 transition-opacity mt-4"
                >
                  Tamam
                </Link>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-medium text-zinc-900 dark:text-zinc-300 uppercase tracking-wide">
                    E-posta Adresi
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sıfırlama Bağlantısı Gönder"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
