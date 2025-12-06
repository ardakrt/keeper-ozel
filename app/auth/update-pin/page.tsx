"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateUserPin } from "@/app/actions";

export default function UpdatePinPage() {
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
    // Ekstra parametre: Sadece PIN hash'ini güncelle
    formData.append("update_auth_password", "false");

    try {
      // Server action ile PIN'i güncelle
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
      <div className="min-h-screen w-full relative bg-white dark:bg-black overflow-hidden flex items-center justify-center">
        {/* Ambient Backgrounds - Success State */}
        <div
          className="absolute inset-0 z-0 dark:hidden"
          style={{
            backgroundImage: "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)",
            backgroundSize: "100% 100%",
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden dark:block"
          style={{
            background: "radial-gradient(150% 150% at 50% 100%, #000000 40%, #299690ff 100%)"
          }}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-8 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">PIN Güncellendi!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Yeni PIN kodunuz başarıyla oluşturuldu. Yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Light Mode Background */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)",
          backgroundSize: "100% 100%",
        }}
      />
      {/* Dark Mode Background */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: "radial-gradient(150% 150% at 50% 100%, #000000 40%, #299690ff 100%)"
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-center text-zinc-900 dark:text-white mb-2">
            Yeni PIN Belirle
          </h1>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Güvenliğiniz için 6 haneli yeni bir kod oluşturun.
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
                  placeholder="Yeni PIN"
                  className="w-full h-14 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center text-lg font-medium tracking-widest"
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
                  className="w-full h-14 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center text-lg font-medium tracking-widest"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMessage}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || pin.length !== 6 || confirmPin.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
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